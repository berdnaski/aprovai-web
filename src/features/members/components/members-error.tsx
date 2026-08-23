import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

export function MembersError({
  title = "Não foi possível carregar a equipe",
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/25 bg-destructive/5 px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        <WarningCircle size={20} />
      </span>

      <p className="text-body font-semibold text-foreground">{title}</p>

      <p className="mt-1.5 max-w-sm text-caption leading-relaxed text-muted-foreground">
        {message ??
          "A conexão falhou antes de os dados chegarem. Tente de novo em alguns segundos."}
      </p>

      {onRetry ? (
        <Button
          onClick={onRetry}
          variant="outline"
          size="lg"
          className="mt-5 gap-1.5 bg-card font-medium"
        >
          <ArrowClockwise size={15} aria-hidden />
          Tentar de novo
        </Button>
      ) : null}
    </div>
  )
}
