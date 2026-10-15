import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
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
import { useRegister } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"
import { registerSchema, type RegisterFormValues } from "./register-schema"
import { VerificationSent } from "./verification-sent"

const fieldClass =
  "h-12 rounded-xl border-border/70 bg-muted/50 px-4 text-body md:text-body placeholder:text-muted-foreground/70 focus-visible:bg-card"

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")
  const invitedEmail = searchParams.get("email")

  const registerMutation = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: invitedEmail ?? "",
      password: "",
      termsAccepted: undefined,
    },
  })

  if (registerMutation.isSuccess) {
    return (
      <VerificationSent
        email={registerMutation.data.email}
        description="Falta abrir o link que acabamos de enviar."
        back={{
          label: "Digitei o e-mail errado",
          onClick: () => registerMutation.reset(),
        }}
      />
    )
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
            to={redirect ? `/entrar?redirect=${encodeURIComponent(redirect)}` : "/entrar"}
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
                    readOnly={Boolean(invitedEmail)}
                    className={cn(
                      fieldClass,
                      invitedEmail && "cursor-not-allowed text-muted-foreground",
                    )}
                    {...field}
                  />
                </FormControl>
                {invitedEmail ? (
                  <p className="px-1 text-caption text-muted-foreground">
                    É para este e-mail que o convite foi emitido.
                  </p>
                ) : null}
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
                    placeholder="Senha (mínimo 8 caracteres)"
                    autoComplete="new-password"
                    className={fieldClass}
                    {...field}
                  />
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
                      <Link
                        to="/termos"
                        target="_blank"
                        className="text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link
                        to="/privacidade"
                        target="_blank"
                        className="text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Política de Privacidade
                      </Link>
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
