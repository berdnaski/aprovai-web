import { MagnifyingGlass, Scroll } from "@phosphor-icons/react"
import { useState } from "react"

import type { AuditLog } from "@/api/audit-logs"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  CellPerson,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditLogs } from "@/hooks/audit-logs/use-audit-logs"
import { useMembers } from "@/hooks/members/use-members"
import { initialsOf } from "@/lib/people"
import {
  AUDIT_ENTITY_LABELS,
  AUDIT_EVENT_LABELS,
  AuditEventType,
} from "@/types/enums"

import { ChangeDetailDialog } from "./components/change-detail-dialog"

const PER_PAGE = 25

const SYSTEM_ACTOR = "Sistema"

function dayTime(value: string): { day: string; time: string } {
  const date = new Date(value)

  return {
    day: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

export function AuditLogsPage() {
  const [eventType, setEventType] = useState<AuditEventType | null>(null)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [opened, setOpened] = useState<AuditLog | null>(null)

  const logsQuery = useAuditLogs({
    page,
    perPage: PER_PAGE,
    ...(eventType ? { eventType } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  })

  const membersQuery = useMembers()

  const actorName = new Map(
    (membersQuery.data ?? [])
      .filter((member) => member.user)
      .map((member) => [member.userId, member.user!.name]),
  )

  function nameOf(log: AuditLog): string {
    return log.actorId === null
      ? SYSTEM_ACTOR
      : (actorName.get(log.actorId) ?? "Usuário removido")
  }

  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: "when",
      header: "Quando",
      width: "150px",
      cell: (log) => {
        const { day, time } = dayTime(log.occurredAt)

        return (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-caption tabular-nums text-foreground">
              {day}
            </span>
            <span className="text-micro tabular-nums text-muted-foreground/70">
              {time}
            </span>
          </span>
        )
      },
    },
    {
      id: "actor",
      header: "Quem",
      width: "210px",
      cell: (log) => {
        const name = nameOf(log)

        return (
          <CellPerson
            initials={name === SYSTEM_ACTOR ? "SI" : initialsOf(name)}
            name={name}
            detail={log.actorId === null ? "ação automática" : undefined}
          />
        )
      },
    },
    {
      id: "event",
      header: "O que aconteceu",
      cell: (log) => (
        <span className="truncate text-caption text-foreground">
          {AUDIT_EVENT_LABELS[log.eventType] ?? log.eventType}
        </span>
      ),
    },
    {
      id: "entity",
      header: "Sobre",
      hideBelow: "lg",
      width: "180px",
      cell: (log) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption text-muted-foreground">
            {AUDIT_ENTITY_LABELS[log.entityType] ?? log.entityType}
          </span>
          <span className="truncate text-micro tabular-nums text-muted-foreground/60">
            {log.entityId.slice(0, 8)}
          </span>
        </span>
      ),
    },
    {
      id: "ip",
      header: "Origem",
      hideBelow: "xl",
      width: "130px",
      cell: (log) => (
        <span className="text-caption tabular-nums text-muted-foreground/70">
          {log.ipAddress ?? "—"}
        </span>
      ),
    },
  ]

  if (logsQuery.isPending && !logsQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (logsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Auditoria" />
        <LoadError onRetry={() => void logsQuery.refetch()} />
      </div>
    )
  }

  const rows = logsQuery.data?.items ?? []
  const meta = logsQuery.data?.meta
  const filtered = eventType !== null || from !== "" || to !== ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auditoria"
        description="Tudo que foi feito na empresa, em ordem. O registro não pode ser editado nem apagado por ninguém."
      />

      <section>
        <TableToolbar>
          <Select
            value={eventType}
            onValueChange={(next) => {
              setEventType(next as AuditEventType | null)
              setPage(1)
            }}
          >
            <SelectTrigger
              className="h-8 w-56 bg-card px-3"
              aria-label="Filtrar por tipo de evento"
            >
              <SelectValue>
                {(value: AuditEventType | null) =>
                  value ? AUDIT_EVENT_LABELS[value] : "Todos os eventos"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos os eventos</SelectItem>
              {Object.values(AuditEventType).map((event) => (
                <SelectItem key={event} value={event}>
                  {AUDIT_EVENT_LABELS[event]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <Input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setFrom(event.target.value)
                setPage(1)
              }}
              aria-label="Data inicial"
              className="h-8 w-36 text-caption md:text-caption"
            />
            <span className="text-caption text-muted-foreground">até</span>
            <Input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value)
                setPage(1)
              }}
              aria-label="Data final"
              className="h-8 w-36 text-caption md:text-caption"
            />
          </div>
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="registros"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "registro" : "registros"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(log) => log.id}
            onRowClick={(log) => setOpened(log)}
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : Scroll}
                title={
                  filtered
                    ? "Nenhum registro no filtro"
                    : "Nada registrado ainda"
                }
                description={
                  filtered
                    ? "Troque o tipo de evento ou o período."
                    : "Cada aprovação, ordem, nota e pagamento entra aqui automaticamente."
                }
              />
            }
          />
        </DataTableShell>
      </section>

      <ChangeDetailDialog
        log={opened}
        actorName={opened ? nameOf(opened) : ""}
        onOpenChange={(open) => {
          if (!open) {
            setOpened(null)
          }
        }}
      />
    </div>
  )
}
