import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Supplier } from "@/api/suppliers"
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
import { Switch } from "@/components/ui/switch"
import { useRequestBankAccount } from "@/hooks/suppliers/use-suppliers"
import {
  BANK_ACCOUNT_TYPE_LABELS,
  BankAccountType,
  PIX_KEY_TYPE_LABELS,
  PixKeyType,
} from "@/types/enums"

const ACCOUNT_TYPES: BankAccountType[] = [
  BankAccountType.CHECKING,
  BankAccountType.SAVINGS,
  BankAccountType.PAYMENT,
]

const PIX_TYPES: PixKeyType[] = [
  PixKeyType.CNPJ,
  PixKeyType.CPF,
  PixKeyType.EMAIL,
  PixKeyType.PHONE,
  PixKeyType.RANDOM,
]

const MIN_JUSTIFICATION = 10

export function BankAccountDialog({
  supplier,
  open,
  onOpenChange,
}: {
  supplier: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [bankCode, setBankCode] = useState("")
  const [branch, setBranch] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountDigit, setAccountDigit] = useState("")
  const [accountType, setAccountType] = useState<BankAccountType>(
    BankAccountType.CHECKING,
  )
  const [holderName, setHolderName] = useState(supplier.legalName)
  const [holderDocument, setHolderDocument] = useState(supplier.cnpj)
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | null>(null)
  const [pixKey, setPixKey] = useState("")
  const [thirdParty, setThirdParty] = useState(false)
  const [justification, setJustification] = useState("")

  const request = useRequestBankAccount(supplier.id)

  function close(next: boolean) {
    if (!next) {
      setBankCode("")
      setBranch("")
      setAccountNumber("")
      setAccountDigit("")
      setAccountType(BankAccountType.CHECKING)
      setHolderName(supplier.legalName)
      setHolderDocument(supplier.cnpj)
      setPixKeyType(null)
      setPixKey("")
      setThirdParty(false)
      setJustification("")
    }

    onOpenChange(next)
  }

  const valid =
    /^\d{3}$/.test(bankCode) &&
    branch.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    holderName.trim().length > 0 &&
    holderDocument.replace(/\D/g, "").length >= 11 &&
    (!thirdParty || justification.trim().length >= MIN_JUSTIFICATION)

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    request.mutate(
      {
        bankCode,
        branch: branch.trim(),
        accountNumber: accountNumber.trim(),
        accountDigit: accountDigit.trim() || null,
        accountType,
        holderName: holderName.trim(),
        holderDocument: holderDocument.replace(/\D/g, ""),
        pixKeyType: pixKeyType ?? undefined,
        pixKey: pixKeyType ? pixKey.trim() || null : null,
        thirdParty,
        justification: thirdParty ? justification.trim() : null,
      },
      {
        onSuccess: () => {
          toast.success("Conta bancária enviada para aprovação.")
          close(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Cadastrar conta bancária
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Entra aguardando aprovação de outra pessoa do financeiro antes
              de poder ser usada em pagamentos.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Banco</Label>
                <Input
                  value={bankCode}
                  onChange={(event) =>
                    setBankCode(event.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="341"
                  inputMode="numeric"
                  autoComplete="off"
                  className="h-9 tabular-nums md:text-caption"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Agência</Label>
                <Input
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  placeholder="1234"
                  autoComplete="off"
                  className="h-9 tabular-nums md:text-caption"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Tipo</Label>
                <Select
                  value={accountType}
                  onValueChange={(next) => setAccountType(next as BankAccountType)}
                >
                  <SelectTrigger className="h-9 w-full bg-card px-2.5">
                    <SelectValue>
                      {(value: BankAccountType) => BANK_ACCOUNT_TYPE_LABELS[value]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {BANK_ACCOUNT_TYPE_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Conta</Label>
                <Input
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="00012345"
                  autoComplete="off"
                  className="h-9 tabular-nums md:text-caption"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Dígito</Label>
                <Input
                  value={accountDigit}
                  onChange={(event) => setAccountDigit(event.target.value)}
                  placeholder="6"
                  autoComplete="off"
                  className="h-9 w-16 tabular-nums md:text-caption"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-caption">Titular</Label>
              <Input
                value={holderName}
                onChange={(event) => setHolderName(event.target.value)}
                autoComplete="off"
                className="h-9 md:text-caption"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-caption">CPF ou CNPJ do titular</Label>
              <Input
                value={holderDocument}
                onChange={(event) => setHolderDocument(event.target.value)}
                autoComplete="off"
                className="h-9 tabular-nums md:text-caption"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Chave PIX</Label>
                <Select
                  value={pixKeyType}
                  onValueChange={(next) =>
                    setPixKeyType((next ?? null) as PixKeyType | null)
                  }
                >
                  <SelectTrigger className="h-9 w-full bg-card px-3">
                    <SelectValue>
                      {(value: PixKeyType | null) =>
                        value ? PIX_KEY_TYPE_LABELS[value] : "Sem chave PIX"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sem chave PIX</SelectItem>
                    {PIX_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {PIX_KEY_TYPE_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {pixKeyType ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-caption">Valor da chave</Label>
                  <Input
                    value={pixKey}
                    onChange={(event) => setPixKey(event.target.value)}
                    autoComplete="off"
                    className="h-9 md:text-caption"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption font-medium text-foreground">
                    Titular diferente do fornecedor
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Fatoração, representante ou outra situação de terceiro.
                  </p>
                </div>
                <Switch checked={thirdParty} onCheckedChange={setThirdParty} />
              </div>

              {thirdParty ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-caption">Justificativa</Label>
                  <textarea
                    value={justification}
                    onChange={(event) => setJustification(event.target.value)}
                    rows={2}
                    placeholder="Por que o titular é diferente do fornecedor."
                    className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-caption text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || request.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {request.isPending ? "Enviando…" : "Enviar para aprovação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
