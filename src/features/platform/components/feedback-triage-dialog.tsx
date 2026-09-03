import { ArrowSquareOut, Check } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import type { Feedback } from "@/api/feedback";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFeedbackScreenshot,
  useTriageFeedback,
} from "@/hooks/feedback/use-feedback";
import { FEEDBACK_STATUS, pillTone } from "@/lib/status-labels";
import { cn } from "@/lib/utils";
import {
  FEEDBACK_KIND_LABELS,
  FeedbackStatus,
  type FeedbackStatus as FeedbackStatusType,
} from "@/types/enums";

const STATUSES: FeedbackStatusType[] = [
  FeedbackStatus.NEW,
  FeedbackStatus.TRIAGED,
  FeedbackStatus.RESOLVED,
  FeedbackStatus.DISCARDED,
];

function fullDate(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Screenshot({ id }: { id: string }) {
  const screenshot = useFeedbackScreenshot(id, true)

  if (screenshot.isPending) {
    return (
      <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/40" />
    )
  }

  if (screenshot.isError || !screenshot.data) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-3 text-caption text-muted-foreground">
        Não foi possível carregar o print anexado.
      </p>
    )
  }

  return (
    <a
      href={screenshot.data}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <img
        src={screenshot.data}
        alt="Print enviado junto com o feedback"
        className="max-h-64 w-full bg-muted object-contain"
      />

      <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-foreground/80 px-2 py-1 text-micro text-background opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowSquareOut size={12} aria-hidden />
        Abrir
      </span>
    </a>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-overline text-muted-foreground/70">{label}</dt>
      <dd className="truncate text-caption text-foreground">{value}</dd>
    </div>
  );
}

function TriageForm({
  feedback,
  onDone,
}: {
  feedback: Feedback;
  onDone: () => void;
}) {
  const triage = useTriageFeedback(feedback.id);

  const [status, setStatus] = useState<FeedbackStatusType>(feedback.status);
  const [note, setNote] = useState(feedback.internalNote ?? "");
  const [reply, setReply] = useState(feedback.reply ?? "");

  const dirty =
    status !== feedback.status ||
    note.trim() !== (feedback.internalNote ?? "") ||
    reply.trim() !== (feedback.reply ?? "");

  function onSave() {
    triage.mutate(
      {
        status,
        internalNote: note.trim() || undefined,
        reply: reply.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Feedback atualizado.");
          onDone();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-heading">
          {FEEDBACK_KIND_LABELS[feedback.kind]}
        </DialogTitle>
        <DialogDescription className="text-caption leading-relaxed">
          {feedback.author?.name ?? "Autor removido"} ·{" "}
          {feedback.company?.name ?? "—"} · {fullDate(feedback.createdAt)}
        </DialogDescription>
      </DialogHeader>

      <p className="rounded-lg border border-border bg-muted/25 px-4 py-3 text-body leading-relaxed text-foreground">
        {feedback.message}
      </p>

      {feedback.hasScreenshot ? <Screenshot id={feedback.id} /> : null}

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Fact label="Tela" value={feedback.route ?? "—"} />
        <Fact label="E-mail" value={feedback.author?.email ?? "—"} />
        <Fact label="Navegador" value={feedback.userAgent ?? "—"} />
      </dl>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label font-medium text-foreground">
          Situação
        </legend>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((option) => {
            const meta = FEEDBACK_STATUS[option];
            const active = status === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-caption transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "border-primary/40 bg-primary/6 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30",
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="feedback-reply"
          className="flex items-center gap-2 text-label font-medium text-foreground"
        >
          Resposta ao autor
          <span className="rounded bg-brand-accent/10 px-1.5 text-micro font-normal text-brand-accent-strong">
            o autor vê
          </span>
        </label>

        <textarea
          id="feedback-reply"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Aparece para quem enviou, dentro do produto."
          className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="feedback-note"
          className="flex items-center gap-2 text-label font-medium text-foreground"
        >
          Nota interna
          <span className="rounded bg-muted px-1.5 text-micro font-normal text-muted-foreground">
            só a plataforma
          </span>
        </label>

        <textarea
          id="feedback-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Só a plataforma vê isso."
          className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </div>

      {feedback.triagedBy ? (
        <p className="text-micro text-muted-foreground/70">
          Última triagem por {feedback.triagedBy.name}
          {feedback.triagedAt ? ` em ${fullDate(feedback.triagedAt)}` : ""}.
        </p>
      ) : null}

      <DialogFooter>
        <StatusPill
          tone={pillTone(FEEDBACK_STATUS[feedback.status].tone)}
          className="mr-auto self-center"
        >
          {FEEDBACK_STATUS[feedback.status].label}
        </StatusPill>

        <DialogClose
          render={
            <Button type="button" variant="ghost">
              Fechar
            </Button>
          }
        />

        <Button
          type="button"
          onClick={onSave}
          disabled={!dirty || triage.isPending}
          className="gap-1.5"
        >
          <Check size={14} weight="bold" aria-hidden />
          {triage.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function FeedbackTriageDialog({
  feedback,
  onOpenChange,
}: {
  feedback: Feedback | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={feedback !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {feedback ? (
          <TriageForm
            key={feedback.id}
            feedback={feedback}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
