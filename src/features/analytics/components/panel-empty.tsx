import type { Icon } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

export function PanelEmpty({
  icon: EmptyIcon,
  title,
  description,
  action,
}: {
  icon: Icon
  title: string
  description: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <EmptyIcon
        size={20}
        aria-hidden
        className="shrink-0 text-muted-foreground/40"
      />

      <p className="text-caption font-medium text-foreground">{title}</p>

      <p className="max-w-64 text-caption leading-relaxed text-muted-foreground">
        {description}
      </p>

      {action ? (
        <Link
          to={action.to}
          className="mt-1 rounded-md text-caption font-medium text-primary underline-offset-2 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
