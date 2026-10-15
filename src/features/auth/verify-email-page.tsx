import { ArrowRight, WarningCircle } from "@phosphor-icons/react"
import { useMutation } from "@tanstack/react-query"
import { Link, useSearchParams } from "react-router-dom"

import { verifyEmail } from "@/api/auth"
import { getApiErrorMessage, getApiErrorStatus } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

const primaryButtonClass = cn(
  buttonVariants(),
  "h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover",
)

function Note({
  tone,
  children,
}: {
  tone: "success" | "warning"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3.5",
        tone === "success"
          ? "border-brand-accent/25 bg-brand-accent/6"
          : "border-warning/25 bg-warning/7",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone === "success"
            ? "bg-brand-accent/12 text-brand-accent-strong"
            : "bg-warning/12 text-warning-strong",
        )}
      >
        {tone === "success" ? (
          <ApprovalMark className="size-4" />
        ) : (
          <WarningCircle size={16} weight="fill" />
        )}
      </span>

      <p className="min-w-0 pt-0.5 text-caption leading-relaxed text-foreground">
        {children}
      </p>
    </div>
  )
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const verifyMutation = useMutation({ mutationFn: verifyEmail })

  if (!token) {
    return (
      <AuthLayout
        title="Link incompleto"
        description="Este endereço não traz o código de confirmação."
      >
        <div className="flex flex-col gap-5">
          <Note tone="warning">
            Alguns aplicativos de e-mail cortam o link ao abrir. Volte ao
            e-mail que enviamos e clique no botão direto por lá.
          </Note>

          <Link
            to="/entrar"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 w-full rounded-xl font-semibold",
            )}
          >
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (verifyMutation.isSuccess) {
    return (
      <AuthLayout
        title="Tudo certo"
        description="Seu e-mail está confirmado e a conta, ativa."
      >
        <div className="flex flex-col gap-5">
          <Note tone="success">
            Se você foi convidado para uma empresa, o convite aparece logo
            depois que você entrar.
          </Note>

          <Link to="/entrar" className={primaryButtonClass}>
            Entrar
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (verifyMutation.isError) {
    const isExpired = getApiErrorStatus(verifyMutation.error) === 400

    return (
      <AuthLayout
        title={isExpired ? "Este link já foi usado" : "Não deu para confirmar"}
        description={
          isExpired
            ? "Cada link de confirmação vale uma vez só."
            : "O link não pôde ser validado agora."
        }
      >
        <div className="flex flex-col gap-5">
          <Note tone="warning">
            {isExpired
              ? "Se você já confirmou antes, é só entrar. Se não, peça um link novo na tela de login."
              : getApiErrorMessage(verifyMutation.error)}
          </Note>

          <Link to="/entrar" className={primaryButtonClass}>
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Confirmar seu e-mail"
      description="Um clique e sua conta fica ativa."
    >
      <Button
        type="button"
        disabled={verifyMutation.isPending}
        onClick={() => verifyMutation.mutate(token)}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        {verifyMutation.isPending ? "Confirmando..." : "Confirmar e-mail"}
      </Button>
    </AuthLayout>
  )
}
