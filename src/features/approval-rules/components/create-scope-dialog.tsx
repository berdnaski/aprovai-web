import { ArrowRight, Info } from "@phosphor-icons/react"
import { useState } from "react"

import type { ApprovalScope } from "@/api/approval-rules"
import type { Category } from "@/api/categories"
import type { CostCenter } from "@/api/cost-centers"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { describeScope, scopeKey, type ScopeNames } from "../matrix"

export function CreateScopeDialog({
  open,
  onOpenChange,
  costCenters,
  categories,
  names,
  existingKeys,
  onCreate,
  onOpenExisting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  costCenters: CostCenter[]
  categories: Category[]
  names: ScopeNames
  existingKeys: Set<string>
  onCreate: (scope: ApprovalScope) => void
  onOpenExisting: (scope: ApprovalScope) => void
}) {
  const [costCenterId, setCostCenterId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  function close(next: boolean) {
    if (!next) {
      setCostCenterId(null)
      setCategoryId(null)
    }

    onOpenChange(next)
  }

  const scope: ApprovalScope = { costCenterId, categoryId }

  const chosen = scope.costCenterId !== null || scope.categoryId !== null
  const duplicate = chosen && existingKeys.has(scopeKey(scope))
  const described = describeScope(scope, names)

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (!chosen || duplicate) {
              return
            }

            onCreate(scope)
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-heading">Nova exceção</DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Uma matriz que vale só para parte dos pedidos. O resto continua
              seguindo o padrão da empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">
                Centro de Custo
              </Label>
              <Select
                value={costCenterId}
                onValueChange={(next) =>
                  setCostCenterId((next ?? null) as string | null)
                }
              >
                <SelectTrigger
                  className="h-9 w-full bg-card px-3"
                  aria-label="Centro de Custo da exceção"
                >
                  <SelectValue>
                    {(value: string | null) =>
                      value === null
                        ? "Qualquer Centro de Custo"
                        : (names.costCenters.get(value) ?? "Centro de Custo")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Qualquer Centro de Custo</SelectItem>
                  {costCenters.map((costCenter) => (
                    <SelectItem key={costCenter.id} value={costCenter.id}>
                      {costCenter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Categoria</Label>
              <Select
                value={categoryId}
                onValueChange={(next) =>
                  setCategoryId((next ?? null) as string | null)
                }
              >
                <SelectTrigger
                  className="h-9 w-full bg-card px-3"
                  aria-label="Categoria da exceção"
                >
                  <SelectValue>
                    {(value: string | null) =>
                      value === null
                        ? "Qualquer categoria"
                        : (names.categories.get(value) ?? "Categoria")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Qualquer categoria</SelectItem>
                  {categories
                    .filter((category) => category.active)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {duplicate ? (
              <div className="flex flex-col items-start gap-2 rounded-lg border border-warning/25 bg-warning/[0.07] px-3.5 py-3">
                <p className="text-caption leading-relaxed text-warning-strong">
                  Já existe uma exceção para essa combinação.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenExisting(scope)}
                  className="-ml-2 gap-1 text-warning-strong hover:bg-warning/10"
                >
                  Abrir a que já existe
                  <ArrowRight size={12} weight="bold" aria-hidden />
                </Button>
              </div>
            ) : (
              <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-caption leading-relaxed text-muted-foreground">
                <Info size={15} className="mt-px shrink-0" aria-hidden />
                {chosen
                  ? `${described.detail} Ela nasce como cópia do padrão da empresa — ajuste as faixas e salve.`
                  : "Escolha ao menos um Centro de Custo ou uma categoria: sem isso, seria o próprio padrão da empresa."}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" className="font-medium" />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!chosen || duplicate}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Criar exceção
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
