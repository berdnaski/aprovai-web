export type StatusTone =
  | "neutral"
  | "progress"
  | "success"
  | "warning"
  | "danger"

export interface StatusMeta {
  label: string
  tone: StatusTone
}

function meta(label: string, tone: StatusTone): StatusMeta {
  return { label, tone }
}

export const INVITE_STATUS: Record<string, StatusMeta> = {
  PENDING: meta("Aguardando resposta", "warning"),
  ACCEPTED: meta("Aceito", "success"),
  EXPIRED: meta("Expirado", "neutral"),
  REVOKED: meta("Cancelado", "neutral"),
}

export const REQUEST_STATUS: Record<string, StatusMeta> = {
  DRAFT: meta("Rascunho", "neutral"),
  PENDING: meta("Em aprovação", "progress"),
  CHANGES_REQUESTED: meta("Ajustes solicitados", "warning"),
  APPROVED: meta("Aprovado", "success"),
  REJECTED: meta("Recusado", "danger"),
  CANCELED: meta("Cancelado", "neutral"),
  COMPLETED: meta("Concluído", "success"),
}

export const PURCHASE_ORDER_STATUS: Record<string, StatusMeta> = {
  DRAFT: meta("Rascunho", "neutral"),
  ISSUED: meta("Emitida", "progress"),
  SENT: meta("Enviada ao fornecedor", "progress"),
  PARTIALLY_RECEIVED: meta("Recebida em parte", "warning"),
  RECEIVED: meta("Recebida", "success"),
  CLOSED: meta("Encerrada", "neutral"),
  CANCELED: meta("Cancelada", "neutral"),
}

export const RECEIPT_STATUS: Record<string, StatusMeta> = {
  PARTIAL: meta("Parcial", "warning"),
  COMPLETE: meta("Completo", "success"),
  REJECTED: meta("Recusado", "danger"),
}

export const INVOICE_STATUS: Record<string, StatusMeta> = {
  RECEIVED: meta("Recebida", "progress"),
  MATCHED: meta("Conferida", "success"),
  DIVERGENT: meta("Com divergência", "warning"),
  APPROVED: meta("Aprovada", "success"),
  REJECTED: meta("Recusada", "danger"),
}

export const MATCH_STATUS: Record<string, StatusMeta> = {
  MATCHED: meta("Sem divergência", "success"),
  DIVERGENT: meta("Com divergência", "warning"),
  OVERRIDDEN: meta("Liberada com exceção", "warning"),
  REJECTED: meta("Recusada", "danger"),
}

export const PAYABLE_STATUS: Record<string, StatusMeta> = {
  BLOCKED: meta("Bloqueado", "danger"),
  RELEASED: meta("Liberado", "success"),
  PAID: meta("Pago", "success"),
  CANCELED: meta("Cancelado", "neutral"),
}

export const STEP_STATUS: Record<string, StatusMeta> = {
  WAITING: meta("Aguardando", "progress"),
  APPROVED: meta("Aprovado", "success"),
  REJECTED: meta("Recusado", "danger"),
  ESCALATED: meta("Escalado", "warning"),
  CANCELED: meta("Cancelado", "neutral"),
}

export const DECISION_TYPE: Record<string, StatusMeta> = {
  APPROVED: meta("Aprovou", "success"),
  REJECTED: meta("Recusou", "danger"),
  CHANGES_REQUESTED: meta("Pediu ajustes", "warning"),
  APPROVED_WITH_OVERRIDE: meta("Aprovou com exceção", "warning"),
}

export function resolveStatus(
  map: Record<string, StatusMeta>,
  value: string,
): StatusMeta {
  return map[value] ?? meta(value, "neutral")
}
