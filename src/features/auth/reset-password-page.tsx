import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { getApiErrorMessage } from "@/api/client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/shared/password-input"
import { useResetPassword } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

const schema = z.object({
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(72),
})

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const resetMutation = useResetPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { password: "" },
  })

  if (!token) {
    return (
      <AuthLayout
        title="Link inválido"
        description="Este endereço não tem um código de redefinição. Solicite um novo link."
      >
        <Link
          to="/esqueci-a-senha"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 w-full rounded-xl font-semibold",
          )}
        >
          Solicitar novo link
        </Link>
      </AuthLayout>
    )
  }

  function onSubmit(values: FormValues) {
    resetMutation.mutate(
      { token: token as string, password: values.password },
      {
        onSuccess: () => {
          toast.success("Senha alterada. Entre com a nova senha.")
          navigate("/entrar", { replace: true })
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <AuthLayout
      title="Criar nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder="Nova senha"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-1 text-caption" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            className="mt-1 h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {resetMutation.isPending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
