import { cn } from "@/lib/utils"

export function BentoCard({
  eyebrow,
  title,
  body,
  visual,
  className,
}: {
  eyebrow: string
  title: string
  body: string
  visual: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-overline text-primary">{eyebrow}</p>
        <h3 className="text-heading leading-snug tracking-tight text-balance text-foreground">
          {title}
        </h3>
        <p className="max-w-[38ch] text-caption leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>

      <div className="mt-auto">{visual}</div>
    </article>
  )
}
