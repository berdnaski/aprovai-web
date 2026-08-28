import {
  BookmarkSimple,
  Buildings,
  ChartBar,
  CreditCard,
  FileArrowUp,
  FileText,
  Package,
  Receipt,
  Scales,
  Scroll,
  ShoppingCart,
  Stack,
  Truck,
  UsersThree,
  Wallet,
  type Icon,
} from "@phosphor-icons/react"

import type { NavAreaKey } from "@/lib/permissions"

export const NAV_ICONS: Record<NavAreaKey, Icon> = {
  "purchase-requests": FileText,
  "purchase-orders": ShoppingCart,
  receipts: Truck,
  invoices: Receipt,
  matching: FileArrowUp,
  payables: Wallet,
  "cost-centers": Stack,
  "approval-rules": Scales,
  suppliers: Package,
  categories: BookmarkSimple,
  members: UsersThree,
  "audit-logs": Scroll,
  analytics: ChartBar,
  billing: CreditCard,
  company: Buildings,
}
