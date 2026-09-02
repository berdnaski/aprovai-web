import {
  ArrowLeft,
  CopySimple,
  Gavel,
  PencilSimple,
  Prohibit,
  ShoppingCart,
  Trash,
  UserSwitch,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { ItemsSummary } from "./components/items-summary"
import { RequestFacts } from "./components/request-facts"
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

      {request.status === RequestStatus.APPROVED && isFinanceAdmin ? (
        <Button
          size="lg"
          onClick={() => navigate(`/pedidos/${request.id}/emitir-ordem`)}
          className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <ShoppingCart size={15} aria-hidden />
          Emitir ordem de compra
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
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card px-7 py-6 shadow-xs">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Link
              to="/pedidos"
              className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeft size={13} aria-hidden />
              Pedidos
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-caption tabular-nums text-muted-foreground">
                {request.number}
              </span>
              <StatusBadge map={REQUEST_STATUS} value={request.status} />
              <span className="text-caption text-muted-foreground">
                urgência {URGENCY_LABELS[request.urgency].toLowerCase()}
              </span>
            </div>

            <h1 className="text-display text-balance text-foreground">
              {request.title}
            </h1>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <span className="text-overline text-muted-foreground/70">
              Valor total
            </span>
            <MoneyDisplay
              cents={request.totalAmountCents}
              emphasis
              className="text-[clamp(1.75rem,4vw,2.25rem)] leading-none font-bold tracking-[-0.03em]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
          {actions}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <RequestFacts
            description={request.description}
            facts={[
              { label: "Centro de custo", value: costCenter?.name ?? "—" },
              {
                label: "Categoria",
                value: category?.name ?? "Sem categoria",
                ...(category ? {} : { tone: "muted" as const }),
              },
              {
                label: "Condições",
                value: request.paymentTerms ?? "Não informadas",
                ...(request.paymentTerms ? {} : { tone: "muted" as const }),
              },
              {
                label: "Urgência",
                value: URGENCY_LABELS[request.urgency],
              },
            ]}
          />

          <ItemsSummary items={items} totalCents={request.totalAmountCents} />

          <FilesPanel requestId={request.id} files={files} readOnly />
        </div>

        <section className="flex h-fit flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          <header className="flex min-h-12 items-center border-b border-border px-5">
            <h2 className="text-caption font-medium text-foreground">
              Trilha de aprovação
            </h2>
          </header>

          <div className="px-5 py-5">
            {timeline ? (
              <RequestTimelineView timeline={timeline} />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </div>
        </section>
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
