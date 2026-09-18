import { onlyDigits } from "@/lib/cnpj"

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length !== 11) {
    return digits
  }

  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}
