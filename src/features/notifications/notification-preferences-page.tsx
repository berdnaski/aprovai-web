import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { NotificationPreference } from "@/api/notifications"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import {
  SettingActions,
  SettingGroup,
  SettingRow,
} from "@/components/shared/setting-row"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  usePreferences,
  useUpdatePreferences,
} from "@/hooks/notifications/use-notifications"
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_TONES,
  NOTIFICATION_TONE_CLASS,
  FALLBACK_ICON,
} from "@/lib/notification-style"
import { cn } from "@/lib/utils"
import {
  NOTIFICATION_EVENT_GROUPS,
  NOTIFICATION_EVENT_LABELS,
  type NotificationEvent,
} from "@/types/enums"

function EventIcon({ event }: { event: NotificationEvent }) {
  const Glyph = NOTIFICATION_ICONS[event] ?? FALLBACK_ICON
  const tone = NOTIFICATION_TONES[event] ?? "neutral"

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border",
        NOTIFICATION_TONE_CLASS[tone],
      )}
    >
      <Glyph size={14} />
    </span>
  )
}

export function NotificationPreferencesPage() {
  const [draft, setDraft] = useState<NotificationPreference[] | null>(null)

  const query = usePreferences()
  const update = useUpdatePreferences()

  const saved = query.data ?? []

  if (query.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Notificações", to: "/notificacoes" }]}
          title="Preferências"
        />
        <LoadError onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const current = draft ?? saved
  const changed = current.filter((item) => {
    const original = saved.find((entry) => entry.event === item.event)
    return original && original.emailEnabled !== item.emailEnabled
  })

  function toggle(event: string, emailEnabled: boolean) {
    setDraft(
      current.map((item) =>
        item.event === event ? { ...item, emailEnabled } : item,
      ),
    )
  }

  function submit() {
    update.mutate(current, {
      onSuccess: () => {
        setDraft(null)
        toast.success("Preferências salvas.")
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  const groups = new Map<string, NotificationPreference[]>()

  for (const item of current) {
    const group =
      NOTIFICATION_EVENT_GROUPS[item.event as NotificationEvent] ?? "Avisos"
    groups.set(group, [...(groups.get(group) ?? []), item])
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (changed.length > 0 && !update.isPending) {
          submit()
        }
      }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
    >
      <PageHeader
        breadcrumbs={[{ label: "Notificações", to: "/notificacoes" }]}
        title="Preferências"
        description="Escolha o que também chega por e-mail. A central de notificações mostra tudo, independente destas escolhas."
      />

      <div className="flex flex-col gap-4">
        {[...groups].map(([group, items], index) => (
          <SettingGroup
            key={group}
            title={group}
            footer={
              index === groups.size - 1 ? (
                <SettingActions
                  dirtyCount={changed.length}
                  pending={update.isPending}
                  onReset={() => setDraft(null)}
                />
              ) : undefined
            }
          >
            {items.map((item) => {
              const event = item.event as NotificationEvent

              return (
                <SettingRow
                  key={item.event}
                  label={NOTIFICATION_EVENT_LABELS[event] ?? item.event}
                  control={
                    <div className="flex w-full items-center gap-3">
                      <EventIcon event={event} />
                      <span className="text-caption text-muted-foreground">
                        {item.emailEnabled
                          ? "Chega por e-mail"
                          : "Só na central"}
                      </span>
                      <Switch
                        checked={item.emailEnabled}
                        onCheckedChange={(next) => toggle(item.event, next)}
                        aria-label={`Receber ${NOTIFICATION_EVENT_LABELS[event]} por e-mail`}
                        className="ml-auto"
                      />
                    </div>
                  }
                />
              )
            })}
          </SettingGroup>
        ))}
      </div>
    </form>
  )
}
