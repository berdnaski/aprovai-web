import { Bell, Checks, Gear } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Notification } from "@/api/notifications"
import { NotificationItem } from "@/components/shared/notification-item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/notifications/use-notifications"
import { cn } from "@/lib/utils"

const TABS = { UNREAD: "UNREAD", READ: "READ" } as const

type Tab = (typeof TABS)[keyof typeof TABS]

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>(TABS.UNREAD)

  const unread = useUnreadCount()
  const list = useNotifications({ perPage: 20 }, open)
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const count = unread.data ?? 0
  const all = list.data?.items ?? []
  const items = all.filter((item) =>
    tab === TABS.UNREAD ? item.readAt === null : item.readAt !== null,
  )

  function pick(notification: Notification) {
    setOpen(false)

    if (!notification.readAt) {
      markRead.mutate(notification.id)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={
              count > 0 ? `Notificações, ${count} não lidas` : "Notificações"
            }
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "aria-expanded:bg-muted aria-expanded:text-foreground",
            )}
          />
        }
      >
        <Bell size={16} aria-hidden />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-micro leading-none text-primary-foreground tabular-nums"
          >
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 gap-0 overflow-hidden p-0">
        <header className="flex items-center gap-2 px-4 pt-3.5">
          <h2 className="text-label text-foreground">Notificações</h2>

          <div className="ml-auto flex items-center gap-1">
            {count > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-caption text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Checks size={14} aria-hidden />
                Marcar todas como lidas
              </button>
            ) : null}

            <span aria-hidden className="h-4 w-px bg-border" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label="Preferências de notificação"
                    onClick={() => {
                      setOpen(false)
                      navigate("/notificacoes/preferencias")
                    }}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                }
              >
                <Gear size={15} aria-hidden />
              </TooltipTrigger>
              <TooltipContent>Preferências</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Filtrar notificações"
          className="flex gap-4 border-b border-border px-4"
        >
          {(
            [
              [TABS.UNREAD, "Não lidas", count],
              [TABS.READ, "Lidas", undefined],
            ] as const
          ).map(([id, label, badge]) => {
            const active = tab === id

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 pt-2 pb-2.5 text-caption transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {badge ? (
                  <span className="rounded bg-primary/10 px-1 text-micro tabular-nums text-primary">
                    {badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {list.isPending ? (
            <p className="px-4 py-10 text-center text-caption text-muted-foreground">
              Carregando…
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
              <Bell
                size={20}
                aria-hidden
                className="text-muted-foreground/50"
              />
              <p className="text-caption font-medium text-foreground">
                {tab === TABS.UNREAD ? "Você está em dia" : "Nada lido ainda"}
              </p>
              <p className="max-w-56 text-caption leading-relaxed text-muted-foreground">
                {tab === TABS.UNREAD
                  ? "Avisamos quando um pedido precisar da sua atenção."
                  : "O que você já leu aparece aqui."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onSelect={pick}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-border bg-muted/25 px-4 py-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate("/notificacoes")
            }}
            className="w-full rounded-md py-1 text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Ver todas
          </button>
        </footer>
      </PopoverContent>
    </Popover>
  )
}
