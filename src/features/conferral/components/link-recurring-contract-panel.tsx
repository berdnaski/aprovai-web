import { ArrowsClockwise } from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Invoice } from "@/api/invoices"
import type { Supplier } from "@/api/suppliers"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRecurringContracts, useLinkInvoiceToRecurringContract } from "@/hooks/recurring-contracts/use-recurring-contracts"
import { formatCents } from "@/lib/money"
import { onlyDigits } from "@/lib/cnpj"
import { RECURRING_FREQUENCY_LABELS } from "@/types/enums"

const MIN_OVERRIDE_NOTE = 10

export function LinkRecurringContractPanel({
  invoice,
  suppliers,
}: {
  invoice: Invoice
  suppliers: Supplier[]
}) {
  const [contractId, setContractId] = useState<string | null>(null)
  const [overrideNote, setOverrideNote] = useState("")
  const [mismatch, setMismatch] = useState(false)

  const contractsQuery = useRecurringContracts({ active: true })
  const link = useLinkInvoiceToRecurringContract()

  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]))
  const issuerCnpj = onlyDigits(invoice.issuerCnpj)

  const contracts = (contractsQuery.data ?? []).filter((contract) => {
    const supplier = supplierById.get(contract.supplierId)
    return supplier ? onlyDigits(supplier.cnpj) === issuerCnpj : false
  })

  if (contracts.length === 0) {
    return null
  }

  const chosen = contracts.find((contract) => contract.id === contractId)

  function submit() {
    if (!contractId) {
      return
    }

    link.mutate(
      { invoiceId: invoice.id, contractId, overrideNote: overrideNote.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Nota ligada à assinatura recorrente.")
          setMismatch(false)
        },
        onError: (error) => {
          setMismatch(true)
          toast.error(getApiErrorMessage(error))
        },
      },
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex items-start gap-3 border-b border-border px-5 py-4">
        <ArrowsClockwise
          size={16}
          aria-hidden
          className="mt-0.5 shrink-0 text-primary"
        />
        <div className="min-w-0">
          <p className="text-caption font-medium text-foreground">
            Ou ligue a uma assinatura recorrente
          </p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            Este fornecedor tem assinatura ativa. Ligue a nota ao ciclo que
            está aguardando, em vez de vincular a uma ordem de compra.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-5 py-4">
        <Select
          value={contractId}
          onValueChange={(next) => setContractId((next ?? null) as string | null)}
        >
          <SelectTrigger className="h-9 w-full bg-card px-3" aria-label="Assinatura recorrente">
            <SelectValue>
              {(value: string | null) => {
                const found = contracts.find((item) => item.id === value)
                return found
                  ? `${found.title} · ${RECURRING_FREQUENCY_LABELS[found.frequency]}`
                  : "Escolher assinatura"
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {contracts.map((contract) => (
              <SelectItem key={contract.id} value={contract.id}>
                {contract.title} · {formatCents(contract.amountCents)} ·{" "}
                {RECURRING_FREQUENCY_LABELS[contract.frequency]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {chosen ? (
          <Link
            to={`/assinaturas-recorrentes/${chosen.id}`}
            className="text-caption text-primary underline decoration-primary/30 underline-offset-3 transition-colors hover:decoration-primary"
          >
            Ver histórico da assinatura
          </Link>
        ) : null}

        {mismatch ? (
          <textarea
            value={overrideNote}
            onChange={(event) => setOverrideNote(event.target.value)}
            rows={2}
            placeholder="Por que o valor da nota difere do esperado para este ciclo."
            className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-caption text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        ) : null}

        <Button
          disabled={
            !contractId ||
            link.isPending ||
            (mismatch && overrideNote.trim().length < MIN_OVERRIDE_NOTE)
          }
          onClick={submit}
          className="self-end gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {link.isPending ? "Ligando…" : "Ligar à assinatura"}
        </Button>
      </div>
    </section>
  )
}
