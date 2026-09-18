import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { ChartAccount } from "@/api/chart-accounts"
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
import {
  useChartAccounts,
  useCreateChartAccount,
  useUpdateChartAccount,
} from "@/hooks/chart-accounts/use-chart-accounts"
import { CHART_ACCOUNT_KIND_LABELS, ChartAccountKind } from "@/types/enums"

const KINDS: ChartAccountKind[] = [
  ChartAccountKind.ASSET,
  ChartAccountKind.LIABILITY,
  ChartAccountKind.EQUITY,
  ChartAccountKind.REVENUE,
  ChartAccountKind.COST,
  ChartAccountKind.EXPENSE,
]

export function AccountDialog({
  account,
  parent,
  open,
  onOpenChange,
}: {
  account?: ChartAccount
  parent?: ChartAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [kind, setKind] = useState<ChartAccountKind | null>(null)
  const [postable, setPostable] = useState(true)
  const [externalCode, setExternalCode] = useState("")
  const [parentId, setParentId] = useState<string | null>(null)

  const accountsQuery = useChartAccounts(true)
  const accounts = accountsQuery.data ?? []

  const create = useCreateChartAccount()
  const update = useUpdateChartAccount(account?.id ?? "")

  const isEditing = account !== undefined
  const mutation = isEditing ? update : create
  const groupOptions = accounts.filter(
    (item) => !item.postable && item.id !== account?.id,
  )
  const selectedParent = groupOptions.find((item) => item.id === parentId)
  const effectiveKind = isEditing
    ? account.kind
    : (kind ?? selectedParent?.kind ?? null)

  useEffect(() => {
    if (!open) {
      return
    }

    setCode(account?.code ?? "")
    setName(account?.name ?? "")
    setKind(account?.kind ?? parent?.kind ?? null)
    setPostable(account?.postable ?? true)
    setExternalCode(account?.externalCode ?? "")
    setParentId(account?.parentId ?? parent?.id ?? null)
  }, [open, account, parent])

  const trimmedCode = code.trim()
  const trimmedName = name.trim()
  const valid =
    trimmedCode.length > 0 && trimmedName.length >= 2 && Boolean(effectiveKind)

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    const onSuccess = () => {
      toast.success(isEditing ? "Conta atualizada." : `${trimmedName} foi criada.`)
      onOpenChange(false)
    }
    const onError = (error: unknown) => toast.error(getApiErrorMessage(error))

    if (isEditing) {
      update.mutate(
        {
          name: trimmedName,
          externalCode: externalCode.trim() || null,
          postable,
        },
        { onSuccess, onError },
      )
      return
    }

    create.mutate(
      {
        parentId,
        code: trimmedCode,
        name: trimmedName,
        kind: parentId ? undefined : (kind ?? undefined),
        postable,
        externalCode: externalCode.trim() || null,
      },
      { onSuccess, onError },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              {isEditing ? "Editar conta contábil" : "Nova conta contábil"}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              {isEditing
                ? "Nome e código no ERP podem mudar a qualquer momento. Código e natureza não, para não embaralhar o que já foi classificado nesta conta."
                : "É uma gaveta do plano de contas: define onde o gasto entra quando alguém faz o rateio de um pedido."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            {!isEditing ? (
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Onde ela fica</Label>
                <Select
                  value={parentId}
                  onValueChange={(next) =>
                    setParentId((next ?? null) as string | null)
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full bg-card px-3"
                    aria-label="Conta superior"
                  >
                    <SelectValue>
                      {(value: string | null) => {
                        const found = groupOptions.find(
                          (item) => item.id === value,
                        )
                        return found
                          ? `Dentro de ${found.code} · ${found.name}`
                          : "Conta de topo, como Ativo ou Despesas"
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      Conta de topo, como Ativo ou Despesas
                    </SelectItem>
                    {groupOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        Dentro de {item.code} · {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">
                  Deixe em branco só se estiver começando um ramo novo do
                  plano. Na dúvida, escolha a pasta mais parecida — dá para
                  mudar depois com uma nova importação.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account-name" className="text-caption">
                Nome
              </Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Softwares e assinaturas"
                autoComplete="off"
                autoFocus
                className="h-9 md:text-caption"
              />
              <p className="text-caption text-muted-foreground">
                Como ela aparece para quem faz o rateio de um pedido.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="account-code" className="text-caption">
                  Código
                </Label>
                <Input
                  id="account-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="4.1.09"
                  disabled={isEditing}
                  autoComplete="off"
                  className="h-9 tabular-nums md:text-caption"
                />
                <p className="text-caption text-muted-foreground">
                  {isEditing
                    ? "Fixo desde a criação."
                    : "Números separados por ponto, seguindo a posição na árvore."}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">Natureza</Label>
                {isEditing || parentId ? (
                  <Input
                    value={
                      effectiveKind ? CHART_ACCOUNT_KIND_LABELS[effectiveKind] : ""
                    }
                    disabled
                    className="h-9 md:text-caption"
                  />
                ) : (
                  <Select
                    value={kind}
                    onValueChange={(next) =>
                      setKind((next ?? null) as ChartAccountKind | null)
                    }
                  >
                    <SelectTrigger
                      className="h-9 w-full bg-card px-3"
                      aria-label="Natureza"
                    >
                      <SelectValue>
                        {(value: ChartAccountKind | null) =>
                          value ? CHART_ACCOUNT_KIND_LABELS[value] : "Escolher"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {KINDS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {CHART_ACCOUNT_KIND_LABELS[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-caption text-muted-foreground">
                  {isEditing || parentId
                    ? "Herdada da conta acima, não muda depois."
                    : "Categoria contábil fixa. Na dúvida, pergunte ao seu contador."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account-external" className="text-caption">
                Código no ERP
                <span className="ml-1.5 font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Input
                id="account-external"
                value={externalCode}
                onChange={(event) => setExternalCode(event.target.value)}
                placeholder="31101"
                autoComplete="off"
                className="h-9 tabular-nums md:text-caption"
              />
              <p className="text-caption text-muted-foreground">
                Só preencha se o sistema contábil da empresa usar outro
                código para esta mesma conta.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-caption font-medium text-foreground">
                  Recebe lançamento
                </p>
                <p className="text-caption text-muted-foreground">
                  Desligado, esta conta vira uma pasta: só organiza outras
                  contas abaixo dela e não aparece na hora do rateio.
                </p>
              </div>
              <Switch checked={postable} onCheckedChange={setPostable} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || mutation.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {mutation.isPending
                ? "Salvando…"
                : isEditing
                  ? "Salvar"
                  : "Criar conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
