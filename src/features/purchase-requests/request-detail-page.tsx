import {
  CopySimple,
  Gavel,
  PencilSimple,
  Prohibit,
  Trash,
  UserSwitch,
} from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useSession } from "@/hooks/auth/use-session"
import { useCategories } from "@/hooks/categories/use-categories"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import {
  useDeleteDraft,
  useDuplicateRequest,
  usePurchaseRequest,
  useRequestFiles,
  useRequestItems,
  useRequestTimeline,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { REQUEST_STATUS } from "@/lib/status-labels"
import { RequestStatus, URGENCY_LABELS } from "@/types/enums"

import { CancelDialog } from "./components/cancel-dialog"
import { DecideDialog } from "./components/decide-dialog"
import { ItemsTable } from "./components/items-table"
import { FilesPanel } from "./components/files-panel"
import { ReassignDialog } from "./components/reassign-dialog"
import { RequestTimelineView } from "./components/request-timeline"

const CANCELABLE: RequestStatus[] = [
  RequestStatus.PENDING,
  RequestStatus.CHANGES_REQUESTED,
  RequestStatus.APPROVED,
]

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { membership } = useSession()
  const { isFinanceAdmin } = usePermissions()

  const [deciding, setDeciding] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [reassigning, setReassigning] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const requestQuery = usePurchaseRequest(id)
  const { data: items = [] } = useRequestItems(id)
  const { data: files = [] } = useRequestFiles(id)
  const { data: timeline } = useRequestTimeline(id)
  const { data: costCenters = [] } = useCostCenters()
  const { data: categories = [] } = useCategories()

  const duplicate = useDuplicateRequest()
  const remove = useDeleteDraft()

  if (requestQuery.isPending) {
    return <DetailSkeleton />
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Pedidos", to: "/pedidos" }]}
          title="Pedido"
        />
        <LoadError
          message={getApiErrorMessage(requestQuery.error)}
          onRetry={() => void requestQuery.refetch()}
        />
      </div>
    )
  }

  const request = requestQuery.data
  const isOwner = membership?.memberId === request.requesterId
  const isDraft = request.status === RequestStatus.DRAFT
  const currentStep = timeline?.steps.find((step) => step.isCurrent)
  const canDecide =
    request.status === RequestStatus.PENDING &&
    currentStep?.expectedApproverId === membership?.memberId

  const costCenter = costCenters.find((cc) => cc.id === request.costCenterId)
  const category = categories.find((item) => item.id === request.categoryId)

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {canDecide ? (
        <Button
          size="lg"
          onClick={() => setDeciding(true)}
          className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Gavel size={15} aria-hidden />
          Decidir
        </Button>
      ) : null}

      {isDraft && isOwner ? (
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate(`/pedidos/${request.id}/editar`)}
          className="gap-1.5 font-medium"
        >
          <PencilSimple size={15} aria-hidden />
          Editar
        </Button>
      ) : null}

      {request.status === RequestStatus.PENDING && isFinanceAdmin ? (
        <Button
          size="lg"
          variant="outline"
          onClick={() => setReassigning(true)}
          className="gap-1.5 font-medium"
        >
          <UserSwitch size={15} aria-hidden />
          Reatribuir
        </Button>
      ) : null}

      <Button
        size="lg"
        variant="outline"
        disabled={duplicate.isPending}
        onClick={() =>
          duplicate.mutate(request.id, {
            onSuccess: (draft) => {
              toast.success(`Rascunho ${draft.number} criado.`)
              navigate(`/pedidos/${draft.id}/editar`)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
        className="gap-1.5 font-medium"
      >
        <CopySimple size={15} aria-hidden />
        Duplicar
      </Button>

      {CANCELABLE.includes(request.status) && (isOwner || isFinanceAdmin) ? (
        <Button
          size="lg"
          variant="outline"
          onClick={() => setCanceling(true)}
          className="gap-1.5 font-medium text-muted-foreground"
        >
          <Prohibit size={15} aria-hidden />
          Cancelar
        </Button>
      ) : null}

      {isDraft && isOwner ? (
        <Button
          size="lg"
          variant="ghost"
          onClick={() => setDeleting(true)}
          className="gap-1.5 font-medium text-muted-foreground hover:text-destructive"
        >
          <Trash size={15} aria-hidden />
          Excluir
        </Button>
      ) : null}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Pedidos", to: "/pedidos" },
          { label: request.number },
        ]}
        title={request.title}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={REQUEST_STATUS} value={request.status} />
            <MoneyDisplay
              cents={request.totalAmountCents}
              emphasis
              className="text-subhead"
            />
            <span className="text-subhead text-muted-foreground">
              urgência {URGENCY_LABELS[request.urgency].toLowerCase()}
            </span>
          </span>
        }
        action={actions}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <SettingGroup title="Dados do pedido">
            <SettingRow
              label="Centro de Custo"
              control={
                <span className="text-caption text-foreground">
                  {costCenter?.name ?? "—"}
                </span>
              }
            />
            <SettingRow
              label="Categoria"
              control={
                <span className="text-caption text-foreground">
                  {category?.name ?? "Sem categoria"}
                </span>
              }
            />
            <SettingRow
              label="Condições"
              control={
                <span className="text-caption text-foreground">
                  {request.paymentTerms ?? "Não informadas"}
                </span>
              }
            />
            {request.description ? (
              <SettingRow
                label="Descrição"
                control={
                  <p className="text-caption leading-relaxed text-foreground">
                    {request.description}
                  </p>
                }
              />
            ) : null}
          </SettingGroup>

          <ItemsTable
            requestId={request.id}
            items={items}
            totalCents={request.totalAmountCents}
            readOnly
          />

          <FilesPanel requestId={request.id} files={files} readOnly />
        </div>

        <SettingGroup title="Trilha de aprovação" className="h-fit">
          <div className="px-5 py-4">
            {timeline ? (
              <RequestTimelineView timeline={timeline} />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </div>
        </SettingGroup>
      </div>

      <DecideDialog
        request={request}
        timeline={timeline}
        open={deciding}
        onOpenChange={setDeciding}
      />

      <CancelDialog
        request={request}
        open={canceling}
        onOpenChange={setCanceling}
      />

      <ReassignDialog
        request={request}
        currentApproverId={currentStep?.expectedApproverId}
        open={reassigning}
        onOpenChange={setReassigning}
      />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Excluir ${request.number}?`}
        description="O rascunho e os itens dele somem. Como nunca foi enviado, ninguém foi notificado."
        confirmLabel={remove.isPending ? "Excluindo…" : "Excluir"}
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(request.id, {
            onSuccess: () => {
              toast.success("Rascunho excluído.")
              navigate("/pedidos")
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      />
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando pedido</span>

      <div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-8 w-80" />
        <Skeleton className="mt-3 h-5 w-64" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  )
}
