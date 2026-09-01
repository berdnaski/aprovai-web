import { Bell, Checks, Gear } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Notification } from "@/api/notifications"
import { EmptyState } from "@/components/shared/empty-state"
import { NotificationItem } from "@/components/shared/notification-item"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  DataTablePagination,
  TableSegments,
  TableToolbar,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/notifications/use-notifications"

const PER_PAGE = 20

const FILTERS = { ALL: "ALL", UNREAD: "UNREAD", READ: "READ" } as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>(FILTERS.ALL)
  const [page, setPage] = useState(1)

  const query = useNotifications({
    page,
    perPage: PER_PAGE,
    ...(filter === FILTERS.UNREAD ? { unreadOnly: true } : {}),
  })
  const unread = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  function pick(notification: Notification) {
    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  if (query.isPending && !query.data) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-3 h-4 w-72" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader title="Notificações" />
        <LoadError onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const fetched = query.data?.items ?? []
  const items =
    filter === FILTERS.READ
      ? fetched.filter((item) => item.readAt !== null)
      : fetched
  const meta = query.data?.meta
  const count = unread.data ?? 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Notificações"
        description="Tudo que pediu a sua atenção, do mais recente para o mais antigo."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/notificacoes/preferencias")}
              className="gap-1.5 font-medium"
            >
              <Gear size={15} aria-hidden />
              Preferências
            </Button>
            {count > 0 ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="gap-1.5 font-medium"
              >
                <Checks size={15} aria-hidden />
                Marcar todas como lidas
              </Button>
            ) : null}
          </div>
        }
      />

      <section>
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={(next) => {
              setFilter(next)
              setPage(1)
            }}
            segments={[
              { id: FILTERS.ALL, label: "Todas" },
              {
                id: FILTERS.UNREAD,
                label: "Não lidas",
                count,
                tone: "brand",
              },
              { id: FILTERS.READ, label: "Lidas" },
            ]}
          />
        </TableToolbar>

        <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          {items.length === 0 ? (
            <div className="px-3 py-10">
              <EmptyState
                variant="inline"
                icon={Bell}
                title={
                  filter === FILTERS.UNREAD
                    ? "Você está em dia"
                    : filter === FILTERS.READ
                      ? "Nada lido ainda"
                      : "Nenhuma notificação"
                }
                description={
                  filter === FILTERS.UNREAD
                    ? "Nenhuma notificação aguardando você."
                    : filter === FILTERS.READ
                      ? "O que você já leu aparece aqui."
                      : "Você é avisado quando um pedido precisar da sua atenção."
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onSelect={pick}
                    spacious
                  />
                </li>
              ))}
            </ul>
          )}

          {meta && meta.totalPages > 1 ? (
            <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2.5">
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="notificações"
              />
            </footer>
          ) : null}
        </section>
      </section>
    </div>
  )
}
