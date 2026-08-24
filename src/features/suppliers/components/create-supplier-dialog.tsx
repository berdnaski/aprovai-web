import { ArrowRight, MagnifyingGlass, Warning } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { SupplierLookup } from "@/api/suppliers"
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
import { useCreateSupplier, useLookupCnpj } from "@/hooks/suppliers/use-suppliers"
import { formatCnpj, isValidCnpj, maskCnpj, onlyDigits } from "@/lib/cnpj"
import { RegistrationStatus } from "@/types/enums"

import { RegistrationPill } from "./supplier-status"

export function CreateSupplierDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [cnpj, setCnpj] = useState("")
  const [found, setFound] = useState<SupplierLookup | null>(null)
  const [legalName, setLegalName] = useState("")
  const [tradeName, setTradeName] = useState("")
  const [email, setEmail] = useState("")

  const navigate = useNavigate()
  const lookup = useLookupCnpj()
  const create = useCreateSupplier()

  const digits = onlyDigits(cnpj)
  const cnpjReady = isValidCnpj(digits)

  function reset() {
    setCnpj("")
    setFound(null)
    setLegalName("")
    setTradeName("")
    setEmail("")
    lookup.reset()
  }

  function onSearch() {
    if (!cnpjReady) {
      return
    }

    lookup.mutate(digits, {
      onSuccess: (result) => {
        setFound(result)

        if (result.found) {
          setLegalName(result.legalName ?? "")
          setTradeName(result.tradeName ?? "")
          setEmail(result.email ?? "")
        }
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!cnpjReady || !legalName.trim()) {
      return
    }

    create.mutate(
      {
        cnpj: digits,
        legalName: legalName.trim(),
        tradeName: tradeName.trim() || null,
        email: email.trim() || null,
        street: found?.street ?? null,
        city: found?.city ?? null,
        state: found?.state ?? null,
        zipCode: found?.zipCode ?? null,
        phone: found?.phone ?? null,
      },
      {
        onSuccess: (supplier) => {
          toast.success(`${supplier.legalName} foi cadastrado.`)
          onOpenChange(false)
          reset()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  const duplicate = found?.alreadyRegistered ? found : null
  const canFill = found !== null && !duplicate

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">Novo fornecedor</DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Informe o CNPJ. Buscamos os dados na Receita Federal para você
              não precisar digitar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-cnpj" className="text-caption">
                CNPJ
              </Label>
              <div className="flex gap-2">
                <Input
                  id="supplier-cnpj"
                  value={cnpj}
                  onChange={(event) => {
                    setCnpj(maskCnpj(event.target.value))
                    setFound(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !found) {
                      event.preventDefault()
                      onSearch()
                    }
                  }}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  className="h-9 flex-1 text-caption tabular-nums md:text-caption"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!cnpjReady || lookup.isPending}
                  onClick={onSearch}
                  className="h-9 shrink-0 gap-1.5"
                >
                  <MagnifyingGlass size={13} aria-hidden />
                  {lookup.isPending ? "Buscando…" : "Buscar"}
                </Button>
              </div>
              {digits.length === 14 && !cnpjReady ? (
                <p className="text-caption text-destructive">
                  Este CNPJ não é válido. Confira os números.
                </p>
              ) : null}
            </div>

            {duplicate ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/6 px-3.5 py-3">
                <Warning
                  size={14}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-warning-strong"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-caption text-foreground">
                    {duplicate.legalName ?? "Este fornecedor"} já está
                    cadastrado.
                  </p>
                  {duplicate.supplierId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false)
                        reset()
                        void navigate(`/fornecedores/${duplicate.supplierId}`)
                      }}
                      className="mt-1 h-7 gap-1 px-0 text-caption text-primary hover:bg-transparent hover:text-primary-hover"
                    >
                      Abrir o cadastro
                      <ArrowRight size={12} aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {found && !found.found && !duplicate ? (
              <p className="rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-caption leading-relaxed text-muted-foreground">
                {found.message ??
                  "Não conseguimos consultar a Receita agora."}{" "}
                Você pode preencher os dados à mão e conferir depois.
              </p>
            ) : null}

            {canFill || (found && !found.found) ? (
              <>
                {found?.registrationStatus &&
                found.registrationStatus !== RegistrationStatus.ACTIVE ? (
                  <div className="flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/6 px-3.5 py-2.5">
                    <span className="text-caption text-foreground">
                      Situação na Receita:
                    </span>
                    <RegistrationPill status={found.registrationStatus} />
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="supplier-legal-name" className="text-caption">
                    Razão social
                  </Label>
                  <Input
                    id="supplier-legal-name"
                    value={legalName}
                    onChange={(event) => setLegalName(event.target.value)}
                    autoComplete="off"
                    className="h-9 text-caption md:text-caption"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="supplier-trade-name" className="text-caption">
                      Nome fantasia
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        opcional
                      </span>
                    </Label>
                    <Input
                      id="supplier-trade-name"
                      value={tradeName}
                      onChange={(event) => setTradeName(event.target.value)}
                      autoComplete="off"
                      className="h-9 text-caption md:text-caption"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="supplier-email" className="text-caption">
                      E-mail
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        opcional
                      </span>
                    </Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="off"
                      className="h-9 text-caption md:text-caption"
                    />
                  </div>
                </div>

                {found?.city ? (
                  <p className="text-caption text-muted-foreground">
                    {[found.street, found.city, found.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={
                !cnpjReady ||
                !legalName.trim() ||
                Boolean(duplicate) ||
                create.isPending
              }
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {create.isPending ? "Cadastrando…" : "Cadastrar fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function supplierSubtitle(cnpj: string): string {
  return formatCnpj(cnpj)
}
