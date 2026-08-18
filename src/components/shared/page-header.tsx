import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Breadcrumb {
  label: string
  to?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className,
}: {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Você está em">
          <ol className="flex flex-wrap items-center gap-1 text-caption text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                ) : null}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-subhead text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}
