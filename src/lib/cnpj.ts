export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function formatCnpj(value: string): string {
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

  const checkDigit = (length: number): number => {
    const slice = digits.slice(0, length)
    let factor = length - 7
    let sum = 0

    for (let index = 0; index < length; index += 1) {
      sum += Number(slice[index]) * factor
      factor = factor === 2 ? 9 : factor - 1
    }

    const remainder = sum % 11

    return remainder < 2 ? 0 : 11 - remainder
  }

  return (
    checkDigit(12) === Number(digits[12]) &&
    checkDigit(13) === Number(digits[13])
  )
}
