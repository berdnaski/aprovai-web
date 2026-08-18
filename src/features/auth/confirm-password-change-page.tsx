import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button, buttonVariants } from "@/components/ui/button"
import { useConfirmPasswordChange } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

export function ConfirmPasswordChangePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const confirmMutation = useConfirmPasswordChange()

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

  if (confirmMutation.isSuccess) {
    return (
      <AuthLayout
        title="Senha alterada"
        description="Encerramos suas outras sessões por segurança. Entre com a nova senha."
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

  function onConfirm() {
    confirmMutation.mutate(token as string, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <AuthLayout
      title="Confirmar nova senha"
      description="Ao confirmar, sua nova senha passa a valer e todas as sessões abertas são encerradas."
    >
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          disabled={confirmMutation.isPending}
          onClick={onConfirm}
          className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {confirmMutation.isPending ? "Confirmando..." : "Confirmar alteração"}
        </Button>

        <Link
          to="/entrar"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-11 w-full rounded-xl text-label font-normal text-muted-foreground",
          )}
        >
          Não fui eu, cancelar
        </Link>
      </div>
    </AuthLayout>
  )
}
