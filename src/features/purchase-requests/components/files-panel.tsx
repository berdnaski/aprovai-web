import { DownloadSimple, Paperclip, Trash } from "@phosphor-icons/react"

import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { getFileDownloadUrl, type RequestFile } from "@/api/purchase-requests"
import {
  useDeleteFile,
  useUploadFile,
} from "@/hooks/purchase-requests/use-purchase-requests"

function sizeLabel(bytes: string): string {
  const value = Number(bytes)

  if (!Number.isFinite(value)) {
    return ""
  }

  if (value < 1024) {
    return `${value} B`
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function FilesPanel({
  requestId,
  files,
  readOnly = false,
}: {
  requestId: string
  files: RequestFile[]
  readOnly?: boolean
}) {
  const upload = useUploadFile(requestId)
  const remove = useDeleteFile(requestId)

  function send(file: File) {
    upload.mutate(file, {
      onSuccess: () => toast.success(`${file.name} anexado.`),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  async function download(file: RequestFile) {
    try {
      const link = await getFileDownloadUrl(requestId, file.id)
      window.open(link.url, "_blank", "noopener")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-12 items-center gap-2 border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">Anexos</h2>
        {files.length > 0 ? (
          <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
            {files.length}
          </span>
        ) : null}
      </header>

      {files.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {files.map((file) => (
            <li
              key={file.id}
              className="group/file flex items-center gap-3 px-5 py-2.5"
            >
              <Paperclip
                size={14}
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />

              <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                {file.fileName}
              </span>

              <span className="shrink-0 text-micro tabular-nums text-muted-foreground/70">
                {sizeLabel(file.sizeBytes)}
              </span>

              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within/file:opacity-100 group-hover/file:opacity-100">
                <button
                  type="button"
                  onClick={() => void download(file)}
                  aria-label={`Baixar ${file.fileName}`}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <DownloadSimple size={14} aria-hidden />
                </button>

                {readOnly ? null : (
                  <button
                    type="button"
                    onClick={() =>
                      remove.mutate(file.id, {
                        onError: (error) =>
                          toast.error(getApiErrorMessage(error)),
                      })
                    }
                    aria-label={`Remover ${file.fileName}`}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Trash size={13} aria-hidden />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {readOnly ? (
        files.length === 0 ? (
          <p className="px-5 py-6 text-center text-caption text-muted-foreground">
            Nenhum anexo.
          </p>
        ) : null
      ) : (
        <div className="p-4">
          <FileDropzone
            onSelect={send}
            isUploading={upload.isPending}
            hint="Orçamento, proposta ou nota fiscal"
          />
        </div>
      )}
    </section>
  )
}
