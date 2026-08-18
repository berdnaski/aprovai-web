import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorCode, getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/password-input"
import { useLogin, useResendVerification } from "@/hooks/auth/use-auth"
import { AuthLayout } from "@/features/auth/auth-layout"

import { loginSchema, type LoginFormValues } from "./login-schema"

const fieldClass =
  "h-12 rounded-xl border-border/70 bg-muted/50 px-4 text-body md:text-body placeholder:text-muted-foreground/70 focus-visible:bg-card"

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loginMutation = useLogin()
  const resendMutation = useResendVerification()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginFormValues) {
    setUnverifiedEmail(null)

    loginMutation.mutate(values, {
      onSuccess: (session) => {
        const redirect = searchParams.get("redirect")

        if (!session.membership) {
          navigate("/onboarding/empresa", { replace: true })
          return
        }

        navigate(redirect ?? "/", { replace: true })
      },
      onError: (error) => {
        if (getApiErrorCode(error) === "FORBIDDEN") {
          setUnverifiedEmail(values.email)
        }

        toast.error(getApiErrorMessage(error))
      },
    })
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      description={
        <>
          Ainda não tem conta?{" "}
          <Link
            to="/registrar"
            className="font-semibold text-foreground hover:text-primary"
          >
            Criar conta
          </Link>
        </>
      }
    >
      {unverifiedEmail ? (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/[0.06] p-4">
          <p className="text-label font-normal leading-relaxed text-foreground">
            Confirme seu e-mail antes de entrar. Enviamos um link para{" "}
            <span className="font-medium">{unverifiedEmail}</span>.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resendMutation.isPending}
            onClick={() =>
              resendMutation.mutate(unverifiedEmail, {
                onSuccess: () =>
                  toast.success("Novo link enviado. Confira sua caixa de entrada."),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
            className="mt-3 h-9 bg-card font-medium"
          >
            {resendMutation.isPending ? "Enviando..." : "Reenviar e-mail"}
          </Button>
        </div>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="E-mail corporativo"
                    autoComplete="email"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-1 text-caption" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder="Senha"
                    autoComplete="current-password"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-1 text-caption" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              to="/esqueci-a-senha"
              className="text-label font-normal text-muted-foreground hover:text-primary"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-1 h-12 rounded-xl bg-primary text-body font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
      </form>
    </Form>
    </AuthLayout>
  )
}
