import { Warning } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { CostCenter } from "@/api/cost-centers"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  useDeleteCostCenter,
  useDisableCostCenter,
} from "@/hooks/cost-centers/use-cost-centers"

export type LifecycleAction = "disable" | "delete" | null

export function CostCenterLifecycleDialogs({
  costCenter,
  action,
  onClose,
  redirectOnSuccess = false,
}: {
  costCenter: CostCenter
  action: LifecycleAction
  onClose: () => void
  redirectOnSuccess?: boolean
}) {
  const navigate = useNavigate()
  const [deleteBlocked, setDeleteBlocked] = useState<string | null>(null)

  const disable = useDisableCostCenter()
  const remove = useDeleteCostCenter()

  function finish(message: string) {
    toast.success(message)
    onClose()

    if (redirectOnSuccess) {
      void navigate("/centros-de-custo")
    }
  }

  return (
    <>
      <ConfirmDialog
        open={action === "disable"}
        onOpenChange={(next) => {
          if (!next) {
            onClose()
          }
        }}
        title={`Inativar ${costCenter.name}?`}
        description="Nenhum pedido novo poderá nascer aqui. Os pedidos em andamento seguem até o fim normalmente, e o histórico fica preservado."
        confirmLabel={disable.isPending ? "Inativando…" : "Inativar centro"}
        isPending={disable.isPending}
        onConfirm={() =>
          disable.mutate(costCenter.id, {
            onSuccess: () =>
              finish(`${costCenter.name} não recebe pedidos novos.`),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      >
        <p className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/6 px-3.5 py-3 text-caption leading-relaxed text-foreground">
          <Warning
            size={15}
            weight="fill"
            className="mt-px shrink-0 text-warning-strong"
            aria-hidden
          />
          <span>
            Centros filhos ativos precisam ser inativados antes. Se houver
            algum, a operação será recusada.
          </span>
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={action === "delete"}
        onOpenChange={(next) => {
          if (!next) {
            setDeleteBlocked(null)
            onClose()
          }
        }}
        title={`Excluir ${costCenter.name}?`}
        description="A exclusão só é possível enquanto o centro não tiver histórico. Com pedidos, orçamento, filhos ou pessoas vinculadas, use a inativação."
        confirmLabel={remove.isPending ? "Excluindo…" : "Excluir centro"}
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(costCenter.id, {
            onSuccess: () => finish(`${costCenter.name} foi excluído.`),
            onError: (error) => setDeleteBlocked(getApiErrorMessage(error)),
          })
        }
      >
        {deleteBlocked ? (
          <p className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-caption leading-relaxed text-foreground">
            <Warning
              size={15}
              weight="fill"
              className="mt-px shrink-0 text-destructive"
              aria-hidden
            />
            <span>
              {deleteBlocked}{" "}
              <button
                type="button"
                onClick={() => {
                  setDeleteBlocked(null)
                  onClose()
                  disable.mutate(costCenter.id, {
                    onSuccess: () =>
                      finish(`${costCenter.name} não recebe pedidos novos.`),
                    onError: (error) => toast.error(getApiErrorMessage(error)),
                  })
                }}
                className="font-medium text-destructive underline underline-offset-3"
              >
                Inativar em vez de excluir
              </button>
            </span>
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  )
}
