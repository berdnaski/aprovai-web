import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ConfirmDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "destructive",
  reason,
  isPending = false,
  children,
}: {
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: (reason?: string) => void
  variant?: "destructive" | "default"
  reason?: {
    label: string
    placeholder?: string
    required?: boolean
    minLength?: number
  }
  isPending?: boolean
  children?: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [value, setValue] = useState("")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  function setOpen(next: boolean) {
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
  }

  const minLength = reason?.minLength ?? 0
  const missingReason =
    Boolean(reason?.required) && value.trim().length < Math.max(minLength, 1)

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (missingReason) {
      return
    }

    onConfirm(reason ? value.trim() : undefined)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setValue("")
        }
      }}
    >
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">{title}</DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          {children || reason ? (
            <div className="flex flex-col gap-4 py-5">
              {children}

              {reason ? (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="confirm-reason"
                    className="flex items-baseline gap-2 text-label text-foreground"
                  >
                    {reason.label}
                    {!reason.required ? (
                      <span className="text-caption font-normal text-muted-foreground">
                        opcional
                      </span>
                    ) : null}
                  </Label>
                  <Input
                    id="confirm-reason"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={reason.placeholder}
                    autoComplete="off"
                    className="h-10 text-body md:text-body"
                  />
                  {reason.required && minLength > 0 ? (
                    <p className="text-caption text-muted-foreground">
                      mínimo de {minLength} caracteres
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-2" />
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="font-medium"
                />
              }
            >
              {cancelLabel}
            </DialogClose>
            <Button
              type="submit"
              disabled={missingReason || isPending}
              className={cn(
                "font-medium",
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover",
              )}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
