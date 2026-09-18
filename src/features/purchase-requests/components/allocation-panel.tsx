import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import {
  AllocationEditor,
  allocationIsValid,
  toAllocationPayload,
  type AllocationRow,
} from "@/components/shared/allocation-editor"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import {
  useReplaceRequestAllocations,
  useRequestAllocations,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { RequestStatus } from "@/types/enums"

const SPLIT_EDITABLE_STATUSES: RequestStatus[] = [
  RequestStatus.DRAFT,
  RequestStatus.CHANGES_REQUESTED,
]

function rowsFromServer(
  lines: { costCenterId: string; chartAccountId: string | null; shareBps: number }[],
): AllocationRow[] {
  return lines.map((line) => ({
    costCenterId: line.costCenterId,
    chartAccountId: line.chartAccountId,
    percent: (line.shareBps / 100).toString(),
  }))
}

function sameRows(a: AllocationRow[], b: AllocationRow[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every(
    (row, index) =>
      row.costCenterId === b[index].costCenterId &&
      row.chartAccountId === b[index].chartAccountId &&
      Number(row.percent) === Number(b[index].percent),
  )
}

export function AllocationPanel({
  requestId,
  requestStatus,
  primaryCostCenterId,
  totalCents,
  editable,
}: {
  requestId: string
  requestStatus: RequestStatus
  primaryCostCenterId: string
  totalCents: string
  editable: boolean
}) {
  const [rows, setRows] = useState<AllocationRow[] | null>(null)

  const allocationsQuery = useRequestAllocations(requestId)
  const costCentersQuery = useCostCenters()
  const accountsQuery = useChartAccounts()
  const replace = useReplaceRequestAllocations(requestId)

  const accounts = (accountsQuery.data ?? []).filter((item) => item.postable)
  const costCenters = (costCentersQuery.data ?? []).filter((item) => !item.disabledAt)

  const baseRows = allocationsQuery.data
    ? rowsFromServer(allocationsQuery.data.lines)
    : []

  useEffect(() => {
    setRows(null)
  }, [allocationsQuery.dataUpdatedAt])

  if (accountsQuery.isPending || accounts.length === 0) {
    return null
  }

  if (allocationsQuery.isPending) {
    return <Skeleton className="h-32 w-full rounded-lg" />
  }

  const effectiveRows = rows ?? baseRows
  const dirty = editable && rows !== null && !sameRows(rows, baseRows)
  const valid = allocationIsValid(effectiveRows, primaryCostCenterId)
  const lockSplit = editable && !SPLIT_EDITABLE_STATUSES.includes(requestStatus)

  const costCenterOptions = costCenters.map((item) => ({
    id: item.id,
    label: item.name,
  }))
  const accountOptions = accounts.map((item) => ({
    id: item.id,
    label: `${item.code} · ${item.name}`,
  }))

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">Rateio</h2>
        {!allocationsQuery.data?.custom ? (
          <span className="text-caption text-muted-foreground">
            automático, 100% no centro de custo do pedido
          </span>
        ) : null}

        {editable && dirty ? (
          <Button
            type="button"
            size="sm"
            disabled={!valid || replace.isPending}
            onClick={() => {
              if (!rows) {
                return
              }

              replace.mutate(toAllocationPayload(rows), {
                onSuccess: () => toast.success("Rateio atualizado."),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }}
            className="ml-auto h-7 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {replace.isPending ? "Salvando…" : "Salvar rateio"}
          </Button>
        ) : null}
      </header>

      <div className="px-5 py-4">
        {editable ? (
          <AllocationEditor
            rows={effectiveRows}
            onChange={setRows}
            costCenters={costCenterOptions}
            accounts={accountOptions}
            totalCents={totalCents}
            primaryCostCenterId={primaryCostCenterId}
            disabled={replace.isPending}
            lockSplit={lockSplit}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {effectiveRows.map((row, index) => {
              const costCenter = costCenterOptions.find(
                (item) => item.id === row.costCenterId,
              )
              const account = accountOptions.find(
                (item) => item.id === row.chartAccountId,
              )

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-caption text-foreground">
                    {costCenter?.label ?? "Centro de custo"}
                    {account ? (
                      <span className="text-muted-foreground">
                        {" · "}
                        {account.label}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-caption tabular-nums text-muted-foreground">
                    {row.percent}%
                    <MoneyDisplay
                      cents={(
                        (BigInt(totalCents || "0") *
                          BigInt(Math.round(Number(row.percent) * 100))) /
                        10000n
                      ).toString()}
                      className="font-medium text-foreground"
                    />
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
