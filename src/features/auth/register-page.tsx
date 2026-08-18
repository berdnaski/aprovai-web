import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { getApiErrorMessage } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRegister, useResendVerification } from "@/hooks/auth/use-auth"
import { useCooldown } from "@/hooks/use-cooldown"

import { AuthLayout } from "./auth-layout"
import { registerSchema, type RegisterFormValues } from "./register-schema"

const fieldClass =
  "h-12 rounded-xl border-border/70 bg-muted/50 px-4 text-body md:text-body placeholder:text-muted-foreground/70 focus-visible:bg-card"

export function RegisterPage() {
  const registerMutation = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      termsAccepted: undefined,
    },
  })

  if (registerMutation.isSuccess) {
    return <VerificationSent email={registerMutation.data.email} />
  }

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      description={
        <>
          Já tem uma conta?{" "}
          <Link
            to="/entrar"
            className="font-semibold text-foreground hover:text-primary"
          >
            Entrar
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Seu nome completo"
                    autoComplete="name"
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha (mínimo 8 caracteres)"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-11`}
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
                        <EyeOff className="size-4.5" />
                      ) : (
                        <Eye className="size-4.5" />
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
            disabled={registerMutation.isPending}
            className="mt-2 h-12 rounded-xl bg-primary text-body font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
          </Button>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormControl>
                  <label className="flex cursor-pointer items-start justify-center gap-2.5 text-center text-caption leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="mt-0.75 size-3.5 shrink-0 rounded-sm border-border accent-primary"
                    />
                    <span>
                      Li e aceito os{" "}
                      <a
                        href="/termos"
                        className="text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a
                        href="/privacidade"
                        className="text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Política de Privacidade
                      </a>
                    </span>
                  </label>
                </FormControl>
                <FormMessage className="text-center text-caption" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </AuthLayout>
  )
}

function VerificationSent({ email }: { email: string }) {
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
    <AuthLayout
      title="Confirme seu e-mail"
      description={
        <>
          Enviamos um link de confirmação para{" "}
          <span className="font-medium text-foreground">{email}</span>. Abra o
          e-mail e clique no link para ativar sua conta.
        </>
      }
    >
      <div className="mb-7 flex justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
          <ApprovalMark className="size-6" />
        </span>
      </div>

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

        <p className="text-center text-label font-normal text-muted-foreground">
          Já confirmou?{" "}
          <Link
            to="/entrar"
            className="font-semibold text-foreground hover:text-primary"
          >
            Entrar
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
