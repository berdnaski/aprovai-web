import { ArrowLeft, Check, WarningCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorDetails, getApiErrorMessage } from "@/api/client"
import type { CreateDraftPayload, SimilarRequest } from "@/api/purchase-requests"
import { LoadError } from "@/components/shared/load-error"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from "@/hooks/categories/use-categories"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import {
  useAddItem,
  useExtraction,
  usePurchaseRequest,
  useRequestFiles,
  useRequestItems,
  useSubmitRequest,
  useUpdateDraft,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { cn } from "@/lib/utils"
import { RequestStatus, URGENCY_LABELS, Urgency } from "@/types/enums"

import { resolveExtraction, titleFrom } from "./extraction"
import { DuplicateDialog } from "./components/duplicate-dialog"
import { ExtractionPanel } from "./components/extraction-panel"
import { FilesPanel } from "./components/files-panel"
import { ItemsTable } from "./components/items-table"
import { SubmitPanel, type Requirement } from "./components/submit-panel"

const URGENCIES: Urgency[] = [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH]
const PLACEHOLDER_TITLE = "Pedido sem título"

interface Draft {
  title: string
  description: string
  categoryId: string | null
  supplierId: string | null
  urgency: Urgency
  paymentTerms: string
}

function SaveState({
  saving,
  failed,
  saved,
}: {
  saving: boolean
  failed: boolean
  saved: boolean
}) {
  if (saving) {
    return (
      <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border-2 border-border border-t-muted-foreground"
        />
        Salvando
      </span>
    )
  }

  if (failed) {
    return (
      <span className="flex items-center gap-1.5 text-caption text-destructive">
        <WarningCircle size={13} aria-hidden />
        Não salvou
      </span>
    )
  }

  if (saved) {
    return (
      <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Check size={13} weight="bold" aria-hidden />
        Salvo
      </span>
    )
  }

  return null
}

export function RequestFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [draft, setDraft] = useState<Draft | null>(null)
  const [duplicates, setDuplicates] = useState<SimilarRequest[] | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [applied, setApplied] = useState(false)
  const [touched, setTouched] = useState(false)

  const requestQuery = usePurchaseRequest(id)
  const { data: items = [] } = useRequestItems(id)
  const { data: files = [] } = useRequestFiles(id)
  const { data: costCenters = [] } = useCostCenters()
  const { data: categories = [] } = useCategories()
  const suppliersQuery = useSuppliers({ perPage: 100 })

  const reading = searchParams.get("lendo") === "1"
  const extraction = useExtraction(id, Boolean(id) && !dismissed)
  const addItem = useAddItem(id ?? "")
  const update = useUpdateDraft(id ?? "")
  const submit = useSubmitRequest(id ?? "")

  const request = requestQuery.data
  const suppliers = suppliersQuery.data?.items ?? []

  if (request && draft === null) {
    setDraft({
      title: request.title === PLACEHOLDER_TITLE ? "" : request.title,
      description: request.description ?? "",
      categoryId: request.categoryId,
      supplierId: request.supplierId,
      urgency: request.urgency,
      paymentTerms: request.paymentTerms ?? "",
    })
  }

  if (requestQuery.isPending || !draft) {
    return <FormSkeleton />
  }

  if (requestQuery.isError || !request) {
    return <LoadError message={getApiErrorMessage(requestQuery.error)} />
  }

  if (request.status !== RequestStatus.DRAFT) {
    return (
      <LoadError
        title="Este pedido não é mais um rascunho"
        message="Depois de enviado, um pedido só muda por decisão de quem aprova."
        onRetry={() => navigate(`/pedidos/${request.id}`)}
      />
    )
  }

  const costCenter = costCenters.find((cc) => cc.id === request.costCenterId)
  const supplier = suppliers.find((item) => item.id === draft.supplierId)

  function save(next: Draft) {
    const title = next.title.trim()

    setTouched(true)
    update.mutate({
      title: title.length >= 3 ? title : PLACEHOLDER_TITLE,
      urgency: next.urgency,
      ...(next.description.trim()
        ? { description: next.description.trim() }
        : {}),
      ...(next.categoryId ? { categoryId: next.categoryId } : {}),
      ...(next.supplierId ? { supplierId: next.supplierId } : {}),
      ...(next.paymentTerms.trim()
        ? { paymentTerms: next.paymentTerms.trim() }
        : {}),
    } satisfies Partial<CreateDraftPayload>)
  }

  function set(patch: Partial<Draft>, persist = false) {
    const next = { ...(draft as Draft), ...patch }
    setDraft(next)

    if (persist) {
      save(next)
    }
  }

  const fields = extraction.data?.fields ?? null
  const resolved = fields
    ? resolveExtraction(fields, suppliers, categories)
    : null

  function applyExtraction() {
    if (!fields || !resolved || !draft) {
      return
    }

    const next: Draft = {
      ...draft,
      ...(resolved.supplier.match
        ? { supplierId: resolved.supplier.match.id }
        : {}),
      ...(resolved.category.match
        ? { categoryId: resolved.category.match.id }
        : {}),
      ...(resolved.paymentTerms ? { paymentTerms: resolved.paymentTerms } : {}),
      ...(draft.title.trim() ? {} : { title: titleFrom(fields, "") }),
    }

    setDraft(next)
    setApplied(true)
    save(next)

    if (resolved.totalAmountCents && items.length === 0) {
      addItem.mutate({
        description: fields.supplierName
          ? `Conforme documento de ${fields.supplierName}`
          : "Conforme documento",
        quantity: "1",
        unit: "un",
        unitPriceCents: resolved.totalAmountCents,
      })
    }
  }

  function send(confirmDuplicate: boolean) {
    submit.mutate(confirmDuplicate, {
      onSuccess: () => {
        toast.success("Pedido enviado para aprovação.")
        setDuplicates(null)
        navigate(`/pedidos/${id}`)
      },
      onError: (error) => {
        const similar = getApiErrorDetails(error)?.duplicates

        if (Array.isArray(similar) && similar.length > 0) {
          setDuplicates(similar as SimilarRequest[])
          return
        }

        toast.error(getApiErrorMessage(error))
      },
    })
  }

  const requirements: Requirement[] = [
    {
      label: "Título",
      done: draft.title.trim().length >= 3,
      missing: "Ao menos 3 caracteres.",
    },
    {
      label: "Centro de Custo",
      done: Boolean(request.costCenterId),
      missing: "Define o orçamento e quem aprova.",
    },
    {
      label: "Fornecedor",
      done: Boolean(draft.supplierId),
      missing: "O CNPJ é conferido na aprovação.",
    },
    {
      label: "Itens",
      done: items.length > 0,
      missing: "Ao menos um item.",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link
          to="/pedidos"
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft size={13} aria-hidden />
          Pedidos
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-display text-foreground">
            {draft.title.trim() || "Rascunho"}
          </h1>

          <span className="rounded bg-muted px-1.5 py-0.5 text-micro tabular-nums text-muted-foreground">
            {request.number}
          </span>

          <span className="ml-auto">
            <SaveState
              saving={update.isPending}
              failed={update.isError}
              saved={touched && update.isSuccess}
            />
          </span>
        </div>

        <p className="text-subhead text-muted-foreground">
          {costCenter?.name ?? "Sem Centro de Custo"}
          {supplier ? ` · ${supplier.tradeName ?? supplier.legalName}` : ""}
        </p>
      </header>

      {dismissed ? null : (
        <ExtractionPanel
          status={extraction.data?.status ?? (reading ? "QUEUED" : undefined)}
          failureReason={extraction.data?.failureReason ?? null}
          fields={fields}
          resolved={resolved}
          applied={applied}
          onApply={applyExtraction}
          onDismiss={() => setDismissed(true)}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <ItemsTable
            requestId={request.id}
            items={items}
            totalCents={request.totalAmountCents}
          />

          <SettingGroup title="Dados do pedido">
            <SettingRow
              label="Título"
              description="Como aparece na lista"
              control={
                <Input
                  value={draft.title}
                  onChange={(event) => set({ title: event.target.value })}
                  onBlur={() => save(draft)}
                  placeholder="Notebooks para o time de engenharia"
                  aria-label="Título do pedido"
                  className="h-9 max-w-md text-body md:text-body"
                />
              }
            />

            <SettingRow
              label="Fornecedor"
              description="Obrigatório para enviar"
              control={
                <Select
                  value={draft.supplierId}
                  onValueChange={(next) =>
                    set({ supplierId: (next ?? null) as string | null }, true)
                  }
                >
                  <SelectTrigger
                    className="h-9 w-64 bg-card px-3"
                    aria-label="Fornecedor"
                  >
                    <SelectValue>
                      {(value: string | null) =>
                        value
                          ? (suppliers.find((item) => item.id === value)
                              ?.tradeName ??
                            suppliers.find((item) => item.id === value)
                              ?.legalName ??
                            "Fornecedor")
                          : "Escolher"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Ainda não sei</SelectItem>
                    {suppliers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.tradeName ?? item.legalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <SettingRow
              label="Categoria"
              description="Opcional"
              control={
                <Select
                  value={draft.categoryId}
                  onValueChange={(next) =>
                    set({ categoryId: (next ?? null) as string | null }, true)
                  }
                >
                  <SelectTrigger
                    className="h-9 w-64 bg-card px-3"
                    aria-label="Categoria"
                  >
                    <SelectValue>
                      {(value: string | null) =>
                        value
                          ? (categories.find((item) => item.id === value)
                              ?.name ?? "Categoria")
                          : "Sem categoria"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <SettingRow
              label="Urgência"
              control={
                <div className="flex gap-1.5">
                  {URGENCIES.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => set({ urgency: level }, true)}
                      aria-pressed={draft.urgency === level}
                      className={cn(
                        "h-8 rounded-md border px-3 text-caption transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        draft.urgency === level
                          ? "border-primary/30 bg-primary/6 font-medium text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {URGENCY_LABELS[level]}
                    </button>
                  ))}
                </div>
              }
            />

            <SettingRow
              label="Condições"
              description="Opcional"
              control={
                <Input
                  value={draft.paymentTerms}
                  onChange={(event) => set({ paymentTerms: event.target.value })}
                  onBlur={() => save(draft)}
                  placeholder="30 dias após a entrega"
                  aria-label="Condições de pagamento"
                  className="h-9 max-w-md text-body md:text-body"
                />
              }
            />

            <SettingRow
              label="Descrição"
              description="Opcional"
              control={
                <textarea
                  value={draft.description}
                  onChange={(event) => set({ description: event.target.value })}
                  onBlur={() => save(draft)}
                  rows={3}
                  aria-label="Descrição"
                  placeholder="Contexto que ajude quem vai aprovar."
                  className="w-full max-w-md resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
              }
            />
          </SettingGroup>

          <FilesPanel requestId={request.id} files={files} />
        </div>

        <SubmitPanel
          requirements={requirements}
          totalCents={request.totalAmountCents}
          itemCount={items.length}
          isPending={submit.isPending}
          onSubmit={() => send(false)}
        />
      </div>

      <DuplicateDialog
        duplicates={duplicates ?? []}
        open={duplicates !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDuplicates(null)
          }
        }}
        onConfirm={() => send(true)}
        isPending={submit.isPending}
      />
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando rascunho</span>

      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-72" />
        <Skeleton className="mt-3 h-5 w-56" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  )
}
