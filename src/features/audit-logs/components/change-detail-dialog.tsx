import type { AuditLog, AuditValue } from "@/api/audit-logs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  AUDIT_ENTITY_LABELS,
  AUDIT_EVENT_LABELS,
  type AuditEventType,
} from "@/types/enums"

const FIELD_LABELS: Record<string, string> = {
  amountCents: "Valor",
  approvalLimitCents: "Alçada",
  availableAtTimeCents: "Saldo disponível na hora",
  categoryId: "Categoria",
  costCenterId: "Centro de custo",
  decision: "Decisão",
  divergenceCount: "Divergências",
  dueAt: "Prazo",
  dueDate: "Vencimento",
  expectedApproverId: "Aprovador esperado",
  hasDivergence: "Tem divergência",
  issuerCnpj: "CNPJ do emitente",
  justification: "Justificativa",
  linkedToOrder: "Vinculada à ordem",
  note: "Observação",
  number: "Número",
  onBehalfOfId: "Em nome de",
  purchaseOrderNumber: "Ordem de compra",
  purchaseRequestNumber: "Pedido",
  ranges: "Faixas",
  reason: "Motivo",
  requiresOverride: "Exige liberação de exceção",
  reverted: "Estornado",
  revertedCents: "Valor estornado",
  role: "Perfil",
  status: "Situação",
  stepOrder: "Etapa",
  steps: "Etapas",
  supplierId: "Fornecedor",
  title: "Título",
  totalAmountCents: "Valor total",
  urgency: "Urgência",
}

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key
}

function display(value: AuditValue): string {
  if (value === null || value === "") {
    return "vazio"
  }

  if (typeof value === "boolean") {
    return value ? "sim" : "não"
  }

  return String(value)
}

function Row({
  field,
  before,
  after,
  changed,
}: {
  field: string
  before: AuditValue | undefined
  after: AuditValue | undefined
  changed: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_1fr] items-baseline gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[minmax(0,9rem)_1fr_1fr]">
      <span className="text-caption text-muted-foreground">
        {fieldLabel(field)}
      </span>

      {before === undefined ? (
        <span className="hidden text-caption text-muted-foreground/50 sm:block">
          —
        </span>
      ) : (
        <span
          className={cn(
            "hidden text-caption break-words sm:block",
            changed
              ? "text-muted-foreground line-through decoration-muted-foreground/40"
              : "text-muted-foreground",
          )}
        >
          {display(before)}
        </span>
      )}

      <span
        className={cn(
          "text-caption break-words",
          changed ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {after === undefined ? "—" : display(after)}
      </span>
    </div>
  )
}

export function ChangeDetailDialog({
  log,
  actorName,
  onOpenChange,
}: {
  log: AuditLog | null
  actorName: string
  onOpenChange: (open: boolean) => void
}) {
  const before = log?.oldData ?? {}
  const after = log?.newData ?? {}

  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])]

  const when = log
    ? new Date(log.occurredAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  return (
    <Dialog open={log !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {log
              ? AUDIT_EVENT_LABELS[log.eventType as AuditEventType]
              : "Registro"}
          </DialogTitle>
          <DialogDescription>
            {actorName} · {when}
            {log?.ipAddress ? ` · ${log.ipAddress}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-caption text-muted-foreground">
              {log ? (AUDIT_ENTITY_LABELS[log.entityType] ?? log.entityType) : ""}
            </span>
            <span className="text-micro tabular-nums text-muted-foreground/60">
              {log?.entityId}
            </span>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-lg border border-border bg-muted/25 px-4 py-3 text-caption leading-relaxed text-muted-foreground">
              Este evento não guardou detalhe de campos. O que ele registra é
              que a ação aconteceu, por quem e quando.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="hidden grid-cols-[minmax(0,9rem)_1fr_1fr] gap-x-4 border-b border-border bg-muted/35 px-4 py-2 sm:grid">
                <span className="text-overline text-muted-foreground/70">
                  Campo
                </span>
                <span className="text-overline text-muted-foreground/70">
                  Antes
                </span>
                <span className="text-overline text-muted-foreground/70">
                  Depois
                </span>
              </div>

              <div className="divide-y divide-border/50">
                {fields.map((field) => (
                  <Row
                    key={field}
                    field={field}
                    before={before[field]}
                    after={after[field]}
                    changed={
                      JSON.stringify(before[field]) !==
                      JSON.stringify(after[field])
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
