import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
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
import { Input } from "@/components/ui/input"
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
  const [showPassword, setShowPassword] = useState(false)

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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nova senha"
                      autoComplete="new-password"
                      className="h-12 rounded-xl border-border/70 bg-muted/50 px-4 pr-11 text-body md:text-body"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-[18px]" />
                      ) : (
                        <Eye className="size-[18px]" />
                      )}
                    </button>
                  </div>
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
