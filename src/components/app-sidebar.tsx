import * as React from "react"
import {
  BookMarkedIcon,
  BuildingIcon,
  ChartBarIcon,
  CreditCardIcon,
  FileCheckIcon,
  FileTextIcon,
  LayersIcon,
  PackageIcon,
  ReceiptIcon,
  ScaleIcon,
  ScrollTextIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"

import { NavGroup, type NavEntry } from "@/components/nav-group"
import { NavSupport } from "@/components/nav-support"
import { NavUser } from "@/components/nav-user"
import { WorkspaceBadge } from "@/components/workspace-badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NAV_AREAS, canSee, type NavArea } from "@/lib/permissions"
import { useSession } from "@/hooks/auth/use-session"

const ICONS: Record<string, React.ReactNode> = {
  "purchase-requests": <FileTextIcon />,
  "purchase-orders": <ShoppingCartIcon />,
  receipts: <TruckIcon />,
  invoices: <ReceiptIcon />,
  matching: <FileCheckIcon />,
  payables: <WalletIcon />,
  "cost-centers": <LayersIcon />,
  "approval-rules": <ScaleIcon />,
  suppliers: <PackageIcon />,
  categories: <BookMarkedIcon />,
  members: <UsersIcon />,
  "audit-logs": <ScrollTextIcon />,
  analytics: <ChartBarIcon />,
  billing: <CreditCardIcon />,
  company: <BuildingIcon />,
}

const GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "Compras",
    keys: [
      "purchase-requests",
      "purchase-orders",
      "receipts",
      "invoices",
      "matching",
      "payables",
    ],
  },
  {
    label: "Configuração",
    keys: [
      "cost-centers",
      "approval-rules",
      "suppliers",
      "categories",
      "members",
    ],
  },
  {
    label: "Administração",
    keys: ["analytics", "audit-logs", "billing", "company"],
  },
]

function toEntry(area: NavArea): NavEntry {
  return { label: area.label, to: area.to, icon: ICONS[area.key] }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { membership } = useSession()
  const role = membership?.role ?? null

  const groups = GROUPS.map((group) => ({
    label: group.label,
    entries: group.keys
      .map((key) => NAV_AREAS.find((area) => area.key === key))
      .filter((area): area is NavArea => Boolean(area) && canSee(area!, role))
      .map(toEntry),
  })).filter((group) => group.entries.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceBadge />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavGroup
            key={group.label}
            label={group.label}
            entries={group.entries}
          />
        ))}
        <NavSupport />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
