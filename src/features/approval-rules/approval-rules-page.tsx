import { Play, Scales, Trash, WarningCircle } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import type { ApprovalScope } from "@/api/approval-rules"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/auth/use-permissions"
import {
  useApprovalRules,
  useDeleteApprovalMatrix,
  useReplaceApprovalMatrix,
} from "@/hooks/approval-rules/use-approval-rules"
import { useCategories } from "@/hooks/categories/use-categories"
import { useMyCompany } from "@/hooks/companies/use-companies"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { useMembers } from "@/hooks/members/use-members"

import { CreateScopeDialog } from "./components/create-scope-dialog"
import { MatrixSkeleton } from "./components/matrix-skeleton"
import { RouteSimulator } from "./components/route-simulator"
import { SaveBar } from "./components/save-bar"
import { ScopeBanner } from "./components/scope-banner"
import { ScopeList } from "./components/scope-list"
import { TierLadder } from "./components/tier-ladder"
import {
  GLOBAL_SCOPE,
  describeScope,
  groupByScope,
  isGlobalScope,
  isMatrixEqual,
  isSameScope,
  scopeKey,
  seedTiers,
  toRanges,
  toTiers,
  validateTiers,
  type ScopeMatrix,
  type ScopeNames,
  type Tier,
} from "./matrix"

export function ApprovalRulesPage() {
  const [activeScope, setActiveScope] = useState<ApprovalScope>(GLOBAL_SCOPE)
  const [drafts, setDrafts] = useState<Record<string, Tier[]>>({})
  const [localScopes, setLocalScopes] = useState<ApprovalScope[]>([])
  const [creating, setCreating] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [removing, setRemoving] = useState<ApprovalScope | null>(null)
  const [match, setMatch] = useState<{ scopeKey: string; index: number } | null>(
    null,
  )

  const { canManage } = usePermissions()
  const readOnly = !canManage("approval-rules")

  const rulesQuery = useApprovalRules()
  const { data: company } = useMyCompany()
  const { data: costCenters = [] } = useCostCenters()
  const { data: categories = [] } = useCategories(true)
  const { data: members = [] } = useMembers()

  const replace = useReplaceApprovalMatrix()
  const remove = useDeleteApprovalMatrix()

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data])

  const names: ScopeNames = useMemo(
    () => ({
      costCenters: new Map(costCenters.map((item) => [item.id, item.name])),
      categories: new Map(categories.map((item) => [item.id, item.name])),
    }),
    [costCenters, categories],
  )

  const savedTiers = useMemo(() => {
    const byScope: Record<string, Tier[]> = {}

    for (const matrix of groupByScope(rules)) {
      byScope[scopeKey(matrix.scope)] = toTiers(matrix.rules)
    }

    return byScope
  }, [rules])

  const matrices: ScopeMatrix[] = useMemo(() => {
    const grouped = groupByScope(rules)
    const known = new Set(grouped.map((matrix) => scopeKey(matrix.scope)))

    if (!known.has(scopeKey(GLOBAL_SCOPE))) {
      grouped.unshift({ scope: GLOBAL_SCOPE, rules: [] })
      known.add(scopeKey(GLOBAL_SCOPE))
    }

    for (const scope of localScopes) {
      if (!known.has(scopeKey(scope))) {
        grouped.push({ scope, rules: [] })
      }
    }

    return grouped
  }, [rules, localScopes])

  const activeKey = scopeKey(activeScope)
  const activeSaved = savedTiers[activeKey] ?? []
  const activeTiers = drafts[activeKey] ?? activeSaved
  const activeProblems = validateTiers(activeTiers)

  const dirtyKeys = Object.keys(drafts).filter(
    (key) => !isMatrixEqual(drafts[key], savedTiers[key] ?? []),
  )

  const problemsByKey = dirtyKeys.map((key) => ({
    key,
    problems: validateTiers(drafts[key]),
  }))

  const problemCount = problemsByKey.reduce(
    (total, entry) => total + entry.problems.length,
    0,
  )

  const problemElsewhere = problemsByKey.find(
    (entry) => entry.problems.length > 0 && entry.key !== activeKey,
  )

  const dirtyKeySet = new Set(dirtyKeys)

  const highlightIndex =
    match && match.scopeKey === activeKey && !drafts[activeKey]
      ? match.index
      : undefined
  const dualThresholdCents = company?.dualApprovalThresholdCents ?? null

  function setActiveTiers(tiers: Tier[]) {
    setDrafts((previous) => ({ ...previous, [activeKey]: tiers }))
  }

  function scopeOfKey(key: string): ApprovalScope | undefined {
    return matrices.find((matrix) => scopeKey(matrix.scope) === key)?.scope
  }

  function discardAll() {
    setDrafts({})
    setLocalScopes([])

    if (localScopes.some((scope) => isSameScope(scope, activeScope))) {
      setActiveScope(GLOBAL_SCOPE)
    }
  }

  async function save() {
    const pending = dirtyKeys
      .map((key) => ({ key, scope: scopeOfKey(key) }))
      .filter((entry): entry is { key: string; scope: ApprovalScope } =>
        Boolean(entry.scope),
      )

    try {
      for (const entry of pending) {
        await replace.mutateAsync({
          ...entry.scope,
          ranges: toRanges(drafts[entry.key]),
        })
      }

      setDrafts({})
      toast.success(
        pending.length > 1
          ? `${pending.length} matrizes salvas.`
          : "Matriz salva. Vale para os pedidos abertos a partir de agora.",
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function confirmRemoval() {
    if (!removing) {
      return
    }

    const key = scopeKey(removing)
    const isLocalOnly = !savedTiers[key]

    const finish = () => {
      setDrafts((previous) => {
        const next = { ...previous }
        delete next[key]
        return next
      })
      setLocalScopes((previous) =>
        previous.filter((scope) => !isSameScope(scope, removing)),
      )
      setActiveScope(GLOBAL_SCOPE)
      setRemoving(null)
    }

    if (isLocalOnly) {
      finish()
      return
    }

    remove.mutate(removing, {
      onSuccess: () => {
        toast.success("Exceção removida. Esses pedidos voltam ao padrão da empresa.")
        finish()
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  if (rulesQuery.isPending) {
    return <MatrixSkeleton />
  }

  if (rulesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Matriz de alçadas" />
        <LoadError
          message={getApiErrorMessage(rulesQuery.error)}
          onRetry={() => void rulesQuery.refetch()}
        />
      </div>
    )
  }

  const globalMissing = (savedTiers[scopeKey(GLOBAL_SCOPE)] ?? []).length === 0

  const simulateAction = readOnly ? null : (
    <Button
      size="lg"
      variant="outline"
      onClick={() => setSimulating(true)}
      className="gap-1.5 bg-card font-medium"
    >
      <Play size={14} weight="fill" aria-hidden />
      Simular rota
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Matriz de alçadas"
        description="Define quem aprova cada pedido, pelo valor."
        action={simulateAction}
      />

      {globalMissing && !drafts[scopeKey(GLOBAL_SCOPE)] ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-warning/25 bg-warning/[0.07] px-4 py-3"
        >
          <WarningCircle
            size={17}
            className="shrink-0 text-warning-strong"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-caption leading-relaxed text-foreground">
            A empresa ainda não tem matriz padrão. Enquanto não tiver, nenhum
            pedido consegue ser enviado para aprovação.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <ScopeList
          matrices={matrices}
          names={names}
          activeScope={activeScope}
          dirtyKeys={dirtyKeySet}
          onSelect={setActiveScope}
          onCreate={readOnly ? undefined : () => setCreating(true)}
          className="hidden w-60 shrink-0 xl:flex"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ScopeBanner
            scope={activeScope}
            names={names}
            matrices={matrices}
            dirtyKeys={dirtyKeySet}
            onSelect={setActiveScope}
            onCreate={readOnly ? undefined : () => setCreating(true)}
            actions={
              !readOnly && !isGlobalScope(activeScope) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoving(activeScope)}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash size={13} aria-hidden />
                  Remover exceção
                </Button>
              ) : null
            }
          />

          {activeTiers.length === 0 ? (
            <EmptyState
              icon={Scales}
              tone={readOnly ? "neutral" : "warning"}
              title="Sem faixas definidas"
              description={
                readOnly
                  ? "Peça ao Admin Financeiro para definir as faixas desta matriz."
                  : isGlobalScope(activeScope)
                    ? "Enquanto o padrão da empresa não tiver faixas, nenhum pedido encontra aprovador."
                    : "Esta exceção ainda não tem faixas. Sem elas, os pedidos seguem o padrão da empresa."
              }
              action={
                readOnly ? undefined : (
                  <Button
                    size="lg"
                    onClick={() => setActiveTiers(seedTiers())}
                    className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
                  >
                    Definir faixas
                  </Button>
                )
              }
            />
          ) : (
            <TierLadder
              tiers={activeTiers}
              problems={activeProblems}
              dualThresholdCents={dualThresholdCents}
              highlightIndex={highlightIndex}
              readOnly={readOnly}
              onChange={setActiveTiers}
            />
          )}

          <SaveBar
            visible={dirtyKeys.length > 0}
            dirtyCount={dirtyKeys.length}
            problemCount={problemCount}
            problemElsewhere={
              problemElsewhere
                ? {
                    label:
                      describeScope(
                        scopeOfKey(problemElsewhere.key) ?? GLOBAL_SCOPE,
                        names,
                      ).title,
                    onFocus: () => {
                      const scope = scopeOfKey(problemElsewhere.key)
                      if (scope) {
                        setActiveScope(scope)
                      }
                    },
                  }
                : undefined
            }
            isPending={replace.isPending}
            onDiscard={discardAll}
            onSave={() => void save()}
          />
        </div>
      </div>

      <CreateScopeDialog
        open={creating}
        onOpenChange={setCreating}
        costCenters={costCenters}
        categories={categories}
        names={names}
        existingKeys={new Set(matrices.map((matrix) => scopeKey(matrix.scope)))}
        onCreate={(scope) => {
          const key = scopeKey(scope)
          const base = savedTiers[scopeKey(GLOBAL_SCOPE)] ?? []

          setLocalScopes((previous) => [...previous, scope])
          setDrafts((previous) => ({
            ...previous,
            [key]: base.length > 0 ? toTiers(rules.filter(isGlobalRule)) : seedTiers(),
          }))
          setActiveScope(scope)
          setCreating(false)
        }}
        onOpenExisting={(scope) => {
          setActiveScope(scope)
          setCreating(false)
        }}
      />

      <RouteSimulator
        open={simulating}
        onOpenChange={setSimulating}
        rules={rules}
        names={names}
        costCenters={costCenters}
        categories={categories}
        members={members}
        hasUnsavedChanges={dirtyKeys.length > 0}
        onMatch={setMatch}
      />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setRemoving(null)
          }
        }}
        title="Remover esta exceção?"
        description={
          removing
            ? `${describeScope(removing, names).title} deixa de ter matriz própria. Esses pedidos passam a seguir o padrão da empresa, e os que já estão em andamento não mudam de rota.`
            : ""
        }
        confirmLabel={remove.isPending ? "Removendo…" : "Remover exceção"}
        isPending={remove.isPending}
        onConfirm={confirmRemoval}
      />
    </div>
  )
}

function isGlobalRule(rule: { costCenterId: string | null; categoryId: string | null }) {
  return rule.costCenterId === null && rule.categoryId === null
}
