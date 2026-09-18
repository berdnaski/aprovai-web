import { PencilSimple } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import type { Supplier } from "@/api/suppliers"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateSupplier } from "@/hooks/suppliers/use-suppliers"
import { formatCents } from "@/lib/money"
import { TAX_REGIME_LABELS, TaxRegime } from "@/types/enums"

const REGIMES: TaxRegime[] = [
  TaxRegime.MEI,
  TaxRegime.SIMPLES_NACIONAL,
  TaxRegime.LUCRO_PRESUMIDO,
  TaxRegime.LUCRO_REAL,
  TaxRegime.LUCRO_ARBITRADO,
  TaxRegime.IMMUNE_OR_EXEMPT,
]

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
      <dt className="text-caption text-muted-foreground sm:w-44 sm:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  )
}

export function FiscalCard({
  supplier,
  canEdit,
}: {
  supplier: Supplier
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)

  const hasFiscalData =
    supplier.legalNature ||
    supplier.mainActivityDescription ||
    supplier.partners.length > 0 ||
    supplier.taxRegime !== TaxRegime.UNKNOWN

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 items-center gap-3 border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">Dados fiscais</h2>
        {canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="ml-auto h-7 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <PencilSimple size={12} aria-hidden />
            Ajustar regime
          </Button>
        ) : null}
      </header>

      {!hasFiscalData ? (
        <p className="px-4 py-4 text-caption text-muted-foreground">
          A consulta à Receita não trouxe dados fiscais. Use &quot;Consultar
          Receita&quot; para tentar de novo.
        </p>
      ) : (
        <dl className="divide-y divide-border/50">
          <Row label="Regime tributário">
            <span className="flex items-center gap-2">
              <span className="text-caption font-medium text-foreground">
                {TAX_REGIME_LABELS[supplier.taxRegime]}
              </span>
              {supplier.taxRegimeSource === "MANUAL" ? (
                <span className="rounded bg-muted px-1.5 text-micro text-muted-foreground">
                  definido manualmente
                </span>
              ) : null}
            </span>
          </Row>
          <Row label="Natureza jurídica">
            <span className="text-caption text-foreground">
              {supplier.legalNature ?? "—"}
            </span>
          </Row>
          <Row label="Atividade principal">
            <span className="text-caption text-foreground">
              {supplier.mainActivityDescription
                ? `${supplier.mainActivityCode} · ${supplier.mainActivityDescription}`
                : "—"}
            </span>
          </Row>
          <Row label="Capital social">
            <span className="text-caption tabular-nums text-foreground">
              {supplier.shareCapitalCents
                ? formatCents(supplier.shareCapitalCents)
                : "—"}
            </span>
          </Row>
          <Row label="Abertura">
            <span className="text-caption tabular-nums text-foreground">
              {supplier.openedOn ? DATE.format(new Date(supplier.openedOn)) : "—"}
            </span>
          </Row>
          <Row label="Inscrições">
            <span className="text-caption text-foreground">
              {[
                supplier.stateRegistration
                  ? `IE ${supplier.stateRegistration}`
                  : null,
                supplier.municipalRegistration
                  ? `IM ${supplier.municipalRegistration}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </span>
          </Row>
          {supplier.partners.length > 0 ? (
            <Row label="Sócios">
              <ul className="flex flex-col gap-1">
                {supplier.partners.map((partner, index) => (
                  <li
                    key={index}
                    className="flex flex-wrap items-baseline gap-x-2 text-caption text-foreground"
                  >
                    <span className="font-medium">{partner.name}</span>
                    <span className="text-muted-foreground">
                      {partner.role}
                    </span>
                  </li>
                ))}
              </ul>
            </Row>
          ) : null}
        </dl>
      )}

      <RegimeDialog
        supplier={supplier}
        open={editing}
        onOpenChange={setEditing}
      />
    </section>
  )
}

function RegimeDialog({
  supplier,
  open,
  onOpenChange,
}: {
  supplier: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [taxRegime, setTaxRegime] = useState<TaxRegime>(supplier.taxRegime)
  const [municipalRegistration, setMunicipalRegistration] = useState(
    supplier.municipalRegistration ?? "",
  )

  const update = useUpdateSupplier(supplier.id)

  useEffect(() => {
    if (open) {
      setTaxRegime(supplier.taxRegime)
      setMunicipalRegistration(supplier.municipalRegistration ?? "")
    }
  }, [open, supplier])

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    update.mutate(
      {
        legalName: supplier.legalName,
        taxRegime,
        municipalRegistration: municipalRegistration.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Dados fiscais atualizados.")
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Ajustar dados fiscais
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Use quando a consulta à Receita não trouxer o regime correto.
              Uma vez ajustado aqui, a revalidação automática não sobrescreve.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-caption">Regime tributário</Label>
              <Select
                value={taxRegime}
                onValueChange={(next) => setTaxRegime(next as TaxRegime)}
              >
                <SelectTrigger className="h-9 w-full bg-card px-3">
                  <SelectValue>
                    {(value: TaxRegime) => TAX_REGIME_LABELS[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REGIMES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {TAX_REGIME_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="municipal-registration" className="text-caption">
                Inscrição municipal
                <span className="ml-1.5 font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Input
                id="municipal-registration"
                value={municipalRegistration}
                onChange={(event) =>
                  setMunicipalRegistration(event.target.value)
                }
                autoComplete="off"
                className="h-9 md:text-caption"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={update.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {update.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
