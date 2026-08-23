import {
  DotsThree,
  MagnifyingGlass,
  Plus,
  UserMinus,
} from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { CostCenterMemberLink, CostCenterSummary } from "@/api/cost-centers"
import type { Member } from "@/api/members"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import {
  CellPerson,
  DataTable,
  DataTableShell,
  StatusPill,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  useCompanyMembers,
  useUnlinkCostCenterMember,
} from "@/hooks/cost-centers/use-cost-centers"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { initialsOf, isAbsent } from "@/lib/people"
import { CompanyMemberRole, ROLE_LABELS } from "@/types/enums"

import { LinkMemberDialog } from "./link-member-dialog"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

function formatDate(value: string) {
  return DATE.format(new Date(value))
}


type PanelSortId = "person" | "role" | "limit"

interface PanelMember {
  link: CostCenterMemberLink | null
  member: Member | undefined
  memberId: string
  isManager: boolean
}

export function MembersPanel({
  node,
  memberLinks,
}: {
  node: CostCenterSummary
  memberLinks: CostCenterMemberLink[]
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<{
    id: PanelSortId
    direction: "asc" | "desc"
  }>({ id: "person", direction: "asc" })
  const [unlinking, setUnlinking] = useState<PanelMember | null>(null)

  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  const { data: companyMembers = [] } = useCompanyMembers()
  const unlink = useUnlinkCostCenterMember(node.id)

  const byId = new Map(companyMembers.map((member) => [member.id, member]))

  const manager: PanelMember = {
    link: null,
    member: byId.get(node.managerId),
    memberId: node.managerId,
    isManager: true,
  }

  const linked: PanelMember[] = memberLinks
    .filter((link) => link.memberId !== node.managerId)
    .map((link) => ({
      link,
      member: byId.get(link.memberId),
      memberId: link.memberId,
      isManager: false,
    }))

  const term = query.trim().toLowerCase()

  const sorted = (rows: PanelMember[]) => {
    const factor = sort.direction === "asc" ? 1 : -1

    return [...rows].sort((a, b) => {
      if (sort.id === "limit") {
        const limitOf = (entry: PanelMember) =>
          entry.member?.role === CompanyMemberRole.FINANCE_ADMIN
            ? Number.MAX_SAFE_INTEGER
            : Number(entry.member?.approvalLimitCents ?? 0)

        return (limitOf(a) - limitOf(b)) * factor
      }

      if (sort.id === "role") {
        const roleOf = (entry: PanelMember) =>
          entry.member ? ROLE_LABELS[entry.member.role] : ""

        return roleOf(a).localeCompare(roleOf(b), "pt-BR") * factor
      }

      const nameOf = (entry: PanelMember) => entry.member?.user?.name ?? ""

      return nameOf(a).localeCompare(nameOf(b), "pt-BR") * factor
    })
  }

  const visible = linked.filter((entry) => {
    if (!term) {
      return true
    }

    const name = entry.member?.user?.name?.toLowerCase() ?? ""
    const email = entry.member?.user?.email?.toLowerCase() ?? ""

    return name.includes(term) || email.includes(term)
  })

  const absent = [manager, ...linked].filter(
    (entry) => entry.member && isAbsent(entry.member),
  )

  const columns: DataTableColumn<PanelMember>[] = [
    {
      id: "person",
      header: "Pessoa",
      sortable: true,
      cell: (entry) => {
        const name = entry.member?.user?.name ?? "Pessoa sem cadastro"

        return (
          <CellPerson
            initials={initialsOf(name)}
            name={name}
            detail={entry.member?.user?.email ?? undefined}
            tone={entry.isManager ? "brand" : "neutral"}
            badge={
              <>
                {entry.isManager ? (
                  <StatusPill tone="brand">Gestor</StatusPill>
                ) : null}
                {entry.member && isAbsent(entry.member) ? (
                  <StatusPill tone="warning">ausente</StatusPill>
                ) : null}
              </>
            }
          />
        )
      },
    },
    {
      id: "role",
      header: "Perfil",
      sortable: true,
      hideBelow: "sm",
      width: "180px",
      cell: (entry) =>
        entry.member ? (
          <StatusPill
            tone={
              entry.member.role === CompanyMemberRole.FINANCE_ADMIN
                ? "brand"
                : "neutral"
            }
          >
            {ROLE_LABELS[entry.member.role]}
          </StatusPill>
        ) : (
          <span className="text-caption text-muted-foreground">—</span>
        ),
    },
    {
      id: "limit",
      header: "Aprova até",
      sortable: true,
      align: "end",
      hideBelow: "lg",
      width: "160px",
      cell: (entry) => {
        if (!entry.member) {
          return <span className="text-caption text-muted-foreground">—</span>
        }

        if (entry.member.role === CompanyMemberRole.FINANCE_ADMIN) {
          return <span className="text-caption text-foreground">Sem teto</span>
        }

        return Number(entry.member.approvalLimitCents) > 0 ? (
          <span className="text-caption tabular-nums text-foreground">
            <MoneyDisplay cents={entry.member.approvalLimitCents} />
          </span>
        ) : (
          <span className="text-caption text-muted-foreground">Não aprova</span>
        )
      },
    },
    {
      id: "since",
      header: "Desde",
      align: "end",
      hideBelow: "xl",
      width: "120px",
      cell: (entry) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {entry.link ? formatDate(entry.link.createdAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      width: "56px",
      cell: (entry) =>
        entry.isManager || !canManage ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Ações de ${entry.member?.user?.name ?? "pessoa"}`}
                  className="text-muted-foreground"
                />
              }
            >
              <DotsThree size={16} weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setUnlinking(entry)}
              >
                <UserMinus size={14} aria-hidden />
                Desvincular do centro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ]

  const linkAction = canManage ? (
    <LinkMemberDialog
      costCenterId={node.id}
      costCenterName={node.name}
      linkedIds={[node.managerId, ...memberLinks.map((link) => link.memberId)]}
      trigger={
        <Button
          size="lg"
          className="shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Plus size={15} weight="bold" aria-hidden />
          Vincular pessoa
        </Button>
      }
    />
  ) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="max-w-xl text-body text-muted-foreground">
          Quem está aqui pode abrir pedidos neste centro. O admin financeiro
          passa por todos os centros, mesmo sem vínculo.
        </p>
        {linkAction}
      </div>

      {absent.length > 0 ? (
        <p className="rise-in rounded-lg border border-warning/25 bg-warning/6 px-4 py-2.5 text-caption text-foreground">
          {absent
            .map((entry) => entry.member?.user?.name ?? "Alguém")
            .join(", ")}{" "}
          {absent.length === 1 ? "está ausente" : "estão ausentes"} —{" "}
          <span className="text-muted-foreground">
            as aprovações seguem para os substitutos definidos.
          </span>
        </p>
      ) : null}

      <DataTableShell
        title="Pessoas"
        count={linked.length + 1}
        className="rise-in"
        toolbar={
          linked.length > 3 ? (
            <div className="relative min-w-0 sm:w-64">
              <MagnifyingGlass
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou e-mail"
                aria-label="Buscar pessoa"
                className="h-8 pl-8 text-caption md:text-caption"
              />
            </div>
          ) : undefined
        }
      >
        <DataTable
          columns={columns}
          rows={[manager, ...sorted(visible)]}
          rowKey={(entry) => entry.memberId}
          sort={sort}
          onSortChange={(id) =>
            setSort((current) =>
              current.id === id
                ? {
                    id: current.id,
                    direction: current.direction === "asc" ? "desc" : "asc",
                  }
                : { id: id as PanelSortId, direction: "asc" },
            )
          }
        />

        {linked.length === 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3">
            <p className="min-w-0 flex-1 text-caption text-muted-foreground">
              Ninguém além do gestor abre pedidos neste centro.
              {canManage
                ? " Vincule as pessoas do time para liberar o resto."
                : ""}
            </p>
            {canManage ? linkAction : null}
          </div>
        ) : null}

        {linked.length > 0 && visible.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={MagnifyingGlass}
            title="Ninguém encontrado"
            description="Tente outro nome ou e-mail."
          />
        ) : null}
      </DataTableShell>

      <ConfirmDialog
        open={unlinking !== null}
        onOpenChange={(next) => {
          if (!next) {
            setUnlinking(null)
          }
        }}
        title={`Desvincular ${unlinking?.member?.user?.name ?? "esta pessoa"}?`}
        description={`A pessoa deixa de abrir pedidos em ${node.name}. O perfil dela na empresa e os pedidos já criados continuam como estão.`}
        confirmLabel={unlink.isPending ? "Desvinculando…" : "Desvincular"}
        isPending={unlink.isPending}
        onConfirm={() => {
          if (!unlinking) {
            return
          }

          unlink.mutate(unlinking.memberId, {
            onSuccess: () => {
              toast.success(
                `${unlinking.member?.user?.name ?? "A pessoa"} não abre mais pedidos aqui.`,
              )
              setUnlinking(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      />
    </div>
  )
}
