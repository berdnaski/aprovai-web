export type WritingHintKey =
  | "quantity"
  | "reason"
  | "price"
  | "supplier"
  | "deadline"
  | "payment"

export interface WritingHint {
  key: WritingHintKey
  label: string
  snippet: string
  done: boolean
}

const CHECKS: {
  key: WritingHintKey
  label: string
  snippet: string
  pattern: RegExp
}[] = [
  {
    key: "quantity",
    label: "Quantidade",
    snippet: "Quantidade: ",
    pattern:
      /\bquantidade\b|\b\d+([.,]\d+)?\s+(?!dias?\b|reais\b|mil\b|por\s+cento\b)[a-zà-úç]{3,}/i,
  },
  {
    key: "reason",
    label: "Para que serve",
    snippet: "Para que serve: ",
    pattern:
      /\b(pra|para|porque|pois|devido|precis\w*|necess\w*|substitu\w*|troca\w*|repor|reposi\w*|equipe|time|projeto|setor|obra)\b/i,
  },
  {
    key: "price",
    label: "Valor",
    snippet: "Valor estimado: R$ ",
    pattern: /R\$\s*\d|\b\d+([.,]\d{3})*([.,]\d{2})?\s*(mil\s+)?reais\b|\bvalor\b[^\n]*\d/i,
  },
  {
    key: "supplier",
    label: "Fornecedor",
    snippet: "Fornecedor: ",
    pattern:
      /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b|\b(fornecedor|loja|distribuidora|revenda\w*|cota[cç][aã]o|or[cç]amento d[aeo]|proposta d[aeo])\b|\b(ltda|eireli)\b|\bs\.?\/?a\.?(?=\s|$)/i,
  },
  {
    key: "deadline",
    label: "Prazo",
    snippet: "Precisa chegar até: ",
    pattern:
      /\b(prazo|urgente|urg[eê]ncia|entrega\w*|imediat\w*|at[eé]\s+(o\s+)?dia|at[eé]\s+\d{1,2}|(esta|essa|pr[oó]xima)\s+semana|m[eê]s\s+que\s+vem)\b|\b\d{1,2}\/\d{1,2}\b/i,
  },
  {
    key: "payment",
    label: "Condição com o fornecedor",
    snippet: "Condição negociada: ",
    pattern:
      /\b(parcelad\w*|[aà]\s+vista|\d+\s*dias\s+(de\s+)?prazo|prazo\s+de\s+\d+\s*dias)\b/i,
  },
]

export function analyzeRequestText(text: string): WritingHint[] {
  return CHECKS.map(({ key, label, snippet, pattern }) => ({
    key,
    label,
    snippet,
    done: pattern.test(text),
  }))
}
