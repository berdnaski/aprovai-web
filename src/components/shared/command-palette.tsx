import {
  BookmarkSimple,
  FileText,
  MagnifyingGlass,
  Package,
  Plus,
  Stack,
  UsersThree,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { listPurchaseRequests } from "@/api/purchase-requests"
import { listSuppliers } from "@/api/suppliers"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatusBadge } from "@/components/shared/status-badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { StatusPill } from "@/components/ui/data-table"
import { useSession } from "@/hooks/auth/use-session"
import { useCategories } from "@/hooks/categories/use-categories"
import { useMembers } from "@/hooks/members/use-members"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCnpj } from "@/lib/cnpj"
import { NAV_ICONS } from "@/lib/nav-icons"
import { visibleAreas } from "@/lib/permissions"
import { REQUEST_STATUS } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/types/enums"

interface Result {
  id: string
  group: string
  icon: Icon
  label: string
  detail?: string
  trailing?: React.ReactNode
  to: string
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)

  const term = useDebouncedValue(query, 250).trim()
  const searching = term.length >= 2

  const { membership } = useSession()
  const { data: costCenters = [] } = useCostCenters(open)
  const { data: categories = [] } = useCategories()
  const { data: members = [] } = useMembers()

  const requests = useQuery({
    queryKey: ["command", "requests", term],
    queryFn: () =>
      listPurchaseRequests({ view: "ALL", search: term, perPage: 5 }),
    enabled: open && searching,
  })

  const suppliers = useQuery({
    queryKey: ["command", "suppliers", term],
    queryFn: () => listSuppliers({ search: term, perPage: 5 }),
    enabled: open && searching,
  })

  const results = useMemo<Result[]>(() => {
    const needle = normalize(term)
    const out: Result[] = []

    if (!searching) {
      out.push({
        id: "novo-pedido",
        group: "Ações",
        icon: Plus,
        label: "Novo pedido",
        detail: "Começar por um documento ou preencher na mão",
        to: "/pedidos/novo",
      })
    }

    for (const area of visibleAreas(membership?.role ?? null)) {
      if (!needle || normalize(area.label).includes(needle)) {
        out.push({
          id: `nav-${area.key}`,
          group: "Ir para",
          icon: NAV_ICONS[area.key],
          label: area.label,
          to: area.to,
        })
      }
    }

    for (const request of requests.data?.items ?? []) {
      out.push({
        id: `req-${request.id}`,
        group: "Pedidos",
        icon: FileText,
        label: request.title,
        detail: request.number,
        trailing: (
          <span className="flex items-center gap-2">
            <MoneyDisplay cents={request.totalAmountCents} />
            <StatusBadge map={REQUEST_STATUS} value={request.status} />
          </span>
        ),
        to: `/pedidos/${request.id}`,
      })
    }

    for (const supplier of suppliers.data?.items ?? []) {
      out.push({
        id: `sup-${supplier.id}`,
        group: "Fornecedores",
        icon: Package,
        label: supplier.tradeName ?? supplier.legalName,
        detail: formatCnpj(supplier.cnpj),
        trailing: supplier.blocked ? (
          <StatusPill tone="danger">Bloqueado</StatusPill>
        ) : undefined,
        to: `/fornecedores/${supplier.id}`,
      })
    }

    if (needle) {
      for (const costCenter of costCenters) {
        if (normalize(costCenter.name).includes(needle)) {
          out.push({
            id: `cc-${costCenter.id}`,
            group: "Centros de Custo",
            icon: Stack,
            label: costCenter.name,
            detail: costCenter.code ?? undefined,
            to: `/centros-de-custo/${costCenter.id}`,
          })
        }
      }

      for (const category of categories) {
        if (normalize(category.name).includes(needle)) {
          out.push({
            id: `cat-${category.id}`,
            group: "Categorias",
            icon: BookmarkSimple,
            label: category.name,
            detail: category.description ?? undefined,
            to: "/categorias",
          })
        }
      }

      for (const member of members) {
        const name = member.user?.name ?? ""
        const email = member.user?.email ?? ""

        if (
          normalize(name).includes(needle) ||
          normalize(email).includes(needle)
        ) {
          out.push({
            id: `mem-${member.id}`,
            group: "Equipe",
            icon: UsersThree,
            label: name || email,
            detail: email,
            trailing: (
              <StatusPill tone="neutral">{ROLE_LABELS[member.role]}</StatusPill>
            ),
            to: `/equipe/${member.id}`,
          })
        }
      }
    }

    return out
  }, [
    term,
    searching,
    membership?.role,
    requests.data,
    suppliers.data,
    costCenters,
    categories,
    members,
  ])

  const active = Math.min(cursor, Math.max(results.length - 1, 0))

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  function close(next: boolean) {
    if (!next) {
      setQuery("")
      setCursor(0)
    }

    onOpenChange(next)
  }

  function go(result: Result) {
    close(false)
    navigate(result.to)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setCursor((current) => Math.min(current + 1, results.length - 1))
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setCursor((current) => Math.max(current - 1, 0))
    }

    if (event.key === "Enter" && results[active]) {
      event.preventDefault()
      go(results[active])
    }
  }

  const loading = searching && (requests.isFetching || suppliers.isFetching)
  const grouped = new Map<string, Result[]>()

  for (const item of results) {
    grouped.set(item.group, [...(grouped.get(item.group) ?? []), item])
  }

  let flat = -1

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <MagnifyingGlass
            size={16}
            aria-hidden
            className="shrink-0 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCursor(0)
            }}
            onKeyDown={onKeyDown}
            autoFocus
            aria-label="Buscar em todo o sistema"
            placeholder="Buscar pedidos, fornecedores, pessoas, telas…"
            className="h-12 w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
          />
          {loading ? (
            <span
              aria-hidden
              className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-border border-t-muted-foreground"
            />
          ) : null}
        </div>

        <div ref={listRef} className="max-h-88 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-caption leading-relaxed text-muted-foreground">
              {searching
                ? `Nada encontrado para "${term}".`
                : "Digite para buscar."}
            </p>
          ) : (
            [...grouped].map(([group, items]) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-2.5 py-1.5 text-overline text-muted-foreground/70">
                  {group}
                </p>

                {items.map((item) => {
                  flat += 1
                  const index = flat
                  const ItemIcon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={index}
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => go(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                        index === active ? "bg-muted" : "hover:bg-muted/60",
                      )}
                    >
                      <ItemIcon
                        size={15}
                        aria-hidden
                        className={cn(
                          "shrink-0",
                          index === active
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-caption text-foreground">
                          {item.label}
                        </span>
                        {item.detail ? (
                          <span className="block truncate text-micro text-muted-foreground/70">
                            {item.detail}
                          </span>
                        ) : null}
                      </span>

                      {item.trailing ? (
                        <span className="shrink-0">{item.trailing}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <footer className="flex items-center gap-4 border-t border-border bg-muted/25 px-4 py-2">
          {[
            ["↑↓", "navegar"],
            ["↵", "abrir"],
            ["esc", "fechar"],
          ].map(([key, label]) => (
            <span
              key={key}
              className="flex items-center gap-1.5 text-micro text-muted-foreground"
            >
              <kbd className="rounded border border-border bg-card px-1 py-px font-sans leading-none">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </footer>
      </DialogContent>
    </Dialog>
  )
}
