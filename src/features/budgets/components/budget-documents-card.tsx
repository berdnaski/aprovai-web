import { FilePdf, Paperclip } from "@phosphor-icons/react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { EmptyState } from "@/components/shared/empty-state"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useBudgetDocumentDownloadUrl,
  useBudgetDocuments,
  useUploadBudgetDocument,
} from "@/hooks/budgets/use-budgets"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function formatSize(bytes: string): string {
  const value = Number(bytes)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function BudgetDocumentsCard({
  budgetId,
  canEdit,
}: {
  budgetId: string
  canEdit: boolean
}) {
  const documentsQuery = useBudgetDocuments(budgetId)
  const upload = useUploadBudgetDocument(budgetId)
  const downloadUrl = useBudgetDocumentDownloadUrl(budgetId)

  const documents = documentsQuery.data ?? []

  function onSelect(file: File) {
    upload.mutate(
      { file },
      {
        onSuccess: () => toast.success(`${file.name} anexado.`),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  function open(documentId: string) {
    downloadUrl.mutate(documentId, {
      onSuccess: (url) => window.open(url, "_blank", "noopener,noreferrer"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 items-center border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">
          Documentos de apoio
        </h2>
      </header>

      {documentsQuery.isPending ? (
        <div className="p-4">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : documents.length === 0 && !canEdit ? (
        <EmptyState
          variant="inline"
          icon={Paperclip}
          title="Nenhum documento anexado"
          className="min-h-32 py-8"
        />
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {documents.length > 0 ? (
            <ul className="divide-y divide-border/50 rounded-lg border border-border">
              {documents.map((document) => (
                <li key={document.id}>
                  <button
                    type="button"
                    onClick={() => open(document.id)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <FilePdf
                      size={18}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption font-medium text-foreground">
                        {document.fileName}
                      </span>
                      <span className="block text-micro text-muted-foreground">
                        {formatSize(document.sizeBytes)} ·{" "}
                        {DATE.format(new Date(document.uploadedAt))}
                        {document.description ? ` · ${document.description}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {canEdit ? (
            <FileDropzone
              onSelect={onSelect}
              accept={[".pdf", ".png", ".jpg", ".jpeg", ".webp"]}
              isUploading={upload.isPending}
              label="Arraste um documento ou clique"
              hint="PDF ou imagem. Fica guardado sem poder ser substituído."
            />
          ) : null}
        </div>
      )}
    </section>
  )
}
