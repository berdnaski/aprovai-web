import { useState } from "react"
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { WaitlistJoined } from "@/api/marketing"
import { ApprovalMark } from "@/components/shared/approval-mark"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useJoinWaitlist } from "@/hooks/marketing/use-marketing"
import { formatPhone, isValidPhone, phoneDigits } from "@/lib/people"
import { cn } from "@/lib/utils"

type Tone = "light" | "dark"

const SHELL: Record<Tone, string> = {
  light:
    "border-border bg-card shadow-[0_2px_4px_oklch(0.2_0_0/0.04)] focus-within:ring-ring/50",
  dark: "border-ink-border bg-ink-2/80 backdrop-blur-sm focus-within:ring-primary/40",
}

const INPUT: Record<Tone, string> = {
  light: "text-foreground placeholder:text-muted-foreground",
  dark: "text-ink-foreground placeholder:text-ink-muted",
}

const ICON: Record<Tone, string> = {
  light: "text-muted-foreground",
  dark: "text-ink-muted",
}

const DONE: Record<Tone, string> = {
  light: "border-border bg-card text-foreground",
  dark: "border-ink-border bg-ink-2/80 text-ink-foreground",
}

const DONE_HINT: Record<Tone, string> = {
  light: "text-muted-foreground",
  dark: "text-ink-muted",
}

const FIELD =
  "h-11 w-full rounded-[10px] border bg-card px-3 text-[14px] leading-5 text-foreground outline-none transition-shadow duration-150 ease-out placeholder:text-muted-foreground focus-visible:ring-3"

export function WaitlistForm({
  source,
  tone = "light",
  inputId,
}: {
  source: string
  tone?: Tone
  inputId: string
}) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [open, setOpen] = useState(false)
  const [joined, setJoined] = useState<WaitlistJoined | null>(null)
  const [confirmedEmail, setConfirmedEmail] = useState("")
  const joinWaitlist = useJoinWaitlist()

  const digits = phoneDigits(phone)
  const phoneError =
    digits.length > 0 && !isValidPhone(digits)
      ? "Informe DDD e número, ou deixe em branco."
      : undefined

  function openDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (email.trim()) {
      setOpen(true)
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const address = email.trim()

    if (!address || phoneError || joinWaitlist.isPending) {
      return
    }

    joinWaitlist.mutate(
      {
        email: address,
        name: name.trim() || undefined,
        phone: digits || undefined,
        source,
      },
      {
        onSuccess: (result) => {
          setJoined(result)
          setConfirmedEmail(address)
          setOpen(false)
          setEmail("")
          setName("")
          setPhone("")
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  if (joined) {
    return (
      <div
        className={cn(
          "flex w-full max-w-[500px] items-center gap-3.5 rounded-[16px] border px-5 py-4",
          DONE[tone],
        )}
        role="status"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
          <ApprovalMark className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-[14.5px] leading-5 font-semibold">
            {joined.alreadyOnList
              ? "Você já está na lista"
              : "Tudo certo, você está na lista"}
          </p>
          <p className={cn("mt-0.5 text-[13px] leading-5", DONE_HINT[tone])}>
            Quando o AprovAI abrir, a gente chama você por{" "}
            <span className="font-medium">{confirmedEmail}</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-[500px] flex-col gap-2.5">
      <form
        onSubmit={openDetails}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-[16px] border p-1.5 pl-3.5 transition-shadow duration-150 ease-out focus-within:ring-3 sm:gap-2.5 sm:p-2 sm:pl-4",
          SHELL[tone],
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          E-mail de trabalho
        </label>
        <EnvelopeSimple
          size={18}
          className={cn("hidden shrink-0 min-[380px]:block", ICON[tone])}
        />
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Seu e-mail de trabalho"
          className={cn(
            "h-11 min-w-0 flex-1 self-stretch bg-transparent text-[14px] leading-5 outline-none sm:h-[50px]",
            INPUT[tone],
          )}
        />
        <button
          type="submit"
          className="group flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[10px] bg-primary px-3 text-[14px] leading-5 font-semibold whitespace-nowrap text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-[50px] sm:gap-1.5 sm:px-5"
        >
          Entrar na lista
          <ArrowRight
            size={14}
            weight="bold"
            className="hidden transition-transform duration-200 ease-out group-hover:translate-x-0.5 min-[380px]:block"
          />
        </button>
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-[19px] leading-6 font-semibold">
                Como chamamos você?
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-6 text-muted-foreground">
                Quando abrir uma vaga, avisamos por e-mail. Se você deixar o
                telefone, a gente liga, que costuma ser mais rápido.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-6">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="waitlist-name"
                  className="text-[13px] leading-5 font-medium text-foreground"
                >
                  Seu nome
                </label>
                <input
                  id="waitlist-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  placeholder="Como podemos te chamar"
                  className={cn(FIELD, "border-border focus-visible:ring-ring/50")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="waitlist-phone"
                  className="text-[13px] leading-5 font-medium text-foreground"
                >
                  Telefone{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </label>
                <input
                  id="waitlist-phone"
                  type="tel"
                  inputMode="tel"
                  value={formatPhone(phone)}
                  onChange={(event) => setPhone(phoneDigits(event.target.value))}
                  autoComplete="tel"
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? "waitlist-phone-error" : undefined}
                  placeholder="(11) 90000-0000"
                  className={cn(
                    FIELD,
                    "tabular",
                    phoneError
                      ? "border-destructive/50 focus-visible:ring-destructive/20"
                      : "border-border focus-visible:ring-ring/50",
                  )}
                />
                {phoneError ? (
                  <p
                    id="waitlist-phone-error"
                    className="text-[12.5px] leading-5 text-destructive"
                  >
                    {phoneError}
                  </p>
                ) : null}
              </div>

              <p className="rounded-[10px] border border-border bg-muted/50 px-3 py-2.5 text-[12.5px] leading-5 text-muted-foreground">
                Vamos escrever para{" "}
                <span className="font-medium text-foreground">
                  {email.trim()}
                </span>
                .
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card px-3.5 text-[14px] leading-5 font-medium text-foreground transition-colors duration-150 ease-out outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={Boolean(phoneError) || joinWaitlist.isPending}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-primary px-4 text-[14px] leading-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joinWaitlist.isPending ? "Enviando" : "Confirmar meu lugar"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
