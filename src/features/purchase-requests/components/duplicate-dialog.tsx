import { Warning } from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"

import type { SimilarRequest } from "@/api/purchase-requests"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DuplicateDialog({
  duplicates,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  duplicates: SimilarRequest[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}) {
  const [confirmed, setConfirmed] = useState(false)

  function close(next: boolean) {
    if (!next) {
      setConfirmed(false)
    }

    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-heading">
            <Warning
              size={18}
              weight="fill"
              aria-hidden
              className="shrink-0 text-warning-strong"
            />
            Parece que já existe
          </DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Você abriu {duplicates.length}{" "}
            {duplicates.length === 1 ? "pedido parecido" : "pedidos parecidos"}{" "}
            para o mesmo fornecedor nos últimos dias.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-5">
          <ul className="flex flex-col divide-y divide-border/50 overflow-hidden rounded-md border border-border">
            {duplicates.map((item) => (
              <li
                key={item.number}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <Link
                  to={`/pedidos?search=${encodeURIComponent(item.number)}`}
                  className="min-w-0 flex-1 truncate text-caption font-medium tabular-nums text-primary underline-offset-2 hover:underline"
                >
                  {item.number}
                </Link>

                <MoneyDisplay cents={item.amountCents} />

                <span className="shrink-0 text-micro tabular-nums text-muted-foreground/70">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>

          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(next) => setConfirmed(Boolean(next))}
              className="mt-0.5"
            />
            <span className="text-caption leading-relaxed text-foreground">
              Confirmo que este pedido não é duplicata e deve seguir para
              aprovação.
            </span>
          </label>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" type="button" className="font-medium" />
            }
          >
            Revisar
          </DialogClose>
          <Button
            type="button"
            disabled={!confirmed || isPending}
            onClick={onConfirm}
            className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {isPending ? "Enviando…" : "Enviar assim mesmo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
