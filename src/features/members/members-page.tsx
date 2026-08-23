import {
  DotsThree,
  MagnifyingGlass,
  ShieldCheck,
  UserPlus,
  Users,
  Warning,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import type { Member } from "@/api/members"
import { getApiErrorMessage } from "@/api/client"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatRow, StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import {
  CellPerson,
  DataTable,
  DataTablePagination,
  DataTableShell,
  StatusPill,
  localPage,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useSession } from "@/hooks/auth/use-session"
import { useInvites, useMembers } from "@/hooks/members/use-members"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { initialsOf, isAbsent } from "@/lib/people"
import { CompanyMemberRole, InviteStatus, ROLE_LABELS } from "@/types/enums"

import { ApprovalLadder } from "./components/approval-ladder"
import { BulkActionsBar } from "./components/bulk-actions-bar"
import { InviteMemberDialog } from "./components/invite-member-dialog"
import { InvitesPanel } from "./components/invites-panel"
import { MembersError } from "./components/members-error"
import { MyAbsenceCard } from "./components/my-absence-card"

type SortId = "name" | "role" | "limit"

const PER_PAGE = 25

export function MembersPage() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{
    id: SortId
    direction: "asc" | "desc"
  }>({ id: "name", direction: "asc" })

  const term = useDebouncedValue(query).trim().toLowerCase()
  const navigate = useNavigate()

  const { canManage } = usePermissions()
  const { membership } = useSession()
  const canManageTeam = canManage("members")

  const membersQuery = useMembers()
  const invitesQuery = useInvites()

  if (membersQuery.isPending) {
    return <MembersSkeleton />
  }

  if (membersQuery.isError) {
    return (
      <MembersError
        message={getApiErrorMessage(membersQuery.error)}
        onRetry={() => void membersQuery.refetch()}
      />
    )
  }

  const members = membersQuery.data ?? []
  const me = members.find((member) => member.id === membership?.memberId)
  const invites = invitesQuery.data ?? []
  const pendingInvites = invites.filter(
    (invite) => invite.status === InviteStatus.PENDING,
  )

  const approvers = members.filter(
    (member) =>
      member.role === CompanyMemberRole.FINANCE_ADMIN ||
      (member.role === CompanyMemberRole.APPROVER &&
        Number(member.approvalLimitCents) > 0),
  )

  const withoutManager = members.filter(
    (member) =>
      member.managerId === null &&
      member.role !== CompanyMemberRole.FINANCE_ADMIN,
  )

  const absent = members.filter((member) => isAbsent(member))

  const visible = members
    .filter((member) => {
      if (!term) {
        return true
      }

      const name = member.user?.name?.toLowerCase() ?? ""
      const email = member.user?.email?.toLowerCase() ?? ""

      return name.includes(term) || email.includes(term)
    })
    .sort((a, b) => {
      const factor = sort.direction === "asc" ? 1 : -1

      if (sort.id === "limit") {
        const limitOf = (member: Member) =>
          member.role === CompanyMemberRole.FINANCE_ADMIN
            ? Number.MAX_SAFE_INTEGER
            : Number(member.approvalLimitCents)

        return (limitOf(a) - limitOf(b)) * factor
      }

      if (sort.id === "role") {
        return ROLE_LABELS[a.role].localeCompare(ROLE_LABELS[b.role]) * factor
      }

      return (
        (a.user?.name ?? "").localeCompare(b.user?.name ?? "", "pt-BR") * factor
      )
    })

  const { items: pageItems, meta } = localPage(visible, page, PER_PAGE)

  const inviteAction = canManageTeam ? (
    <InviteMemberDialog
      trigger={
        <Button
          size="lg"
          className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <UserPlus size={15} weight="bold" aria-hidden />
          Convidar pessoa
        </Button>
      }
    />
  ) : null

  const columns: DataTableColumn<Member>[] = [
    {
      id: "name",
      header: "Pessoa",
      sortable: true,
      cell: (member) => {
        const name = member.user?.name ?? "Pessoa sem cadastro"

        return (
          <CellPerson
            initials={initialsOf(name)}
            name={name}
            detail={member.user?.email ?? undefined}
            tone={
              member.role === CompanyMemberRole.FINANCE_ADMIN
                ? "brand"
                : "neutral"
            }
            badge={
              isAbsent(member) ? (
                <StatusPill tone="warning">ausente</StatusPill>
              ) : undefined
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
      cell: (member) => (
        <StatusPill
          tone={
            member.role === CompanyMemberRole.FINANCE_ADMIN ? "brand" : "neutral"
          }
        >
          {ROLE_LABELS[member.role]}
        </StatusPill>
      ),
    },
    {
      id: "limit",
      header: "Aprova até",
      sortable: true,
      align: "end",
      hideBelow: "lg",
      width: "160px",
      cell: (member) =>
        member.role === CompanyMemberRole.FINANCE_ADMIN ? (
          <span className="text-caption text-foreground">Sem teto</span>
        ) : Number(member.approvalLimitCents) > 0 ? (
          <span className="text-caption tabular-nums text-foreground">
            <MoneyDisplay cents={member.approvalLimitCents} />
          </span>
        ) : (
          <span className="text-caption text-muted-foreground">Não aprova</span>
        ),
    },
    {
      id: "manager",
      header: "Responde a",
      hideBelow: "xl",
      width: "180px",
      cell: (member) => {
        const manager = member.managerId
          ? members.find((item) => item.id === member.managerId)
          : undefined

        if (!manager) {
          return (
            <span className="text-caption text-muted-foreground">
              {member.role === CompanyMemberRole.FINANCE_ADMIN ? "—" : "ninguém"}
            </span>
          )
        }

        return (
          <span className="truncate text-caption text-muted-foreground">
            {manager.user?.name ?? "sem cadastro"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      width: "56px",
      cell: (member) =>
        canManageTeam ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Ações de ${member.user?.name ?? "pessoa"}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-muted-foreground"
                />
              }
            >
              <DotsThree size={16} weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link to={`/equipe/${member.id}`} />}>
                Abrir perfil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Equipe"
        description="Quem trabalha na empresa, o que cada um pode aprovar e a quem responde. O perfil definido aqui vale em todos os Centros de Custo."
        action={inviteAction}
      />

      <StatRow>
        <StatTile
          label="Pessoas ativas"
          value={members.length}
          icon={Users}
          hint={
            pendingInvites.length > 0
              ? `${pendingInvites.length} convite${pendingInvites.length > 1 ? "s" : ""} pendente${pendingInvites.length > 1 ? "s" : ""}`
              : undefined
          }
        />
        <StatTile
          label="Podem aprovar"
          value={approvers.length}
          icon={ShieldCheck}
          tone="brand"
          hint="com alçada definida"
        />
        <StatTile
          label="Sem líder definido"
          value={withoutManager.length}
          icon={Warning}
          tone={withoutManager.length > 0 ? "warning" : "neutral"}
          hint={
            withoutManager.length > 0
              ? "pedidos acima do teto travam"
              : "toda a hierarquia fechada"
          }
        />
        <StatTile
          label="Ausentes hoje"
          value={absent.length}
          icon={Users}
          hint={absent.length > 0 ? "decisões vão ao substituto" : undefined}
        />
      </StatRow>

      {me ? <MyAbsenceCard me={me} members={members} /> : null}

      <ApprovalLadder members={members} />

      <Tabs defaultValue="people">
        <TabsList>
          <TabsTab value="people">
            Pessoas
            <TabCount>{members.length}</TabCount>
          </TabsTab>
          {canManageTeam ? (
            <TabsTab value="invites">
              Convites
              {pendingInvites.length > 0 ? (
                <TabCount>{pendingInvites.length}</TabCount>
              ) : null}
            </TabsTab>
          ) : null}
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="people">
          <DataTableShell
            title="Pessoas"
            count={meta.total}
            footer={
              meta.totalPages > 1 ? (
                <DataTablePagination
                  meta={meta}
                  onPageChange={setPage}
                  label="pessoas"
                />
              ) : undefined
            }
            toolbar={
              selected.length > 0 ? (
                <BulkActionsBar
                  selected={selected}
                  members={members}
                  onClear={() => setSelected([])}
                />
              ) : members.length > 5 ? (
                <div className="relative min-w-0 sm:w-64">
                  <MagnifyingGlass
                    size={14}
                    className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPage(1)
                    }}
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
              rows={pageItems}
              rowKey={(member) => member.id}
              selection={canManageTeam ? selected : undefined}
              onSelectionChange={canManageTeam ? setSelected : undefined}
              onRowClick={
                canManageTeam
                  ? (member) => void navigate(`/equipe/${member.id}`)
                  : undefined
              }
              sort={sort}
              onSortChange={(id) => {
                setPage(1)
                setSort((current) =>
                  current.id === id
                    ? {
                        id: current.id,
                        direction: current.direction === "asc" ? "desc" : "asc",
                      }
                    : { id: id as SortId, direction: "asc" },
                )
              }}
              empty={
                <EmptyState
                  variant="inline"
                  icon={MagnifyingGlass}
                  title="Ninguém encontrado"
                  description="Tente outro nome ou e-mail."
                />
              }
            />
          </DataTableShell>
        </TabsPanel>

        {canManageTeam ? (
          <TabsPanel value="invites">
            <InvitesPanel
              invites={invites}
              isPending={invitesQuery.isPending}
              inviteAction={inviteAction}
            />
          </TabsPanel>
        ) : null}
      </Tabs>
    </div>
  )
}

function TabCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-muted px-1.5 text-caption text-muted-foreground tabular-nums">
      {children}
    </span>
  )
}

function MembersSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando equipe</span>

      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-3 h-4 w-96" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>

      <div className="flex items-center gap-6 border-b border-border pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>

      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  )
}
