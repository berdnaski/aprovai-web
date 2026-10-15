import { EnvelopeSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { useResendVerification } from "@/hooks/auth/use-auth"
import { useCooldown } from "@/hooks/use-cooldown"

import { AuthLayout } from "./auth-layout"

export function VerificationSent({
  email,
  description,
  back,
}: {
  email: string
  description: string
  back: { label: string; onClick: () => void }
}) {
  const resendMutation = useResendVerification()
  const cooldown = useCooldown(60)

  function handleResend() {
    resendMutation.mutate(email, {
      onSuccess: () => {
        cooldown.start()
        toast.success("Link reenviado. Confira sua caixa de entrada.")
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <AuthLayout title="Confirme seu e-mail" description={description}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-xs">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          >
            <EnvelopeSimple size={17} />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="text-micro text-muted-foreground/70">
              Enviado para
            </span>
            <span className="truncate text-body font-medium text-foreground">
              {email}
            </span>
          </span>
        </div>

        <p className="text-caption leading-relaxed text-muted-foreground">
          O link vale uma vez só e chega em alguns segundos. Se não aparecer,
          procure por <span className="text-foreground">AprovAI</span> no spam
          ou na aba de promoções.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={cooldown.isActive || resendMutation.isPending}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {cooldown.isActive
              ? `Reenviar em ${cooldown.remaining}s`
              : resendMutation.isPending
                ? "Enviando..."
                : "Reenviar e-mail"}
          </Button>

          <button
            type="button"
            onClick={back.onClick}
            className="self-center rounded-md px-1 py-0.5 text-label font-normal text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {back.label}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
