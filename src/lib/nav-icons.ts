import {
  BookmarkSimple,
  Buildings,
  ChartBar,
  CreditCard,
  FileText,
  Gavel,
  Package,
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
  conferral: Scales,
  payables: Wallet,
  "cost-centers": Stack,
  "approval-rules": Gavel,
  suppliers: Package,
  categories: BookmarkSimple,
  members: UsersThree,
  "audit-logs": Scroll,
  analytics: ChartBar,
  billing: CreditCard,
  company: Buildings,
}
