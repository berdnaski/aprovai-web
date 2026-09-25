import {
  ArrowRight,
  Check,
  ListBullets,
  Package,
  Stack,
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
  noteTone,
}: {
  icon: Icon
  label: string
  value: React.ReactNode
  state: MatchState | "plain"
  note?: React.ReactNode
  noteTone?: "warning" | "muted"
}) {
  const resolvedNoteTone = noteTone ?? (state === "unregistered" ? "warning" : "muted")
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
          <p
            className={cn(
              "mt-0.5 text-caption leading-relaxed",
              resolvedNoteTone === "warning"
                ? "text-warning-strong"
                : "text-muted-foreground",
            )}
          >
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

  const hasPrice =
    Boolean(resolved.totalAmountCents) ||
    fields.items.some((item) => Boolean(item.unitPriceCents))
  const notInText = [
    resolved.supplier.state === "absent" ? "fornecedor" : null,
    hasPrice ? null : "valor",
    resolved.paymentTerms ? null : "condição de pagamento",
  ].filter((label): label is string => label !== null)

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

      {fields.foreignCurrencyNote ? (
        <p
          role="alert"
          className="flex items-start gap-2 border-b border-warning/25 bg-warning/[0.08] px-4 py-2.5 text-caption leading-relaxed text-foreground"
        >
          <WarningCircle
            size={15}
            className="mt-0.5 shrink-0 text-warning-strong"
            aria-hidden
          />
          <span>
            O documento traz o valor em outra moeda ({fields.foreignCurrencyNote}
            ). O AprovAI só opera em reais, então não convertemos sozinhos:
            confira a cotação e informe o valor em reais no formulário abaixo.
          </span>
        </p>
      ) : null}

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

        {resolved.costCenterSplit ? (
          <Line
            icon={Stack}
            label="Rateio entre Centros de Custo"
            state="matched"
            value={resolved.costCenterSplit
              .map(
                (split) =>
                  `${split.percent % 1 === 0 ? split.percent : split.percent.toFixed(1)}% ${split.costCenter.name}`,
              )
              .join(" · ")}
            note="Aplicado automaticamente no pedido. Confira no rateio, mais abaixo."
          />
        ) : (
          <Line
            icon={Stack}
            label="Centro de Custo"
            state={
              resolved.costCenter.state === "absent"
                ? "plain"
                : resolved.costCenter.state
            }
            value={
              resolved.costCenter.match?.name ?? (fields.costCenterName ?? "Não identificado")
            }
            note={
              resolved.costCenter.state === "unregistered"
                ? "Nenhum Centro de Custo da empresa bate com esse nome. Escolha na mão abaixo."
                : resolved.costCenter.state === "absent"
                  ? "Não deu para identificar pelo documento. Escolha na mão abaixo."
                  : undefined
            }
            noteTone="warning"
          />
        )}

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
              {fields.items.length === 0 ? (
                <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                  Vira um item único. Detalhe em várias linhas se precisar.
                </p>
              ) : null}
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

        {fields.items.length > 0 ? (
          <Line
            icon={ListBullets}
            label={fields.items.length === 1 ? "Item" : "Itens"}
            state="plain"
            value={
              <span className="flex flex-col gap-0.5">
                {fields.items.map((item, index) => (
                  <span key={`${item.description}-${index}`}>
                    {item.quantity} {item.unit} · {item.description}
                  </span>
                ))}
              </span>
            }
            note={
              fields.items.some((item) => !item.unitPriceCents) && !resolved.totalAmountCents
                ? "Sem preço no texto. Informe o valor antes de enviar."
                : undefined
            }
            noteTone="warning"
          />
        ) : null}
      </ul>

      {notInText.length > 0 && !applied ? (
        <p className="border-t border-border/50 px-4 py-2.5 text-caption text-muted-foreground">
          Não veio no texto: {notInText.join(", ")}. Você completa no
          formulário abaixo.
        </p>
      ) : null}
    </section>
  )
}
