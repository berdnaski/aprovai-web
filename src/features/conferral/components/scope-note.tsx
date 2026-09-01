import { Info } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

export function ScopeNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <Info size={15} aria-hidden className="mt-px shrink-0 text-muted-foreground" />

      <p className="text-caption leading-relaxed text-muted-foreground">
        A conferência trabalha com NF-e de produto, modelo 55. Serviço, frete e
        assinatura não passam por aqui: seguem pela liberação sem conferência em{" "}
        <Link
          to="/contas-a-pagar"
          className="rounded-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Contas a pagar
        </Link>
        . O arquivo original continua sendo guardado pela sua contabilidade.
      </p>
    </div>
  )
}
