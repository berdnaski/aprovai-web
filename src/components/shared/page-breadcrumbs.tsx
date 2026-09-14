import { ArrowLeft, CaretRight } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export interface Breadcrumb {
  label: string
  to?: string
}

export function PageBreadcrumbs({
  items,
  className,
}: {
  items: Breadcrumb[]
  className?: string
}) {
  const parent = items.slice(0, -1).reverse().find((item) => item.to)

  return (
    <nav
      aria-label="Você está em"
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      {parent?.to ? (
        <Link
          to={parent.to}
          aria-label={`Voltar para ${parent.label}`}
          className="group flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:border-muted-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft
            size={13}
            weight="bold"
            aria-hidden
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          />
        </Link>
      ) : null}

      <ol className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isMiddle = index > 0 && !isLast

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                "flex items-center gap-1.5",
                isLast && "min-w-0",
                isMiddle && "hidden sm:flex",
              )}
            >
              {index > 0 ? (
                <CaretRight
                  size={11}
                  weight="bold"
                  aria-hidden
                  className="shrink-0 opacity-40"
                />
              ) : null}

              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="rounded-sm whitespace-nowrap transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate",
                    isLast && "font-medium text-foreground",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
