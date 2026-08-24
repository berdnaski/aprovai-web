import type { Supplier } from "@/api/suppliers"
import { StatusPill } from "@/components/ui/data-table"
import {
  REGISTRATION_STATUS_LABELS,
  RegistrationStatus,
  SupplierUsage,
  VALIDATION_STATUS_LABELS,
  ValidationStatus,
} from "@/types/enums"

export function usageTone(usage: SupplierUsage): "success" | "warning" | "danger" {
  if (usage === SupplierUsage.ALLOWED) {
    return "success"
  }

  return usage === SupplierUsage.BLOCKS_APPROVAL ? "warning" : "danger"
}

export function UsagePill({ supplier }: { supplier: Supplier }) {
  if (supplier.usage === SupplierUsage.ALLOWED) {
    return (
      <StatusPill tone="success" dot>
        Liberado
      </StatusPill>
    )
  }

  return (
    <StatusPill tone={usageTone(supplier.usage)} dot>
      {supplier.blocked
        ? "Bloqueado"
        : supplier.usage === SupplierUsage.BLOCKS_APPROVAL
          ? "Trava aprovação"
          : "Trava pedido"}
    </StatusPill>
  )
}

export function RegistrationPill({ status }: { status: RegistrationStatus }) {
  return (
    <StatusPill
      tone={
        status === RegistrationStatus.ACTIVE
          ? "neutral"
          : status === RegistrationStatus.UNKNOWN
            ? "neutral"
            : "warning"
      }
    >
      {REGISTRATION_STATUS_LABELS[status]}
    </StatusPill>
  )
}

export function ValidationPill({ status }: { status: ValidationStatus }) {
  return (
    <StatusPill
      tone={
        status === ValidationStatus.VALIDATED
          ? "neutral"
          : status === ValidationStatus.FAILED
            ? "danger"
            : "warning"
      }
    >
      {VALIDATION_STATUS_LABELS[status]}
    </StatusPill>
  )
}
