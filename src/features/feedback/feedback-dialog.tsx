import {
  ArrowUpRight,
  Bug,
  ChatCircleDots,
  ImageSquare,
  Lightbulb,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import { useMyFeedbacks, useSubmitFeedback } from "@/hooks/feedback/use-feedback"
import { FEEDBACK_STATUS, pillTone } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import { FEEDBACK_KIND_LABELS, FeedbackKind } from "@/types/enums"

const MIN_MESSAGE = 10
const MAX_MESSAGE = 2000
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024

const KIND_ICON: Record<FeedbackKind, Icon> = {
  SUGGESTION: Lightbulb,
  BUG: Bug,
  OTHER: ChatCircleDots,
}

const KINDS: FeedbackKind[] = [
  FeedbackKind.SUGGESTION,
  FeedbackKind.BUG,
  FeedbackKind.OTHER,
]

const PLACEHOLDER: Record<FeedbackKind, string> = {
  SUGGESTION: "O que você esperava encontrar aqui?",
  BUG: "O que você fez, e o que aconteceu no lugar do esperado?",
  OTHER: "Manda ver.",
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function KindPicker({
  value,
  onChange,
}: {
  value: FeedbackKind
  onChange: (kind: FeedbackKind) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de feedback"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
    >
      {KINDS.map((kind) => {
        const KindIcon = KIND_ICON[kind]
        const active = value === kind

        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(kind)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-caption whitespace-nowrap transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <KindIcon
              size={13}
              weight={active ? "fill" : "regular"}
              aria-hidden
              className={active ? "text-primary" : undefined}
            />
            {FEEDBACK_KIND_LABELS[kind]}
          </button>
        )
      })}
    </div>
  )
}

function ScreenshotField({
  file,
  onSelect,
}: {
  file: File | null
  onSelect: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(() => {
    if (!preview) {
      return
    }

    return () => URL.revokeObjectURL(preview)
  }, [preview])

  function onPick(selected: File | undefined) {
    if (!selected) {
      return
    }

    if (selected.size > MAX_SCREENSHOT_BYTES) {
      toast.error("A imagem passa de 5 MB. Recorte só a parte com o problema.")
      return
    }

    onSelect(selected)
  }

  if (file && preview) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5">
        <img
          src={preview}
          alt=""
          className="size-9 shrink-0 rounded-md border border-border object-cover"
        />

        <span className="min-w-0 flex-1 truncate text-caption text-foreground">
          {file.name}
        </span>

        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Remover imagem"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => onPick(event.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 text-caption text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ImageSquare size={14} aria-hidden />
        Anexar print
      </button>
    </>
  )
}

function SendPanel({ onDone }: { onDone: () => void }) {
  const location = useLocation()
  const submit = useSubmitFeedback()

  const [kind, setKind] = useState<FeedbackKind>(FeedbackKind.SUGGESTION)
  const [message, setMessage] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)

  const trimmed = message.trim()
  const missing = MIN_MESSAGE - trimmed.length
  const canSubmit = trimmed.length >= MIN_MESSAGE && !submit.isPending

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    submit.mutate(
      { kind, message: trimmed, route: location.pathname, screenshot },
      {
        onSuccess: () => {
          toast.success("Feedback enviado. Obrigado!")
          onDone()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <KindPicker value={kind} onChange={setKind} />

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          maxLength={MAX_MESSAGE}
          autoFocus
          aria-label="Mensagem do feedback"
          placeholder={PLACEHOLDER[kind]}
          className="w-full resize-none bg-transparent px-1.5 py-1 text-body leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <ScreenshotField file={screenshot} onSelect={setScreenshot} />

          <span className="flex h-8 min-w-0 items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 text-caption text-muted-foreground">
            <ArrowUpRight size={13} aria-hidden className="shrink-0" />
            <span className="truncate">{location.pathname}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            {trimmed.length > 0 && missing > 0 ? (
              <span className="text-micro tabular-nums text-muted-foreground/70">
                faltam {missing}
              </span>
            ) : null}

            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className="gap-1.5"
            >
              <PaperPlaneTilt size={13} weight="fill" aria-hidden />
              {submit.isPending ? "Enviando" : "Enviar"}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-micro leading-relaxed text-muted-foreground/70">
        Vai junto a tela em que você está e o navegador, para a gente conseguir
        reproduzir.
      </p>
    </form>
  )
}

function HistoryPanel() {
  const mine = useMyFeedbacks()
  const items = mine.data?.items ?? []

  if (mine.isPending) {
    return (
      <p className="py-8 text-center text-caption text-muted-foreground">
        Carregando...
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-caption leading-relaxed text-muted-foreground">
        Você ainda não enviou nada.
        <br />
        Quando enviar, o andamento aparece aqui.
      </p>
    )
  }

  return (
    <ul className="-mx-1 flex max-h-72 flex-col divide-y divide-border/50 overflow-y-auto px-1">
      {items.map((item) => {
        const status = FEEDBACK_STATUS[item.status]
        const KindIcon = KIND_ICON[item.kind]

        return (
          <li key={item.id} className="flex items-start gap-3 py-3">
            <span
              aria-hidden
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            >
              <KindIcon size={14} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-caption leading-relaxed text-foreground">
                {item.message}
              </p>

              <p className="flex flex-wrap items-center gap-2">
                <StatusPill tone={pillTone(status.tone)}>
                  {status.label}
                </StatusPill>

                <span className="text-micro tabular-nums text-muted-foreground/60">
                  {shortDate(item.createdAt)}
                </span>

                {item.route ? (
                  <span className="truncate text-micro text-muted-foreground/60">
                    {item.route}
                  </span>
                ) : null}
              </p>

              {item.reply ? (
                <div className="mt-1 flex gap-2 rounded-lg border border-brand-accent/20 bg-brand-accent/6 px-3 py-2">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-brand-accent text-white"
                  >
                    <ChatCircleDots size={11} weight="fill" />
                  </span>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-micro font-medium text-brand-accent-strong">
                      Resposta do AprovAI
                    </span>
                    <p className="text-caption leading-relaxed text-foreground">
                      {item.reply}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mine = useMyFeedbacks(open)
  const sent = mine.data?.meta.total ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">Enviar feedback</DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Conta o que está atrapalhando ou o que faltou. Lemos tudo.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <Tabs defaultValue="send" className="mt-4">
            <TabsList>
              <TabsTab value="send">Escrever</TabsTab>
              <TabsTab value="history">
                Seus envios
                {sent > 0 ? (
                  <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
                    {sent}
                  </span>
                ) : null}
              </TabsTab>
              <TabsIndicator />
            </TabsList>

            <TabsPanel value="send" className="pt-4">
              <SendPanel onDone={() => onOpenChange(false)} />
            </TabsPanel>

            <TabsPanel value="history" className="pt-2">
              <HistoryPanel />
            </TabsPanel>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
