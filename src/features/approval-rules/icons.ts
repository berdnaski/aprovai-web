import {
  Buildings,
  Stack,
  Tag,
  Target,
  type Icon,
} from "@phosphor-icons/react"

import type { ScopeKind } from "./matrix"

export const SCOPE_ICON: Record<ScopeKind, Icon> = {
  global: Buildings,
  "cost-center": Stack,
  category: Tag,
  combined: Target,
}
