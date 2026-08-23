import { Envelope, X } from "@phosphor-icons/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  useCreateInvite,
  useInvites,
  useRevokeInvite,
} from "@/hooks/onboarding/use-onboarding"
import { cn } from "@/lib/utils"
import {
  CompanyMemberRole,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/types/enums"

import { inviteSchema, type InviteFormValues } from "../onboarding-schema"
import { StepFrame } from "./step-frame"

const ROLE_OPTIONS = [
  CompanyMemberRole.REQUESTER,
  CompanyMemberRole.APPROVER,
  CompanyMemberRole.FINANCE_ADMIN,
]

export function TeamStep({
  onBack,
  onFinish,
  isFinishing,
}: {
  onBack: () => void
  onFinish: () => void
  isFinishing: boolean
}) {
  const invitesQuery = useInvites()
  const createMutation = useCreateInvite()
  const revokeMutation = useRevokeInvite()

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      role: CompanyMemberRole.REQUESTER,
      defaultCostCenterId: "",
    },
  })

  const selectedRole = form.watch("role")

  function onSubmit(values: InviteFormValues) {
    createMutation.mutate(
      { email: values.email, role: values.role },
      {
        onSuccess: () => {
          toast.success(`Convite enviado para ${values.email}.`)
          form.reset({
            email: "",
            role: CompanyMemberRole.REQUESTER,
            defaultCostCenterId: "",
          })
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  const pendingInvites = (invitesQuery.data ?? []).filter(
    (invite) => invite.status === "PENDING",
  )

  return (
    <StepFrame
      question="Quem mais vai usar?"
      support="Cada pessoa recebe um convite por e-mail para criar a senha dela. Esta etapa é opcional: dá para convidar depois, a qualquer momento."
      onBack={onBack}
      onNext={onFinish}
      nextLabel={
        pendingInvites.length > 0
          ? "Concluir configuração"
          : "Concluir sem convidar"
      }
      isSubmitting={isFinishing}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-label text-foreground">
                  E-mail
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Envelope className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="colega@empresa.com.br"
                      className="h-12 pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-caption" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-label text-foreground">
                  O que essa pessoa faz
                </FormLabel>
                <div className="grid gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const isSelected = selectedRole === role

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => field.onChange(role)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          isSelected
                            ? "border-primary bg-primary/[0.04]"
                            : "border-border hover:border-border hover:bg-muted/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary"
                              : "border-muted-foreground/35",
                          )}
                        >
                          {isSelected ? (
                            <span className="size-1.5 rounded-full bg-primary" />
                          ) : null}
                        </span>

                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-body font-medium",
                              isSelected
                                ? "text-foreground"
                                : "text-foreground/90",
                            )}
                          >
                            {ROLE_LABELS[role]}
                          </span>
                          <span className="mt-0.5 block text-caption leading-relaxed text-muted-foreground">
                            {ROLE_DESCRIPTIONS[role]}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <FormMessage className="text-caption" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="outline"
            disabled={createMutation.isPending}
            className="h-11 self-start font-medium"
          >
            {createMutation.isPending ? "Enviando..." : "Enviar convite"}
          </Button>
        </form>
      </Form>

      {pendingInvites.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <p className="text-overline text-muted-foreground">
            Convites enviados ({pendingInvites.length})
          </p>

          <ul className="flex flex-col gap-2">
            {pendingInvites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-foreground">
                    {invite.email}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {ROLE_LABELS[invite.role]} · aguardando aceite
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeMutation.mutate(invite.id)}
                  disabled={revokeMutation.isPending}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remover convite de ${invite.email}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </StepFrame>
  )
}
