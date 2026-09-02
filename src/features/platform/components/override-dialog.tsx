import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Organization } from "@/api/platform"
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
import { Switch } from "@/components/ui/switch"
import {
  useFeatureCatalog,
  useGrantOverride,
} from "@/hooks/platform/use-platform"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function OverrideDialog({
  organization,
  current,
  open,
  onOpenChange,
}: {
  organization: Organization
  current: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [features, setFeatures] = useState<string[]>(current)
  const [expiresAt, setExpiresAt] = useState("")

  const catalog = useFeatureCatalog()
  const grant = useGrantOverride(organization.companyId)

  const planFeatures = organization.plan?.features ?? []
  const changed =
    features.length !== current.length ||
    features.some((item) => !current.includes(item))

  function toggle(key: string) {
    setFeatures((list) =>
      list.includes(key) ? list.filter((item) => item !== key) : [...list, key],
    )
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    grant.mutate(
      {
        features,
        ...(expiresAt
          ? { expiresAt: new Date(`${expiresAt}T23:59:59`).toISOString() }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            features.length === 0
              ? "Exceção removida. O plano volta a valer."
              : "Exceção concedida.",
          )
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Exceção de funcionalidade
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              A lista abaixo passa a valer no lugar da do plano. Salvar com a
              lista vazia remove a exceção.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-2">
              <Label className="text-label text-foreground">
                Funcionalidades liberadas
              </Label>

              <div className="flex flex-col divide-y divide-border/50 overflow-hidden rounded-lg border border-border">
                {(catalog.data ?? []).map((feature) => {
                  const inPlan = planFeatures.includes(feature.key)

                  return (
                    <label
                      key={feature.key}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="text-caption text-foreground">
                          {feature.label}
                        </span>
                        <span className="text-micro text-muted-foreground">
                          {inPlan ? "Já vem no plano" : "Fora do plano"}
                        </span>
                      </span>

                      <Switch
                        checked={features.includes(feature.key)}
                        onCheckedChange={() => toggle(feature.key)}
                        aria-label={feature.label}
                      />
                    </label>
                  )
                })}
              </div>

              <p className="text-caption leading-relaxed text-muted-foreground">
                {features.length === 0
                  ? "Nada marcado: salvar remove a exceção e o plano volta a valer."
                  : "A lista marcada substitui a do plano por completo, inclusive tirando o que o plano dá."}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expires" className="text-label text-foreground">
                Vale até
              </Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                min={today()}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="h-10 w-48 text-body md:text-body"
              />
              <p className="text-caption leading-relaxed text-muted-foreground">
                Vencida a data, o plano volta a valer sozinho. Vazio não expira.
              </p>
            </div>
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
              disabled={grant.isPending || !changed}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {grant.isPending ? "Salvando…" : "Salvar exceção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
