import { ArrowLeft, Check, Warning } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Member } from "@/api/members"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PersonPicker } from "@/components/shared/person-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDisableMember,
  useMemberResponsibilities,
  useMembers,
  useUpdateMemberLimit,
  useUpdateMemberManager,
  useUpdateMemberRole,
} from "@/hooks/members/use-members"
import { formatCents, toCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import {
  CompanyMemberRole,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/types/enums"

import { MemberCostCenters } from "./components/member-cost-centers"
import { MemberSummary } from "./components/member-summary"
import { MembersError } from "./components/members-error"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { TransferManagementDialog } from "./components/transfer-management-dialog"

const ROLES: CompanyMemberRole[] = [
  CompanyMemberRole.REQUESTER,
  CompanyMemberRole.APPROVER,
  CompanyMemberRole.FINANCE_ADMIN,
]

const LIMIT_PRESETS = ["500000", "2000000", "5000000"]

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const membersQuery = useMembers()
  const members = membersQuery.data ?? []
  const member = members.find((item) => item.id === id)

  if (membersQuery.isPending) {
    return <DetailSkeleton />
  }

  if (membersQuery.isError) {
    return (
      <MembersError
        message={getApiErrorMessage(membersQuery.error)}
        onRetry={() => void membersQuery.refetch()}
      />
    )
  }

  if (!member) {
    return (
      <MembersError
        title="Pessoa não encontrada"
        message="Ela pode ter sido inativada ou você não tem acesso a ela."
        onRetry={() => void navigate("/equipe")}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Você está em">
        <Link
          to="/equipe"
          className="group inline-flex items-center gap-1.5 text-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Equipe
        </Link>
      </nav>

      <MemberSummary member={member} members={members} />

      <SettingGroup title="Poder de decisão">
        <RoleRow member={member} />
        <LimitRow member={member} />
        <ManagerRow member={member} members={members} />
      </SettingGroup>

      <MemberCostCenters member={member} />

      <Responsibilities member={member} members={members} />

      <DangerZone member={member} members={members} />
    </div>
  )
}

function SavedHint({ saving }: { saving: boolean }) {
  if (!saving) {
    return null
  }

  return (
    <span className="text-caption text-muted-foreground">Salvando…</span>
  )
}

function RoleRow({ member }: { member: Member }) {
  const update = useUpdateMemberRole(member.id)

  return (
    <SettingRow
      label="Perfil"
      control={
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => {
            const selected = member.role === role

            return (
              <button
                key={role}
                type="button"
                disabled={update.isPending}
                title={ROLE_DESCRIPTIONS[role]}
                onClick={() =>
                  update.mutate(role, {
                    onSuccess: () => toast.success(`Perfil alterado para ${ROLE_LABELS[role]}.`),
                    onError: (error) => toast.error(getApiErrorMessage(error)),
                  })
                }
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-caption transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "border-primary/30 bg-primary/6 font-medium text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {selected ? <Check size={11} weight="bold" aria-hidden /> : null}
                {ROLE_LABELS[role]}
              </button>
            )
          })}
        </div>
      }
      status={update.isPending ? <SavedHint saving /> : undefined}
    />
  )
}

function LimitRow({ member }: { member: Member }) {
  const [amount, setAmount] = useState(() =>
    formatCents(member.approvalLimitCents),
  )
  const update = useUpdateMemberLimit(member.id)

  useEffect(() => {
    setAmount(formatCents(member.approvalLimitCents))
  }, [member.approvalLimitCents])

  const isFinanceAdmin = member.role === CompanyMemberRole.FINANCE_ADMIN
  const cents = toCents(amount)
  const changed = cents !== member.approvalLimitCents

  function save(next: string) {
    if (next === member.approvalLimitCents) {
      return
    }

    update.mutate(next, {
      onSuccess: () => toast.success(`Alçada definida em ${formatCents(next)}.`),
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setAmount(formatCents(member.approvalLimitCents))
      },
    })
  }

  if (isFinanceAdmin) {
    return (
      <SettingRow
        label="Aprova até"
        control={
          <p className="text-caption text-muted-foreground">
            O teto volta a valer se o perfil mudar para Aprovador.
          </p>
        }
      />
    )
  }

  return (
    <SettingRow
      label="Aprova até"
      control={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-36">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-caption text-muted-foreground">
              R$
            </span>
            <Input
              value={amount.replace(/^R\$\s?/, "")}
              onChange={(event) => setAmount(event.target.value)}
              onFocus={(event) => event.target.select()}
              onBlur={() => save(cents)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur()
                }
              }}
              disabled={update.isPending}
              inputMode="decimal"
              autoComplete="off"
              aria-label="Alçada em reais"
              className="h-8 pl-8 text-caption tabular-nums md:text-caption"
            />
          </div>

          {LIMIT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={update.isPending}
              onClick={() => {
                setAmount(formatCents(preset))
                save(preset)
              }}
              className="rounded px-1.5 py-0.5 text-caption tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
              {formatCents(preset)}
            </button>
          ))}

          <button
            type="button"
            disabled={update.isPending}
            onClick={() => {
              setAmount(formatCents("0"))
              save("0")
            }}
            className="text-caption text-muted-foreground underline decoration-border underline-offset-3 transition-colors hover:text-foreground disabled:opacity-50"
          >
            não aprova
          </button>
        </div>
      }
      status={
        update.isPending ? (
          <SavedHint saving />
        ) : changed ? (
          <p className="text-caption text-warning-strong">
            Pressione Enter ou clique fora para salvar.
          </p>
        ) : null
      }
    />
  )
}

function ManagerRow({
  member,
  members,
}: {
  member: Member
  members: Member[]
}) {
  const update = useUpdateMemberManager(member.id)

  const options = members
    .filter((item) => item.id !== member.id)
    .map((item) => ({
      member: item,
      blocked:
        item.managerId === member.id
          ? "já responde a esta pessoa"
          : null,
    }))

  return (
    <SettingRow
      label="Responde a"
      control={
        <div className="max-w-sm">
          <PersonPicker
            options={options}
            value={member.managerId}
            onChange={(managerId) =>
              update.mutate(managerId, {
                onSuccess: () => toast.success("Líder direto atualizado."),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
            emptyLabel="Ninguém acima"
            placeholder="Escolher líder"
            disabled={update.isPending}
          />
        </div>
      }
      status={update.isPending ? <SavedHint saving /> : undefined}
    />
  )
}

function Responsibilities({
  member,
  members,
}: {
  member: Member
  members: Member[]
}) {
  const { data, isPending } = useMemberResponsibilities(member.id)

  const nameOf = (memberId: string) =>
    members.find((item) => item.id === memberId)?.user?.name ??
    "Pessoa sem cadastro"

  const subordinates = data?.subordinates ?? []
  const substituteFor = data?.substituteFor ?? []

  if (!isPending && subordinates.length === 0 && substituteFor.length === 0) {
    return null
  }

  return (
    <section className="rise-in flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs [animation-delay:140ms]">
      <header className="flex min-h-12 items-center border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">
          Quem depende desta pessoa
        </h2>
      </header>

      {isPending ? (
        <div className="px-5 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {subordinates.length > 0 ? (
            <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-caption text-muted-foreground sm:w-40 sm:shrink-0">
                Responde a {firstNameOf(member)}
              </p>
              <p className="text-caption text-foreground">
                {subordinates.map((item) => nameOf(item.id)).join(", ")}
              </p>
            </div>
          ) : null}

          {substituteFor.length > 0 ? (
            <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-caption text-muted-foreground sm:w-40 sm:shrink-0">
                Cobre a ausência de
              </p>
              <p className="text-caption text-foreground">
                {substituteFor.map((item) => nameOf(item.id)).join(", ")}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function firstNameOf(member: Member): string {
  return (member.user?.name ?? "esta pessoa").split(" ")[0]
}

function DangerZone({
  member,
  members,
}: {
  member: Member
  members: Member[]
}) {
  const [disabling, setDisabling] = useState(false)
  const [transferring, setTransferring] = useState(false)

  const navigate = useNavigate()
  const { data, isPending } = useMemberResponsibilities(member.id)
  const disable = useDisableMember()

  const blockers = data?.blockers ?? []
  const managesCostCenters = blockers.some(
    (blocker) => blocker.kind === "COST_CENTER_MANAGER",
  )
  const name = member.user?.name ?? "esta pessoa"
  const firstName = name.split(" ")[0]

  return (
    <section className="rise-in flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs [animation-delay:160ms]">
      <header className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5 py-2">
        <h2 className="text-caption font-medium text-foreground">
          Tirar do sistema
        </h2>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {managesCostCenters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransferring(true)}
              className="h-8"
            >
              Transferir Centros de Custo
            </Button>
          ) : null}

          <Button
            variant="destructive"
            size="sm"
            disabled={isPending || blockers.length > 0}
            onClick={() => setDisabling(true)}
            className="h-8"
            title={
              blockers.length > 0
                ? "Resolva as pendências antes de inativar"
                : undefined
            }
          >
            Inativar pessoa
          </Button>
        </div>
      </header>

      {isPending ? (
        <div className="px-5 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      ) : blockers.length > 0 ? (
        <ul className="divide-y divide-border/60">
          {blockers.map((blocker) => (
            <li
              key={blocker.kind}
              className="flex items-start gap-2.5 px-5 py-3"
            >
              <Warning
                size={13}
                weight="fill"
                className="mt-0.5 shrink-0 text-warning-strong"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-caption text-foreground">{blocker.message}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {blocker.items.map((item) => item.label).join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-3 text-caption text-muted-foreground">
          {firstName} perde o acesso, mas os pedidos e decisões dela continuam
          no histórico.
        </p>
      )}

      <ConfirmDialog
        open={disabling}
        onOpenChange={setDisabling}
        title={`Inativar ${name}?`}
        description="A pessoa perde o acesso à empresa. Os pedidos e decisões dela continuam no histórico."
        confirmLabel={disable.isPending ? "Inativando…" : "Inativar pessoa"}
        isPending={disable.isPending}
        onConfirm={() =>
          disable.mutate(member.id, {
            onSuccess: () => {
              toast.success(`${name} não tem mais acesso.`)
              void navigate("/equipe")
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      >
        {(data?.subordinates.length ?? 0) > 0 ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-caption leading-relaxed text-muted-foreground">
            {data?.subordinates.length}{" "}
            {data?.subordinates.length === 1
              ? "pessoa passa a responder"
              : "pessoas passam a responder"}{" "}
            ao líder de {firstName}.
          </p>
        ) : null}
      </ConfirmDialog>

      <TransferManagementDialog
        member={member}
        members={members}
        blockers={blockers}
        open={transferring}
        onOpenChange={setTransferring}
      />
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando pessoa</span>

      <div className="flex flex-col gap-5">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        </div>
      </div>

      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}
