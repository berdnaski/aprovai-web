import {
  ArrowClockwise,
  ArrowLeft,
  Prohibit,
  Warning,
} from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Supplier } from "@/api/suppliers"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import {
  useRevalidateSupplier,
  useSetSupplierBlocked,
  useSupplier,
  useUpdateSupplier,
} from "@/hooks/suppliers/use-suppliers"
import { formatCnpj } from "@/lib/cnpj"
import { SupplierUsage, ValidationStatus } from "@/types/enums"

import { RegistrationPill, UsagePill, ValidationPill } from "./components/supplier-status"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { canManage } = usePermissions()
  const canEdit = canManage("suppliers")

  const supplierQuery = useSupplier(id)

  if (supplierQuery.isPending) {
    return <SupplierSkeleton />
  }

  if (supplierQuery.isError || !supplierQuery.data) {
    return (
      <LoadError
        title="Fornecedor não encontrado"
        message={
          supplierQuery.error
            ? getApiErrorMessage(supplierQuery.error)
            : "Ele pode ter sido removido ou você não tem acesso a ele."
        }
        onRetry={() => void navigate("/fornecedores")}
      />
    )
  }

  const supplier = supplierQuery.data

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Você está em">
        <Link
          to="/fornecedores"
          className="group inline-flex items-center gap-1.5 text-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Fornecedores
        </Link>
      </nav>

      <SupplierHeader supplier={supplier} canEdit={canEdit} />

      {supplier.usage !== SupplierUsage.ALLOWED && supplier.usageReason ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/6 px-4 py-3">
          <Warning
            size={14}
            weight="fill"
            className="mt-0.5 shrink-0 text-warning-strong"
            aria-hidden
          />
          <p className="min-w-0 text-caption leading-relaxed text-foreground">
            {supplier.usageReason}
          </p>
        </div>
      ) : null}

      <RegistrationCard supplier={supplier} canEdit={canEdit} />

      <ContactCard supplier={supplier} canEdit={canEdit} />

      {canEdit ? <BlockCard supplier={supplier} /> : null}
    </div>
  )
}

function SupplierHeader({
  supplier,
  canEdit,
}: {
  supplier: Supplier
  canEdit: boolean
}) {
  const revalidate = useRevalidateSupplier()

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card px-5 py-4 shadow-xs lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h1 className="text-heading text-foreground">
            {supplier.tradeName ?? supplier.legalName}
          </h1>
          <UsagePill supplier={supplier} />
        </div>
        <p className="mt-0.5 truncate text-caption tabular-nums text-muted-foreground">
          {formatCnpj(supplier.cnpj)}
          {supplier.tradeName ? (
            <>
              <span aria-hidden className="px-2 text-border">
                ·
              </span>
              {supplier.legalName}
            </>
          ) : null}
        </p>
      </div>

      {canEdit ? (
        <Button
          variant="outline"
          size="sm"
          disabled={revalidate.isPending}
          onClick={() =>
            revalidate.mutate(supplier.id, {
              onSuccess: (updated) =>
                toast.success(
                  updated.validationStatus === ValidationStatus.VALIDATED
                    ? "Dados conferidos na Receita."
                    : "A Receita não respondeu. Tente de novo mais tarde.",
                ),
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }
          className="h-8 shrink-0 gap-1.5"
        >
          <ArrowClockwise
            size={13}
            aria-hidden
            className={revalidate.isPending ? "animate-spin" : undefined}
          />
          {revalidate.isPending ? "Consultando…" : "Consultar Receita"}
        </Button>
      ) : null}
    </div>
  )
}

function RegistrationCard({
  supplier,
  canEdit,
}: {
  supplier: Supplier
  canEdit: boolean
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 items-center border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">Receita Federal</h2>
      </header>

      <dl className="divide-y divide-border/50">
        <Row label="Situação cadastral">
          <RegistrationPill status={supplier.registrationStatus} />
        </Row>
        <Row label="Consulta">
          <span className="flex flex-wrap items-center gap-2">
            <ValidationPill status={supplier.validationStatus} />
            {supplier.validatedAt ? (
              <span className="text-caption tabular-nums text-muted-foreground">
                em {DATE.format(new Date(supplier.validatedAt))}
              </span>
            ) : canEdit ? (
              <span className="text-caption text-muted-foreground">
                use "Consultar Receita" acima
              </span>
            ) : null}
          </span>
        </Row>
        <Row label="Endereço">
          <span className="text-caption text-foreground">
            {[supplier.street, supplier.city, supplier.state, supplier.zipCode]
              .filter(Boolean)
              .join(", ") || "—"}
          </span>
        </Row>
      </dl>
    </section>
  )
}

function ContactCard({
  supplier,
  canEdit,
}: {
  supplier: Supplier
  canEdit: boolean
}) {
  const [tradeName, setTradeName] = useState(supplier.tradeName ?? "")
  const [email, setEmail] = useState(supplier.email ?? "")
  const [phone, setPhone] = useState(supplier.phone ?? "")

  const update = useUpdateSupplier(supplier.id)

  useEffect(() => {
    setTradeName(supplier.tradeName ?? "")
    setEmail(supplier.email ?? "")
    setPhone(supplier.phone ?? "")
  }, [supplier])

  const changed =
    tradeName !== (supplier.tradeName ?? "") ||
    email !== (supplier.email ?? "") ||
    phone !== (supplier.phone ?? "")

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!changed) {
      return
    }

    update.mutate(
      {
        legalName: supplier.legalName,
        tradeName: tradeName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      },
      {
        onSuccess: () => toast.success("Contato atualizado."),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">Contato</h2>
        {canEdit && changed ? (
          <Button
            type="submit"
            form="supplier-contact"
            size="sm"
            disabled={update.isPending}
            className="ml-auto h-7 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {update.isPending ? "Salvando…" : "Salvar"}
          </Button>
        ) : null}
      </header>

      <form
        id="supplier-contact"
        onSubmit={onSubmit}
        className="grid gap-4 px-4 py-4 sm:grid-cols-3"
      >
        <Field
          id="supplier-trade-name"
          label="Nome fantasia"
          value={tradeName}
          onChange={setTradeName}
          disabled={!canEdit}
        />
        <Field
          id="supplier-email"
          label="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
          disabled={!canEdit}
        />
        <Field
          id="supplier-phone"
          label="Telefone"
          value={phone}
          onChange={setPhone}
          disabled={!canEdit}
        />
      </form>
    </section>
  )
}

function BlockCard({ supplier }: { supplier: Supplier }) {
  const [confirming, setConfirming] = useState(false)
  const setBlocked = useSetSupplierBlocked()

  const name = supplier.tradeName ?? supplier.legalName

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">
          {supplier.blocked ? "Fornecedor bloqueado" : "Bloquear fornecedor"}
        </h2>

        <Button
          variant={supplier.blocked ? "outline" : "destructive"}
          size="sm"
          onClick={() => setConfirming(true)}
          className="ml-auto h-7 gap-1.5"
        >
          {supplier.blocked ? null : <Prohibit size={12} aria-hidden />}
          {supplier.blocked ? "Desbloquear" : "Bloquear"}
        </Button>
      </header>

      <p className="px-4 py-3 text-caption leading-relaxed text-muted-foreground">
        {supplier.blocked
          ? `Ninguém consegue abrir pedido novo para ${name}. Os pedidos já em andamento continuam.`
          : `Bloquear impede que novos pedidos sejam abertos para ${name}. Use quando houver pendência contratual ou fiscal.`}
      </p>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        variant={supplier.blocked ? "default" : "destructive"}
        title={
          supplier.blocked ? `Desbloquear ${name}?` : `Bloquear ${name}?`
        }
        description={
          supplier.blocked
            ? "A equipe volta a poder abrir pedidos para este fornecedor."
            : "Novos pedidos para este fornecedor passam a ser recusados. Os pedidos já em andamento não são afetados."
        }
        confirmLabel={
          setBlocked.isPending
            ? "Salvando…"
            : supplier.blocked
              ? "Desbloquear"
              : "Bloquear"
        }
        isPending={setBlocked.isPending}
        onConfirm={() =>
          setBlocked.mutate(
            { id: supplier.id, blocked: !supplier.blocked },
            {
              onSuccess: () => {
                toast.success(
                  supplier.blocked
                    ? `${name} foi desbloqueado.`
                    : `${name} foi bloqueado.`,
                )
                setConfirming(false)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            },
          )
        }
      />
    </section>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
      <dt className="text-caption text-muted-foreground sm:w-44 sm:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-caption">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="off"
        placeholder="—"
        className="h-9 text-caption md:text-caption"
      />
    </div>
  )
}

function SupplierSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando fornecedor</span>

      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}
