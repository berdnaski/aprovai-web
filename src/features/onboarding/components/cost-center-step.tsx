import { Plus } from "@phosphor-icons/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { useSession } from "@/hooks/auth/use-session"
import {
  useCostCenters,
  useCreateCostCenter,
} from "@/hooks/onboarding/use-onboarding"

import {
  costCenterSchema,
  type CostCenterFormValues,
} from "../onboarding-schema"
import { StepFrame } from "./step-frame"

const SUGGESTIONS = ["Tecnologia", "Marketing", "Operações", "Administrativo"]

export function CostCenterStep({ onNext }: { onNext: () => void }) {
  const { membership } = useSession()
  const costCentersQuery = useCostCenters()
  const createMutation = useCreateCostCenter()

  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(costCenterSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      code: "",
      managerId: membership?.memberId ?? "",
    },
  })

  function addCostCenter(name: string) {
    createMutation.mutate(
      { name, code: null, managerId: membership?.memberId ?? "" },
      {
        onSuccess: () => {
          form.reset({
            name: "",
            code: "",
            managerId: membership?.memberId ?? "",
          })
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  const costCenters = costCentersQuery.data ?? []
  const existingNames = new Set(costCenters.map((item) => item.name))
  const available = SUGGESTIONS.filter((name) => !existingNames.has(name))

  return (
    <StepFrame
      question="De onde sai o dinheiro?"
      support="Centros de Custo são as áreas que gastam. Cada pedido de compra é lançado em um deles. Comece com um, adicione os outros quando precisar."
      onNext={onNext}
      nextDisabled={costCenters.length === 0}
      hint={
        costCenters.length === 0
          ? "Crie pelo menos um Centro de Custo para continuar."
          : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {costCenters.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {costCenters.map((costCenter) => (
              <li
                key={costCenter.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <ApprovalMark className="size-4 shrink-0 text-brand-accent" />
                <span className="flex-1 truncate text-body font-medium text-foreground">
                  {costCenter.name}
                </span>
                {costCenter.code ? (
                  <span className="text-caption text-muted-foreground tabular-nums">
                    {costCenter.code}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => addCostCenter(values.name))}
            className="flex gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Nome do Centro de Custo"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="outline"
              disabled={createMutation.isPending}
              className="h-12 shrink-0 px-4 font-medium"
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </form>
        </Form>

        {available.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted-foreground">
              Sugestões:
            </span>
            {available.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addCostCenter(name)}
                disabled={createMutation.isPending}
                className="rounded-full border border-border px-3 py-1 text-caption font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </StepFrame>
  )
}
