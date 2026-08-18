import { useMutation } from "@tanstack/react-query"
import { Link, useSearchParams } from "react-router-dom"

import { verifyEmail } from "@/api/auth"
import { getApiErrorMessage, getApiErrorStatus } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

const loginButtonClass = cn(
  buttonVariants(),
  "h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover",
)

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const verifyMutation = useMutation({ mutationFn: verifyEmail })

  if (!token) {
    return (
      <AuthLayout
        title="Link inválido"
        description="Este endereço não tem um código de confirmação. Abra o link direto do e-mail que enviamos."
      >
        <Link
          to="/entrar"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 w-full rounded-xl font-semibold",
          )}
        >
          Ir para o login
        </Link>
      </AuthLayout>
    )
  }

  if (verifyMutation.isSuccess) {
    return (
      <AuthLayout
        title="E-mail confirmado"
        description="Sua conta está pronta. Entre para configurar sua empresa."
      >
        <div className="mb-7 flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
            <ApprovalMark className="size-6" />
          </span>
        </div>

        <Link to="/entrar" className={loginButtonClass}>
          Entrar
        </Link>
      </AuthLayout>
    )
  }

  if (verifyMutation.isError) {
    const isExpired = getApiErrorStatus(verifyMutation.error) === 400

    return (
      <AuthLayout
        title={isExpired ? "Este link já foi usado" : "Não foi possível confirmar"}
        description={
          isExpired
            ? "Cada link de confirmação vale uma vez só. Se você já confirmou, é só entrar. Caso contrário, peça um novo link na tela de login."
            : getApiErrorMessage(verifyMutation.error)
        }
      >
        <Link to="/entrar" className={loginButtonClass}>
          Ir para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Confirmar seu e-mail"
      description="Falta um passo para liberar sua conta."
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
