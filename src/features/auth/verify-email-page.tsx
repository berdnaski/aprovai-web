import { useQuery } from "@tanstack/react-query"
import { Link, useSearchParams } from "react-router-dom"

import { verifyEmail } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const verifyQuery = useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: () => verifyEmail(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })

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

  if (verifyQuery.isPending) {
    return (
      <AuthLayout title="Confirmando seu e-mail">
        <div
          className="flex justify-center py-4"
          role="status"
          aria-label="Confirmando"
        >
          <span className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </AuthLayout>
    )
  }

  if (verifyQuery.isError) {
    return (
      <AuthLayout
        title="Não foi possível confirmar"
        description={getApiErrorMessage(verifyQuery.error)}
      >
        <Link
          to="/entrar"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 w-full rounded-xl font-semibold",
          )}
        >
          Voltar ao login
        </Link>
      </AuthLayout>
    )
  }

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

      <Link
        to="/entrar"
        className={cn(
          buttonVariants(),
          "h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover",
        )}
      >
        Entrar
      </Link>
    </AuthLayout>
  )
}
