import { DownloadSimple, ShieldCheck } from "@phosphor-icons/react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { useExportMyData } from "@/hooks/users/use-users"

export function PrivacySection() {
  const exportData = useExportMyData()

  function download() {
    exportData.mutate(undefined, {
      onSuccess: () => toast.success("Arquivo gerado. Confira os downloads."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <section
      aria-label="Meus dados pessoais"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={16}
          aria-hidden
          className="mt-0.5 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0">
          <p className="text-label text-foreground">Baixar meus dados</p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            Um arquivo com tudo que guardamos sobre você: cadastro, pedidos,
            decisões, notificações e registros de auditoria. É o seu direito de
            acesso e de portabilidade. Detalhes na{" "}
            <Link
              to="/privacidade"
              className="text-foreground underline underline-offset-2 hover:text-primary"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={download}
        disabled={exportData.isPending}
        className="h-9 shrink-0 gap-1.5 font-medium"
      >
        <DownloadSimple size={14} />
        {exportData.isPending ? "Gerando…" : "Baixar meus dados"}
      </Button>
    </section>
  )
}
