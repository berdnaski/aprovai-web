import { cn } from "@/lib/utils"

export function RequestFacts({
  facts,
  description,
}: {
  facts: { label: string; value: string; tone?: "muted" }[]
  description?: string | null
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <dl className="grid divide-y divide-border/50 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={cn(
              "flex flex-col gap-1 px-5 py-4",
              index > 0 && "lg:border-l lg:border-border/50",
              index === 1 && "sm:border-l sm:border-border/50 lg:border-l",
              index > 1 && "sm:border-t sm:border-border/50 lg:border-t-0",
              index === 3 && "sm:border-l sm:border-border/50",
            )}
          >
            <dt className="text-overline text-muted-foreground/70">
              {fact.label}
            </dt>
            <dd
              className={cn(
                "text-body",
                fact.tone === "muted"
                  ? "text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {description ? (
        <div className="border-t border-border bg-muted/25 px-5 py-4">
          <p className="max-w-[70ch] text-body leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      ) : null}
    </section>
  )
}
