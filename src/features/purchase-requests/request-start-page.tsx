import {
  ArrowLeft,
  ArrowUp,
  Paperclip,
  PencilSimpleLine,
  Stack,
  X,
} from "@phosphor-icons/react"
import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { requestExtraction, uploadFile } from "@/api/purchase-requests"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { useCreateDraft } from "@/hooks/purchase-requests/use-purchase-requests"
import { cn } from "@/lib/utils"

const PLACEHOLDER_TITLE = "Pedido sem título"
const MIN_TEXT = 20
const MAX_HEIGHT = 280

export function RequestStartPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [costCenterId, setCostCenterId] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const { data: costCenters = [] } = useCostCenters()
  const create = useCreateDraft()

  const ready = Boolean(costCenterId)
  const hasText = text.trim().length >= MIN_TEXT
  const canRead = ready && (hasText || file !== null) && !working

  function grow(element: HTMLTextAreaElement) {
    element.style.height = "auto"
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`
  }

  async function start(withExtraction: boolean) {
    if (!costCenterId || working) {
      return
    }

    setWorking(true)

    try {
      const draft = await create.mutateAsync({
        costCenterId,
        title: PLACEHOLDER_TITLE,
      })

      if (file) {
        await uploadFile(draft.id, file)
      }

      if (withExtraction && hasText) {
        await requestExtraction(draft.id, { text: text.trim() })
        navigate(`/pedidos/${draft.id}/editar?lendo=1`, { replace: true })
        return
      }

      navigate(`/pedidos/${draft.id}/editar`, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      setWorking(false)
    }
  }

  const hint = !ready
    ? "Escolha o Centro de Custo"
    : !hasText && !file
      ? "Cole o texto do documento"
      : hasText
        ? "Enter para enviar"
        : "O anexo vai junto do pedido"

  return (
    <div className="flex min-h-[calc(100svh-13rem)] flex-col">
      <Link
        to="/pedidos"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        Pedidos
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-7 py-10">
        <header className="flex flex-col items-center gap-2.5 text-center">
          <h1 className="text-display text-foreground">Novo pedido</h1>
          <p className="max-w-lg text-subhead text-muted-foreground">
            Cole o orçamento, a proposta ou o e-mail do fornecedor. Os dados são
            lidos e preenchidos no rascunho para você conferir.
          </p>
        </header>

        <div
          className={cn(
            "flex flex-col rounded-xl border border-border bg-card shadow-xs transition-colors",
            "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring",
          )}
        >
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              grow(event.currentTarget)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && canRead) {
                event.preventDefault()
                void start(true)
              }
            }}
            rows={3}
            aria-label="Texto do orçamento"
            placeholder="Cole aqui a proposta, o orçamento ou o e-mail do fornecedor"
            className={cn(
              "w-full resize-none bg-transparent px-4 pt-4 pb-2 text-body text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus-visible:outline-none",
            )}
          />

          {file ? (
            <div className="mx-3 mb-1 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
              <Paperclip
                size={13}
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remover anexo"
                className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X size={11} aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5 px-3 pb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Anexar arquivo"
              title="Anexar arquivo"
              className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Paperclip size={14} aria-hidden />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null
                setFile(picked)
                event.target.value = ""
              }}
            />

            <Select
              value={costCenterId}
              onValueChange={(next) =>
                setCostCenterId((next ?? null) as string | null)
              }
            >
              <SelectTrigger
                aria-label="Centro de Custo"
                className={cn(
                  "h-8 w-auto max-w-60 gap-1.5 rounded-md border px-2.5 text-caption",
                  ready
                    ? "border-primary/25 bg-primary/6 text-primary"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                <Stack size={13} aria-hidden className="shrink-0" />
                <SelectValue>
                  {(value: string | null) =>
                    value
                      ? (costCenters.find((cc) => cc.id === value)?.name ??
                        "Centro de Custo")
                      : "Centro de Custo"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {costCenters.map((costCenter) => (
                  <SelectItem key={costCenter.id} value={costCenter.id}>
                    {costCenter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="ml-auto flex items-center gap-2.5">
              <span className="hidden text-micro text-muted-foreground/70 sm:block">
                {hint}
              </span>

              <button
                type="button"
                onClick={() => void start(true)}
                disabled={!canRead}
                aria-label="Ler documento e criar rascunho"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  canRead
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "bg-muted text-muted-foreground/50",
                )}
              >
                {working ? (
                  <span
                    aria-hidden
                    className="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current"
                  />
                ) : (
                  <ArrowUp size={15} weight="bold" aria-hidden />
                )}
              </button>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="max-w-md text-center text-caption leading-relaxed text-muted-foreground/70">
            A leitura é feita sobre o texto colado. O anexo (PDF, JPG ou PNG)
            fica guardado no pedido para quem vai aprovar.
          </p>

          <button
            type="button"
            onClick={() => void start(false)}
            disabled={!ready || working}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-caption transition-colors",
              "text-muted-foreground hover:text-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <PencilSimpleLine size={13} aria-hidden />
            {ready
              ? "Prefiro preencher na mão"
              : "Escolha o Centro de Custo para preencher na mão"}
          </button>
        </div>
      </div>
    </div>
  )
}
