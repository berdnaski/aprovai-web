import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function StepFrame({
  question,
  support,
  children,
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled,
  isSubmitting,
  hint,
}: {
  question: string
  support?: string
  children?: React.ReactNode
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isSubmitting?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-xl">
        <h1 className="text-display text-foreground">
          {question}
        </h1>
        {support ? (
          <p className="mt-3 text-subhead text-muted-foreground">
            {support}
          </p>
        ) : null}
      </div>

      {children}

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex items-center gap-3">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-11 font-medium"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || isSubmitting}
            className="h-11 flex-1 bg-primary font-semibold text-primary-foreground hover:bg-primary-hover sm:flex-none sm:px-7"
          >
            {isSubmitting ? "Salvando..." : nextLabel}
            {!isSubmitting ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>

        {hint ? (
          <p className="text-caption leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  )
}
