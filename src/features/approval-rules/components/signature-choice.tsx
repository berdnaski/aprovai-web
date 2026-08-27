import { ChoiceField, type ChoiceOption } from "./choice-field"

const OPTIONS: ChoiceOption<boolean>[] = [
  {
    value: false,
    label: "1 assinatura",
    detail: "Uma pessoa decide cada etapa.",
  },
  {
    value: true,
    label: "2 assinaturas",
    detail: "Cada etapa precisa de duas pessoas.",
  },
]

export function SignatureChoice({
  value,
  onChange,
  forced = false,
  forcedReason,
  disabled = false,
  className,
}: {
  value: boolean
  onChange: (value: boolean) => void
  forced?: boolean
  forcedReason?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <ChoiceField
      value={value}
      options={OPTIONS}
      onChange={onChange}
      ariaLabel="Assinaturas por etapa"
      disabled={disabled}
      locked={forced}
      lockedLabel="2 assinaturas"
      lockedReason={forcedReason}
      className={className}
    />
  )
}
