import { useState } from "react"
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { WaitlistJoined } from "@/api/marketing"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { useJoinWaitlist } from "@/hooks/marketing/use-marketing"
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
  const [joined, setJoined] = useState<WaitlistJoined | null>(null)
  const joinWaitlist = useJoinWaitlist()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const address = email.trim()

    if (!address || joinWaitlist.isPending) {
      return
    }

    joinWaitlist.mutate(
      { email: address, source },
      {
        onSuccess: (result) => {
          setJoined(result)
          setEmail("")
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  if (joined) {
    return (
      <div
        className={cn(
          "flex w-full max-w-[500px] items-center gap-3 rounded-[16px] border px-4 py-4",
          DONE[tone],
        )}
        role="status"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
          <ApprovalMark className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] leading-5 font-semibold">
            {joined.alreadyOnList
              ? "Você já estava na lista"
              : "Pronto, você entrou na lista"}
          </p>
          <p className={cn("text-[13px] leading-5", DONE_HINT[tone])}>
            {joined.position > 0
              ? `Sua posição é a ${joined.position}. A gente avisa quando abrir.`
              : "A gente avisa assim que abrir vaga pra sua empresa."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-[500px] items-center gap-2.5 rounded-[16px] border p-2 pl-4 transition-shadow duration-150 ease-out focus-within:ring-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 max-sm:p-2",
        SHELL[tone],
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        E-mail de trabalho
      </label>
      <EnvelopeSimple size={18} className={cn("shrink-0 max-sm:hidden", ICON[tone])} />
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
          "h-[50px] min-w-0 flex-1 self-stretch bg-transparent text-[14px] leading-5 outline-none max-sm:px-2",
          INPUT[tone],
        )}
      />
      <button
        type="submit"
        disabled={joinWaitlist.isPending}
        className="group flex h-[50px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-primary px-5 text-[14px] leading-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full"
      >
        {joinWaitlist.isPending ? "Enviando" : "Entrar na lista"}
        <ArrowRight
          size={14}
          weight="bold"
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </button>
    </form>
  )
}
