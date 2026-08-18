import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
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
import { useForgotPassword } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

import { AuthLayout } from "./auth-layout"

const schema = z.object({
  email: z.email("Informe um e-mail válido."),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "" },
  })

  if (forgotMutation.isSuccess) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        description="Se existir uma conta com esse endereço, o link de redefinição chega em instantes."
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
      title="Redefinir senha"
      description="Informe o e-mail da sua conta e enviamos um link para você criar uma nova senha."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            forgotMutation.mutate(values.email),
          )}
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
                    className="h-12 rounded-xl border-border/70 bg-muted/50 px-4 text-body md:text-body"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-1 text-caption" />
              </FormItem>
            )}
          />

          {forgotMutation.isError ? (
            <p className="px-1 text-caption text-destructive">
              {getApiErrorMessage(forgotMutation.error)}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={forgotMutation.isPending}
            className="mt-1 h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {forgotMutation.isPending ? "Enviando..." : "Enviar link"}
          </Button>

          <p className="mt-4 text-center text-label font-normal text-muted-foreground">
            Lembrou a senha?{" "}
            <Link
              to="/entrar"
              className="font-semibold text-foreground hover:text-primary"
            >
              Entrar
            </Link>
          </p>
        </form>
      </Form>
    </AuthLayout>
  )
}
