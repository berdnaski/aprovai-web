import { LoadError } from "@/components/shared/load-error"

export function SuppliersError({
  title = "Não foi possível carregar os fornecedores",
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return <LoadError title={title} message={message} onRetry={onRetry} />
}
