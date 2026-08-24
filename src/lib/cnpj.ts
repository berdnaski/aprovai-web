export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length !== 14) {
    return digits
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  )
}

export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value)

  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false
  }

  const checkDigit = (slice: string, start: number): number => {
    let weight = start
    let sum = 0

    for (const char of slice) {
      sum += Number(char) * weight
      weight = weight === 2 ? 9 : weight - 1
    }

    const rest = sum % 11

    return rest < 2 ? 0 : 11 - rest
  }

  return (
    checkDigit(digits.slice(0, 12), 5) === Number(digits[12]) &&
    checkDigit(digits.slice(0, 13), 6) === Number(digits[13])
  )
}
