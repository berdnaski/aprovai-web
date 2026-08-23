import { Skeleton } from "@/components/ui/skeleton"

export function CostCenterDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-live="polite">
      <span className="sr-only">Carregando Centro de Custo</span>

      <header className="flex flex-col gap-5">
        <Skeleton className="h-3 w-32" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </header>

      <div className="flex items-center gap-6 border-b border-border pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-6 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="px-5 py-5">
            <Skeleton className="h-44 w-full rounded-md" />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_minmax(0,360px)]">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <Skeleton className="h-4 w-44" />
            </div>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-0"
              >
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-1.5 h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-5"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-4 h-28 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
