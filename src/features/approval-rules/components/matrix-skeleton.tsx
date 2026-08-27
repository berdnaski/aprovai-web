import { Skeleton } from "@/components/ui/skeleton"

export function MatrixSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando a matriz de alçadas</span>

      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-[28rem] max-w-full" />
      </div>

      <div className="flex gap-8">
        <div className="hidden w-60 shrink-0 flex-col gap-2 xl:flex">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-11 w-full rounded-md" />
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
            </div>
          </div>

          <Skeleton className="h-[4.5rem] w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
