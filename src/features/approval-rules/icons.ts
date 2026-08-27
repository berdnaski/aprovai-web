import {
  Buildings,
  Stack,
  Tag,
  Target,
  TreeStructure,
  type Icon,
} from "@phosphor-icons/react"

import type { ApproverType } from "@/types/enums"

import type { ScopeKind } from "./matrix"

export const SCOPE_ICON: Record<ScopeKind, Icon> = {
  global: Buildings,
  "cost-center": Stack,
  category: Tag,
  combined: Target,
}

export const APPROVER_TYPE_ICON: Record<ApproverType, Icon> = {
  DIRECT_MANAGER: TreeStructure,
  COST_CENTER_MANAGER: Stack,
}
