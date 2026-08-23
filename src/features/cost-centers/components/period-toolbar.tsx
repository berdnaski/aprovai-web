import { CalendarBlank, DownloadSimple, Plus } from "@phosphor-icons/react"
import { toast } from "sonner"

import type { Budget } from "@/api/budgets"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useExportBudgetEntries } from "@/hooks/budgets/use-budgets"

import { CreateBudgetDialog } from "./create-budget-dialog"
import { formatPeriodLabel, isCurrentPeriod } from "../period"

export function PeriodToolbar({
  budgets,
  value,
  onChange,
  costCenterId,
}: {
  budgets: Budget[]
  value: string
  onChange: (budgetId: string) => void
  costCenterId: string
}) {
  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  const exportCsv = useExportBudgetEntries()

  const labelOf = (id: string) => {
    const budget = budgets.find((item) => item.id === id)
    return budget ? formatPeriodLabel(budget) : "Selecione o período"
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) {
            onChange(next)
          }
        }}
      >
        <SelectTrigger
          className="h-9 min-w-48 gap-2 bg-card px-3 font-medium hover:bg-muted/60"
          aria-label="Período do orçamento"
        >
          <CalendarBlank
            size={15}
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
          <SelectValue>{(id: string) => labelOf(id)}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {budgets.map((budget) => (
            <SelectItem key={budget.id} value={budget.id}>
              <span className="flex items-center gap-2">
                {formatPeriodLabel(budget)}
                {isCurrentPeriod(budget) ? (
                  <span className="rounded border border-primary/20 bg-primary/[0.07] px-1.5 text-caption font-medium text-primary">
                    atual
                  </span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        {canManage ? (
          <CreateBudgetDialog
            costCenterId={costCenterId}
            trigger={
              <Button
                variant="outline"
                className="h-9 gap-1.5 bg-card px-3 font-medium"
              >
                <Plus size={15} weight="bold" aria-hidden />
                Novo período
              </Button>
            }
          />
        ) : null}

        <Button
          variant="outline"
          disabled={!value || exportCsv.isPending}
          onClick={() =>
            exportCsv.mutate(value, {
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }
          className="h-9 gap-2 bg-card px-3 font-medium"
        >
          <DownloadSimple size={15} aria-hidden />
          {exportCsv.isPending ? "Gerando…" : "Exportar CSV"}
        </Button>
      </div>
    </div>
  )
}
