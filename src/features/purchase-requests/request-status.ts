import {
  Check,
  Clock,
  PencilSimple,
  Prohibit,
  X,
  type Icon,
} from "@phosphor-icons/react"

import { RequestStatus } from "@/types/enums"

export type RequestStatusTone =
  | "draft"
  | "waiting"
  | "attention"
  | "positive"
  | "negative"
  | "neutral"

export interface RequestStatusInfo {
  headline: string
  tone: RequestStatusTone
  icon: Icon
}

export const TONE_TEXT: Record<RequestStatusTone, string> = {
  draft: "text-muted-foreground",
  waiting: "text-primary",
  attention: "text-warning-strong",
  positive: "text-brand-accent-strong",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

/**
 * O que a pessoa vê primeiro não é "o status", é "o que falta e de quem
 * depende". Por isso PENDING vira o nome de quem decide, não a palavra
 * "pendente".
 */
export function requestStatusInfo(
  status: RequestStatus,
  currentApproverName?: string | null,
): RequestStatusInfo {
  switch (status) {
    case RequestStatus.DRAFT:
      return { headline: "Rascunho", tone: "draft", icon: PencilSimple }
    case RequestStatus.PENDING:
      return {
        headline: currentApproverName
          ? `Aguardando ${currentApproverName}`
          : "Em aprovação",
        tone: "waiting",
        icon: Clock,
      }
    case RequestStatus.CHANGES_REQUESTED:
      return {
        headline: "Devolvido para ajustes",
        tone: "attention",
        icon: PencilSimple,
      }
    case RequestStatus.APPROVED:
      return { headline: "Aprovado", tone: "positive", icon: Check }
    case RequestStatus.REJECTED:
      return { headline: "Recusado", tone: "negative", icon: X }
    case RequestStatus.CANCELED:
      return { headline: "Cancelado", tone: "neutral", icon: Prohibit }
    case RequestStatus.COMPLETED:
      return { headline: "Concluído", tone: "positive", icon: Check }
    default:
      return { headline: status, tone: "neutral", icon: Prohibit }
  }
}
