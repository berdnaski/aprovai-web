import { Skeleton } from "@/components/ui/skeleton"

export function CostCentersSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando Centros de Custo</span>

      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-96" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-8 w-48" />
          <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
          <Skeleton className="mt-3 h-3 w-56" />
        </div>

        {[0, 1].map((index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-6 w-10" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between gap-6 border-b border-border pb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-56 rounded-lg" />
      </div>

      <ul className="flex flex-col gap-1.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <li
            key={index}
            className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-56" />
            </div>
            <Skeleton className="hidden h-1.5 w-32 rounded-full sm:block" />
            <div className="w-32">
              <Skeleton className="ml-auto h-4 w-24" />
              <Skeleton className="mt-1.5 ml-auto h-3 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
