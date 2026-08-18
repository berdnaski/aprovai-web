import { cn } from "@/lib/utils"

import type { SetupPhase } from "../setup-phases"

export function SetupProgress({
  phases,
  currentPhase,
}: {
  phases: SetupPhase[]
  currentPhase: string
}) {
  const currentIndex = phases.findIndex((phase) => phase.key === currentPhase)
  const safeIndex = currentIndex < 0 ? 0 : currentIndex
  const current = phases[safeIndex]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-label font-semibold text-foreground">
          {current?.title}
        </p>

        <p className="text-caption font-medium text-muted-foreground tabular-nums">
          <span className="text-foreground">{safeIndex + 1}</span>
          <span className="mx-0.5 text-muted-foreground/50">/</span>
          {phases.length}
        </p>
      </div>

      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={safeIndex + 1}
        aria-valuemin={1}
        aria-valuemax={phases.length}
        aria-label={`Etapa ${safeIndex + 1} de ${phases.length}: ${current?.title}`}
      >
        {phases.map((phase, index) => {
          const isDone = index < safeIndex
          const isCurrent = index === safeIndex

          return (
            <span
              key={phase.key}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/70"
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                  isDone && "w-full bg-brand-accent/70",
                  isCurrent && "w-full bg-primary",
                  !isDone && !isCurrent && "w-0",
                )}
              />

              {isCurrent ? (
                <span className="absolute inset-y-0 right-0 w-8 animate-pulse rounded-full bg-linear-to-r from-transparent to-primary-foreground/25" />
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}
