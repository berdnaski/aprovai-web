import {
  ArrowBendRightUp,
  Bell,
  ChartBar,
  Clock,
  FileArrowUp,
  FileText,
  Gavel,
  PencilSimple,
  Receipt,
  ShoppingCart,
  Stack,
  Truck,
  UsersThree,
  Wallet,
  type Icon,
} from "@phosphor-icons/react"

import type { NotificationEvent } from "@/types/enums"

export type NotificationTone = "neutral" | "brand" | "success" | "warning" | "danger"

export const NOTIFICATION_ICONS: Record<NotificationEvent, Icon> = {
  INVITE_RECEIVED: UsersThree,
  REQUEST_PENDING: Gavel,
  DECISION_MADE: FileText,
  REQUEST_RETURNED: PencilSimple,
  SLA_REMINDER: Clock,
  ESCALATED: ArrowBendRightUp,
  BUDGET_ALERT: Stack,
  MONTHLY_REPORT: ChartBar,
  PO_ISSUED: ShoppingCart,
  DELIVERY_OVERDUE: Truck,
  INVOICE_RECEIVED: Receipt,
  MATCH_DIVERGENT: FileArrowUp,
  PAYABLE_DUE: Wallet,
}

export const NOTIFICATION_TONES: Record<NotificationEvent, NotificationTone> = {
  INVITE_RECEIVED: "brand",
  REQUEST_PENDING: "brand",
  DECISION_MADE: "success",
  REQUEST_RETURNED: "warning",
  SLA_REMINDER: "warning",
  ESCALATED: "warning",
  BUDGET_ALERT: "warning",
  MONTHLY_REPORT: "neutral",
  PO_ISSUED: "brand",
  DELIVERY_OVERDUE: "danger",
  INVOICE_RECEIVED: "neutral",
  MATCH_DIVERGENT: "danger",
  PAYABLE_DUE: "warning",
}

export const NOTIFICATION_TONE_CLASS: Record<NotificationTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  brand: "border-border bg-muted text-muted-foreground",
  success: "border-border bg-muted text-muted-foreground",
  warning: "border-warning/25 bg-warning/10 text-warning-strong",
  danger: "border-destructive/25 bg-destructive/8 text-destructive",
}

export const FALLBACK_ICON: Icon = Bell
