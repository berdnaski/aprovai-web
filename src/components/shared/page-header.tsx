import {
  PageBreadcrumbs,
  type Breadcrumb,
} from "@/components/shared/page-breadcrumbs"
import { cn } from "@/lib/utils"

export type { Breadcrumb }

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className,
}: {
  title: string
  description?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs?.length ? <PageBreadcrumbs items={breadcrumbs} /> : null}

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
