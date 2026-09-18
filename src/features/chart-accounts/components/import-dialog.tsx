import { CheckCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { ChartImportResult } from "@/api/chart-accounts"
import { FileDropzone } from "@/components/shared/file-dropzone"
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
import { useImportChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [result, setResult] = useState<ChartImportResult | null>(null)
  const importChart = useImportChartAccounts()

  function close(next: boolean) {
    if (!next) {
      setResult(null)
    }
    onOpenChange(next)
  }

  function onSelect(file: File) {
    importChart.mutate(file, {
      onSuccess: (data) => {
        setResult(data)
        toast.success(
          `${data.created} ${data.created === 1 ? "conta criada" : "contas criadas"}, ${data.updated} ${data.updated === 1 ? "atualizada" : "atualizadas"}.`,
        )
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">
            Importar plano de contas
          </DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Planilha CSV com as colunas codigo e nome. Natureza, analitica e
            codigo_erp são opcionais. Contas com o mesmo código são
            atualizadas, não duplicadas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-5">
          {result ? (
            <div className="flex items-center gap-3 rounded-lg border border-brand-accent/25 bg-brand-accent/6 px-4 py-3">
              <CheckCircle
                size={18}
                weight="fill"
                className="shrink-0 text-brand-accent-strong"
                aria-hidden
              />
              <p className="text-caption leading-relaxed text-foreground">
                {result.created} {result.created === 1 ? "conta criada" : "contas criadas"},{" "}
                {result.updated} {result.updated === 1 ? "atualizada" : "atualizadas"}.
              </p>
            </div>
          ) : (
            <FileDropzone
              onSelect={onSelect}
              accept={[".csv"]}
              isUploading={importChart.isPending}
              label="Arraste a planilha ou clique"
              hint="Apenas arquivos .csv"
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" type="button" className="font-medium" />}
          >
            {result ? "Fechar" : "Cancelar"}
          </DialogClose>
          {result ? (
            <Button
              type="button"
              onClick={() => setResult(null)}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Importar outra planilha
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
