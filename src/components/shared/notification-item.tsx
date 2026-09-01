import type { Notification } from "@/api/notifications"
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_TONES,
  NOTIFICATION_TONE_CLASS,
  FALLBACK_ICON,
} from "@/lib/notification-style"
import { relativeTime } from "@/lib/relative-time"
import { cn } from "@/lib/utils"
import {
  NOTIFICATION_EVENT_GROUPS,
  type NotificationEvent,
} from "@/types/enums"

export function NotificationItem({
  notification,
  onSelect,
  spacious = false,
}: {
  notification: Notification
  onSelect: (notification: Notification) => void
  spacious?: boolean
}) {
  const event = notification.event as NotificationEvent
  const ItemIcon = NOTIFICATION_ICONS[event] ?? FALLBACK_ICON
  const tone = NOTIFICATION_TONES[event] ?? "neutral"
  const unread = notification.readAt === null

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        "flex w-full gap-3 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:-outline-offset-2",
        spacious ? "px-5 py-4" : "px-4 py-3",
        unread ? "hover:bg-muted/50" : "hover:bg-muted/30",
      )}
    >
      <span className="relative shrink-0">
        <span
          aria-hidden
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border",
            NOTIFICATION_TONE_CLASS[tone],
          )}
        >
          <ItemIcon size={16} />
        </span>

        {unread ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-brand-accent"
          />
        ) : null}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-overline",
              unread ? "text-primary" : "text-muted-foreground/70",
            )}
          >
            {NOTIFICATION_EVENT_GROUPS[event] ?? "Avisos"}
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="shrink-0 text-micro text-muted-foreground/70">
            {relativeTime(notification.createdAt)}
          </span>
        </span>

        <span
          className={cn(
            "text-caption leading-snug",
            unread ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {notification.title}
        </span>

        <span className="text-caption leading-relaxed text-muted-foreground">
          {notification.message}
        </span>
      </span>
    </button>
  )
}
