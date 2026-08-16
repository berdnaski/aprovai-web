import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import logo from "@/assets/aprovai.svg"
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
import { useRegister } from "@/hooks/auth/use-register"

import { registerSchema, type RegisterFormValues } from "./register-schema"

const fieldClass =
  "h-10 rounded-lg border-border/70 bg-muted/50 px-4 text-[14px] md:text-[12px] placeholder:text-muted-foreground/70 focus-visible:bg-card"

export function RegisterPage() {
  const navigate = useNavigate()
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

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate(`/registrar/confirme-seu-email?email=${encodeURIComponent(values.email)}`)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-100">
        <div className="mb-9 flex flex-col items-center text-center">
          <img src={logo} alt="AprovAI" className="mb-8 h-7 w-auto" />
          <h3 className="leading-tight font-medium tracking-[-0.02em] text-foreground">
            Você pode criar uma conta em segundos!
          </h3>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Já tem uma conta?{" "}
            <a href="/logar" className="font-semibold text-foreground hover:text-primary">
              Entrar
            </a>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
                  <FormMessage />
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
                  <FormMessage />
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
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-[18px]" />
                        ) : (
                          <Eye className="size-[18px]" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="px-1 text-[12.5px]" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="mt-2 h-10 rounded-lg bg-primary text-[14px] cursor-pointer font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </Button>

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormControl>
                    <label className="flex cursor-pointer items-start justify-center gap-2.5 text-center text-[12px] leading-relaxed text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="mt-[3px] size-3.5 shrink-0 rounded-[4px] border-border accent-primary"
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
                  <FormMessage className="text-center text-[12.5px]" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
