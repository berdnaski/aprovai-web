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
import { useLogin } from "@/hooks/auth/use-login"
import { loginSchema, type LoginFormValues } from "./login-schema"

const fieldClass =
  "h-10 rounded-lg border-border/70 bg-muted/50 px-4 text-[14px] md:text-[12px] placeholder:text-muted-foreground/70 focus-visible:bg-card"

export function LoginPage() {
  const navigate = useNavigate()
  const registerMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    },
  })

  function onSubmit(values: LoginFormValues) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate(`/home`)
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
            Bem-vindo de volta!
          </h3>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Não tem uam conta?{" "}
            <a href="/registrar" className="font-semibold text-foreground hover:text-primary">
              Criar conta
            </a>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
              {registerMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
