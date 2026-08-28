import {
  ArrowRight,
  Check,
  Package,
  Tag,
  WarningCircle,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import type { ExtractedFields } from "@/api/purchase-requests"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { formatCnpj } from "@/lib/cnpj"
import { cn } from "@/lib/utils"
import { ExtractionStatus } from "@/types/enums"

import type { MatchState, ResolvedExtraction } from "../extraction"

function Line({
  icon: LineIcon,
  label,
  value,
  state,
  note,
}: {
  icon: Icon
  label: string
  value: React.ReactNode
  state: MatchState | "plain"
  note?: React.ReactNode
}) {
  if (state === "absent") {
    return null
  }

  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <LineIcon
        size={15}
        aria-hidden
        className={cn(
          "mt-0.5 shrink-0",
          state === "unregistered"
            ? "text-warning-strong"
            : "text-muted-foreground",
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-micro text-muted-foreground/70">{label}</p>
        <p className="text-caption text-foreground">{value}</p>
        {note ? (
          <p className="mt-0.5 text-caption leading-relaxed text-warning-strong">
            {note}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function ExtractionPanel({
  status,
  failureReason,
  fields,
  resolved,
  applied,
  onApply,
  onDismiss,
}: {
  status: ExtractionStatus | undefined
  failureReason: string | null
  fields: ExtractedFields | null
  resolved: ResolvedExtraction | null
  applied: boolean
  onApply: () => void
  onDismiss: () => void
}) {
  if (!status) {
    return null
  }

  if (status === ExtractionStatus.QUEUED) {
    return (
      <section className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-5 py-4">
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
        />
        <div className="min-w-0">
          <p className="text-caption font-medium text-foreground">
            Lendo o documento
          </p>
          <p className="text-caption text-muted-foreground">
            Leva alguns segundos. Você já pode ir preenchendo o resto.
          </p>
        </div>
      </section>
    )
  }

  if (status === ExtractionStatus.FAILED) {
    return (
      <section
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-5 py-4"
      >
        <WarningCircle
          size={16}
          aria-hidden
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-foreground">
            Não deu para ler o documento
          </p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            {failureReason ?? "Preencha os campos abaixo na mão."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground"
        >
          Dispensar
        </Button>
      </section>
    )
  }

  if (!fields || !resolved) {
    return null
  }

  if (resolved.found === 0) {
    return (
      <section className="flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-4">
        <p className="min-w-0 flex-1 text-caption leading-relaxed text-muted-foreground">
          O documento foi lido, mas nada reconhecível foi encontrado. Preencha
          os campos abaixo na mão.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground"
        >
          Dispensar
        </Button>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-primary/20 bg-card shadow-xs">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-primary/15 bg-primary/[0.04] px-5 py-3">
        <h2 className="text-caption font-medium text-foreground">
          {applied
            ? "Aplicado ao pedido"
            : `${resolved.found} ${resolved.found === 1 ? "campo encontrado" : "campos encontrados"} no documento`}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          {applied ? (
            <span className="flex items-center gap-1.5 text-caption text-brand-accent-strong">
              <Check size={13} weight="bold" aria-hidden />
              Confira antes de enviar
            </span>
          ) : (
            <Button
              size="sm"
              onClick={onApply}
              className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Preencher com estes dados
              <ArrowRight size={12} weight="bold" aria-hidden />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-muted-foreground"
          >
            Dispensar
          </Button>
        </div>
      </header>

      <ul className="divide-y divide-border/50">
        <Line
          icon={Package}
          label="Fornecedor"
          state={resolved.supplier.state}
          value={
            resolved.supplier.match
              ? (resolved.supplier.match.tradeName ??
                resolved.supplier.match.legalName)
              : (fields.supplierName ??
                (fields.supplierCnpj ? formatCnpj(fields.supplierCnpj) : "—"))
          }
          note={
            resolved.supplier.state === "unregistered" ? (
              <>
                Não está cadastrado na empresa.{" "}
                <Link
                  to="/fornecedores"
                  className="font-medium underline underline-offset-2"
                >
                  Cadastrar
                  {fields.supplierCnpj
                    ? ` (${formatCnpj(fields.supplierCnpj)})`
                    : ""}
                </Link>
              </>
            ) : undefined
          }
        />

        <Line
          icon={Tag}
          label="Categoria"
          state={resolved.category.state}
          value={resolved.category.match?.name ?? (fields.categoryName ?? "—")}
          note={
            resolved.category.state === "unregistered"
              ? "Nenhuma categoria da empresa bate com esse nome."
              : undefined
          }
        />

        {resolved.totalAmountCents ? (
          <li className="flex items-start gap-3 px-4 py-2.5">
            <span
              aria-hidden
              className="mt-0.5 flex size-[15px] shrink-0 items-center justify-center text-caption text-muted-foreground"
            >
              R$
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-micro text-muted-foreground/70">Valor total</p>
              <p className="text-caption text-foreground">
                <MoneyDisplay cents={resolved.totalAmountCents} emphasis />
              </p>
              <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                Vira um item único. Detalhe em várias linhas se precisar.
              </p>
            </div>
          </li>
        ) : null}

        {resolved.paymentTerms ? (
          <Line
            icon={Check}
            label="Condições de pagamento"
            state="plain"
            value={resolved.paymentTerms}
          />
        ) : null}
      </ul>
    </section>
  )
}
