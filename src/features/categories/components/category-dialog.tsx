import { useEffect, useState } from "react"
import { toast } from "sonner"

import type { Category } from "@/api/categories"
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
import { useChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/categories/use-categories"

const MAX_DESCRIPTION = 300

export function CategoryDialog({
  category,
  open,
  onOpenChange,
  trigger,
}: {
  category?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null)

  const accountsQuery = useChartAccounts()
  const accounts = (accountsQuery.data ?? []).filter((account) => account.postable)

  const create = useCreateCategory()
  const update = useUpdateCategory(category?.id ?? "")

  const isEditing = category !== undefined
  const mutation = isEditing ? update : create

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setDescription(category?.description ?? "")
      setDefaultAccountId(category?.defaultAccountId ?? null)
    }
  }, [open, category])

  const trimmed = name.trim()
  const valid = trimmed.length > 0 && description.length <= MAX_DESCRIPTION

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    mutation.mutate(
      {
        name: trimmed,
        description: description.trim() || null,
        defaultAccountId,
      },
      {
        onSuccess: () => {
          toast.success(
            isEditing ? "Categoria atualizada." : `${trimmed} foi criada.`,
          )
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Categorias classificam o que a empresa compra. Quem abre um pedido
              escolhe uma delas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-name" className="text-caption">
                Nome
              </Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Software"
                autoComplete="off"
                autoFocus
                className="h-9 text-caption md:text-caption"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="category-description" className="text-caption">
                  Descrição
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    opcional
                  </span>
                </Label>
                {description.length > MAX_DESCRIPTION - 60 ? (
                  <span
                    className={
                      description.length > MAX_DESCRIPTION
                        ? "text-caption tabular-nums text-destructive"
                        : "text-caption tabular-nums text-muted-foreground"
                    }
                  >
                    {description.length}/{MAX_DESCRIPTION}
                  </span>
                ) : null}
              </div>
              <Input
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Licenças, assinaturas e ferramentas digitais"
                autoComplete="off"
                className="h-9 text-caption md:text-caption"
              />
              <p className="text-caption text-muted-foreground">
                Ajuda quem abre o pedido a escolher a categoria certa.
              </p>
            </div>

            {accounts.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <Label className="text-caption">
                  Conta contábil padrão
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    opcional
                  </span>
                </Label>
                <Select
                  value={defaultAccountId}
                  onValueChange={(next) =>
                    setDefaultAccountId((next ?? null) as string | null)
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full bg-card px-3"
                    aria-label="Conta contábil padrão"
                  >
                    <SelectValue>
                      {(value: string | null) => {
                        const found = accounts.find((item) => item.id === value)
                        return found
                          ? `${found.code} · ${found.name}`
                          : "Sem conta padrão"
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sem conta padrão</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} · {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">
                  Sugerida automaticamente no rateio de pedidos com esta categoria.
                </p>
              </div>
            ) : null}
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
                  : "Criar categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
