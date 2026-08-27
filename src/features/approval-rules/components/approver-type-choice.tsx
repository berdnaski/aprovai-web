import { ApproverType } from "@/types/enums"

import { APPROVER_TYPE_ICON } from "../icons"
import { ChoiceField, type ChoiceOption } from "./choice-field"

const OPTIONS: ChoiceOption<ApproverType>[] = [
  {
    value: ApproverType.DIRECT_MANAGER,
    label: "Líder direto",
    detail: "Vai para o líder de quem abriu o pedido.",
    icon: APPROVER_TYPE_ICON.DIRECT_MANAGER,
  },
  {
    value: ApproverType.COST_CENTER_MANAGER,
    label: "Gestor do Centro de Custo",
    detail: "Vai para quem responde pelo Centro de Custo do pedido.",
    icon: APPROVER_TYPE_ICON.COST_CENTER_MANAGER,
  },
]

export function ApproverTypeChoice({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: ApproverType
  onChange: (value: ApproverType) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <ChoiceField
      value={value}
      options={OPTIONS}
      onChange={onChange}
      ariaLabel="Quem aprova"
      disabled={disabled}
      className={className}
    />
  )
}
