import { X } from "@phosphor-icons/react"

import type { Category } from "@/api/categories"
import type { CostCenter } from "@/api/cost-centers"
import type { Supplier } from "@/api/suppliers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { REQUEST_STATUS } from "@/lib/status-labels"
import { RequestStatus } from "@/types/enums"

export interface Filters {
  status?: RequestStatus[]
  costCenterId?: string
  supplierId?: string
  categoryId?: string
}

const STATUSES: RequestStatus[] = [
  RequestStatus.DRAFT,
  RequestStatus.PENDING,
  RequestStatus.CHANGES_REQUESTED,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
  RequestStatus.CANCELED,
  RequestStatus.COMPLETED,
]

function triggerClass(active: boolean) {
  return cn(
    "h-8 w-44 gap-1.5 px-2.5 text-caption",
    active
      ? "border-primary/25 bg-primary/6 text-primary"
      : "border-border bg-card text-muted-foreground",
  )
}

export function RequestFilters({
  value,
  onChange,
  costCenters,
  categories,
  suppliers,
}: {
  value: Filters
  onChange: (value: Filters) => void
  costCenters: CostCenter[]
  categories: Category[]
  suppliers: Supplier[]
}) {
  const active = Object.keys(value).length > 0
  const status = value.status?.[0] ?? null

  function set(patch: Filters) {
    const next = { ...value, ...patch }

    for (const key of Object.keys(next) as (keyof Filters)[]) {
      if (next[key] === undefined || next[key] === null) {
        delete next[key]
      }
    }

    onChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status}
        onValueChange={(next) =>
          set({ status: next ? [next as RequestStatus] : undefined })
        }
      >
        <SelectTrigger
          className={triggerClass(status !== null)}
          aria-label="Filtrar por situação"
        >
          <SelectValue>
            {(picked: string | null) =>
              picked ? REQUEST_STATUS[picked].label : "Situação"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Todas as situações</SelectItem>
          {STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {REQUEST_STATUS[item].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.costCenterId ?? null}
        onValueChange={(next) =>
          set({ costCenterId: (next ?? undefined) as string | undefined })
        }
      >
        <SelectTrigger
          className={triggerClass(Boolean(value.costCenterId))}
          aria-label="Filtrar por Centro de Custo"
        >
          <SelectValue>
            {(picked: string | null) =>
              picked
                ? (costCenters.find((cc) => cc.id === picked)?.name ??
                  "Centro de Custo")
                : "Centro de Custo"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Todos os Centros de Custo</SelectItem>
          {costCenters.map((costCenter) => (
            <SelectItem key={costCenter.id} value={costCenter.id}>
              {costCenter.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.supplierId ?? null}
        onValueChange={(next) =>
          set({ supplierId: (next ?? undefined) as string | undefined })
        }
      >
        <SelectTrigger
          className={triggerClass(Boolean(value.supplierId))}
          aria-label="Filtrar por fornecedor"
        >
          <SelectValue>
            {(picked: string | null) => {
              const supplier = picked
                ? suppliers.find((item) => item.id === picked)
                : undefined

              return supplier
                ? (supplier.tradeName ?? supplier.legalName)
                : "Fornecedor"
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Todos os fornecedores</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.tradeName ?? supplier.legalName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.categoryId ?? null}
        onValueChange={(next) =>
          set({ categoryId: (next ?? undefined) as string | undefined })
        }
      >
        <SelectTrigger
          className={triggerClass(Boolean(value.categoryId))}
          aria-label="Filtrar por categoria"
        >
          <SelectValue>
            {(picked: string | null) =>
              picked
                ? (categories.find((item) => item.id === picked)?.name ??
                  "Categoria")
                : "Categoria"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active ? (
        <button
          type="button"
          onClick={() => onChange({})}
          className="flex h-8 items-center gap-1 rounded-md px-2 text-caption text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X size={12} weight="bold" aria-hidden />
          Limpar
        </button>
      ) : null}
    </div>
  )
}
