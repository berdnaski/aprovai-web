import type { Notification } from "@/api/notifications"
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_TONES,
  NOTIFICATION_TONE_CLASS,
  FALLBACK_ICON,
} from "@/lib/notification-style"
import { relativeTime } from "@/lib/relative-time"
import { cn } from "@/lib/utils"
import type { NotificationEvent } from "@/types/enums"

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
        "relative flex w-full gap-3 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:-outline-offset-2",
        "hover:bg-muted/40",
        spacious ? "px-5 py-3.5" : "px-4 py-3",
      )}
    >
      {unread ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
          NOTIFICATION_TONE_CLASS[tone],
        )}
      >
        <ItemIcon size={15} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline gap-3">
          <span
            className={cn(
              "min-w-0 flex-1 text-caption leading-snug",
              unread
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {notification.title}
          </span>

          <span className="shrink-0 text-micro tabular-nums text-muted-foreground/60">
            {relativeTime(notification.createdAt)}
          </span>
        </span>

        <span className="line-clamp-2 text-caption leading-relaxed text-muted-foreground/80">
          {notification.message}
        </span>
      </span>
    </button>
  )
}
