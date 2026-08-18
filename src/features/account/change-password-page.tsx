import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getApiErrorMessage } from "@/api/client"
import { PageHeader } from "@/components/shared/page-header"
import { PasswordInput } from "@/components/shared/password-input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useChangePassword } from "@/hooks/auth/use-auth"

const schema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter ao menos 8 caracteres.")
    .max(72),
})

type FormValues = z.infer<typeof schema>

export function ChangePasswordPage() {
  const changeMutation = useChangePassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  function onSubmit(values: FormValues) {
    changeMutation.mutate(values, {
      onSuccess: () => {
        form.reset()
        toast.success(
          "Enviamos um e-mail de confirmação. A senha muda quando você confirmar.",
        )
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Alterar senha"
        description="Por segurança, confirmamos a troca por e-mail antes de aplicar a nova senha."
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Alterar senha" }]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-md flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-label text-foreground">
                  Senha atual
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder="Sua senha de hoje"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-caption" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-label text-foreground">
                  Nova senha
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Pelo menos 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-caption" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={changeMutation.isPending}
            className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {changeMutation.isPending ? "Enviando..." : "Enviar confirmação"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
