import { Bank, Check, Plus, X } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Supplier, SupplierBankAccount } from "@/api/suppliers"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { RowAction, StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth/use-session"
import {
  useApproveBankAccount,
  useArchiveBankAccount,
  useBankAccounts,
  useRejectBankAccount,
} from "@/hooks/suppliers/use-suppliers"
import { formatCpf } from "@/lib/cpf"
import { formatCnpj } from "@/lib/cnpj"
import { BANK_ACCOUNT_STATUS_LABELS, BankAccountStatus } from "@/types/enums"

import { BankAccountDialog } from "./bank-account-dialog"

function formatDocument(value: string): string {
  return value.length === 14 ? formatCnpj(value) : formatCpf(value)
}

function toneFor(status: BankAccountStatus): "success" | "warning" | "danger" | "neutral" {
  if (status === BankAccountStatus.APPROVED) return "success"
  if (status === BankAccountStatus.PENDING) return "warning"
  if (status === BankAccountStatus.REJECTED) return "danger"
  return "neutral"
}

export function BankAccountsCard({
  supplier,
  canEdit,
}: {
  supplier: Supplier
  canEdit: boolean
}) {
  const [requesting, setRequesting] = useState(false)
  const [rejecting, setRejecting] = useState<SupplierBankAccount | null>(null)
  const [archiving, setArchiving] = useState<SupplierBankAccount | null>(null)

  const { membership } = useSession()
  const accountsQuery = useBankAccounts(supplier.id)
  const approve = useApproveBankAccount(supplier.id)
  const reject = useRejectBankAccount(supplier.id)
  const archive = useArchiveBankAccount(supplier.id)

  const accounts = accountsQuery.data ?? []

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 items-center gap-3 border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">
          Contas bancárias
        </h2>
        {canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRequesting(true)}
            className="ml-auto h-7 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Plus size={13} aria-hidden />
            Cadastrar
          </Button>
        ) : null}
      </header>

      {accountsQuery.isPending ? (
        <div className="p-4">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={Bank}
          title="Nenhuma conta cadastrada"
          description="Cadastre a conta que recebe os pagamentos deste fornecedor. Ela precisa da aprovação de outra pessoa do financeiro."
        />
      ) : (
        <ul className="divide-y divide-border/50">
          {accounts.map((account) => {
            const isRequester = account.requestedById === membership?.memberId
            const canReview =
              canEdit &&
              account.status === BankAccountStatus.PENDING &&
              !isRequester

            return (
              <li
                key={account.id}
                className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-caption font-medium tabular-nums text-foreground">
                      {account.bankCode} · ag {account.branch} · cc{" "}
                      {account.accountNumber}
                      {account.accountDigit ? `-${account.accountDigit}` : ""}
                    </span>
                    <StatusPill tone={toneFor(account.status)}>
                      {BANK_ACCOUNT_STATUS_LABELS[account.status]}
                    </StatusPill>
                    {account.thirdParty ? (
                      <StatusPill tone="neutral">titular terceiro</StatusPill>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-caption text-muted-foreground">
                    {account.holderName} ·{" "}
                    {formatDocument(account.holderDocument)}
                  </p>
                  {account.status === BankAccountStatus.PENDING && isRequester ? (
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      Aguardando outra pessoa do financeiro aprovar.
                    </p>
                  ) : null}
                  {account.reviewNote ? (
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      &quot;{account.reviewNote}&quot;
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {canReview ? (
                    <>
                      <RowAction
                        icon={Check}
                        label="Aprovar"
                        onClick={() =>
                          approve.mutate(
                            { id: account.id },
                            {
                              onSuccess: () => toast.success("Conta aprovada."),
                              onError: (error) =>
                                toast.error(getApiErrorMessage(error)),
                            },
                          )
                        }
                      />
                      <RowAction
                        icon={X}
                        label="Recusar"
                        tone="danger"
                        onClick={() => setRejecting(account)}
                      />
                    </>
                  ) : null}
                  {canEdit && account.status === BankAccountStatus.APPROVED ? (
                    <RowAction
                      icon={X}
                      label="Arquivar"
                      tone="danger"
                      onClick={() => setArchiving(account)}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <BankAccountDialog
        supplier={supplier}
        open={requesting}
        onOpenChange={setRequesting}
      />

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(next) => {
          if (!next) setRejecting(null)
        }}
        variant="destructive"
        title="Recusar esta conta bancária?"
        description="Quem cadastrou vai ver o motivo da recusa."
        confirmLabel={reject.isPending ? "Recusando…" : "Recusar"}
        isPending={reject.isPending}
        reason={{
          label: "Motivo",
          placeholder: "Ex.: dados divergentes do contrato",
          required: true,
          minLength: 10,
        }}
        onConfirm={(note) => {
          if (!rejecting || !note) return

          reject.mutate(
            { id: rejecting.id, note },
            {
              onSuccess: () => {
                toast.success("Conta recusada.")
                setRejecting(null)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(next) => {
          if (!next) setArchiving(null)
        }}
        variant="destructive"
        title="Arquivar esta conta bancária?"
        description="Ela deixa de estar disponível para novos pagamentos."
        confirmLabel={archive.isPending ? "Arquivando…" : "Arquivar"}
        isPending={archive.isPending}
        onConfirm={() => {
          if (!archiving) return

          archive.mutate(archiving.id, {
            onSuccess: () => {
              toast.success("Conta arquivada.")
              setArchiving(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      />
    </section>
  )
}
