import { Lock } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import type { Company, UpdateCompanyPayload } from "@/api/companies"
import { getApiErrorMessage } from "@/api/client"
import {
  SettingActions,
  SettingGroup,
  SettingRow,
} from "@/components/shared/setting-row"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUpdateCompany } from "@/hooks/companies/use-companies"
import { formatCnpj } from "@/lib/cnpj"
import {
  COMPANY_SIZES,
  INDUSTRIES,
} from "@/features/onboarding/onboarding-schema"

interface Draft {
  legalName: string
  tradeName: string
  industry: string | null
  companySize: string | null
}

function toDraft(company: Company): Draft {
  return {
    legalName: company.legalName,
    tradeName: company.tradeName ?? "",
    industry: company.industry,
    companySize: company.companySize,
  }
}

export function DetailsForm({ company }: { company: Company }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(company))
  const update = useUpdateCompany()

  const saved = toDraft(company)

  const changed = (Object.keys(saved) as (keyof Draft)[]).filter(
    (key) => (draft[key] ?? "") !== (saved[key] ?? ""),
  )

  const legalName = draft.legalName.trim()
  const legalNameError =
    legalName.length === 0
      ? "A razão social é obrigatória."
      : legalName.length < 3
        ? "Precisa de ao menos 3 caracteres."
        : legalName.length > 180
          ? "No máximo 180 caracteres."
          : undefined

  const tradeNameError =
    draft.tradeName.trim().length > 180 ? "No máximo 180 caracteres." : undefined

  const blocked = Boolean(legalNameError || tradeNameError)
  const display = draft.tradeName.trim() || legalName

  function set(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function submit() {
    const payload: UpdateCompanyPayload = {}

    if (changed.includes("legalName")) {
      payload.legalName = legalName
    }

    if (changed.includes("tradeName")) {
      payload.tradeName = draft.tradeName.trim() || null
    }

    if (changed.includes("industry")) {
      payload.industry = draft.industry
    }

    if (changed.includes("companySize")) {
      payload.companySize = draft.companySize
    }

    update.mutate(payload, {
      onSuccess: () => toast.success("Dados da empresa atualizados."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (changed.length > 0 && !blocked && !update.isPending) {
          submit()
        }
      }}
    >
      <SettingGroup
        title="Dados cadastrais"
        description="Identificam a empresa no AprovAI e nos documentos que ela emite."
        footer={
          <SettingActions
            dirtyCount={changed.length}
            blocked={blocked}
            pending={update.isPending}
            onReset={() => setDraft(toDraft(company))}
          />
        }
      >
        <SettingRow
          label="Razão social"
          description="Registrada na Receita"
          error={legalNameError}
          control={
            <Input
              value={draft.legalName}
              onChange={(event) => set({ legalName: event.target.value })}
              aria-label="Razão social"
              aria-invalid={Boolean(legalNameError)}
              autoComplete="organization"
              className="h-9 max-w-md text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="Nome fantasia"
          description="Opcional"
          error={tradeNameError}
          hint={
            <>
              Aparece como{" "}
              <span className="font-medium text-foreground">{display}</span> no
              menu e nos convites.
            </>
          }
          control={
            <Input
              value={draft.tradeName}
              onChange={(event) => set({ tradeName: event.target.value })}
              aria-label="Nome fantasia"
              aria-invalid={Boolean(tradeNameError)}
              placeholder={legalName}
              className="h-9 max-w-md text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="CNPJ"
          control={
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    tabIndex={0}
                    className="flex h-9 cursor-help items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 text-body tabular-nums text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                }
              >
                {formatCnpj(company.cnpj)}
                <Lock size={12} aria-hidden className="shrink-0 opacity-60" />
              </TooltipTrigger>
              <TooltipContent>
                Pedidos, notas e a auditoria já gravados apontam para este CNPJ.
                Para outro, crie uma nova empresa.
              </TooltipContent>
            </Tooltip>
          }
        />

        <SettingRow
          label="Ramo"
          control={
            <Select
              value={draft.industry}
              onValueChange={(next) =>
                set({ industry: (next ?? null) as string | null })
              }
            >
              <SelectTrigger
                className="h-9 w-52 bg-card px-3"
                aria-label="Ramo"
              >
                <SelectValue>
                  {(value: string | null) => value ?? "Não informado"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Não informado</SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <SettingRow
          label="Porte"
          control={
            <Select
              value={draft.companySize}
              onValueChange={(next) =>
                set({ companySize: (next ?? null) as string | null })
              }
            >
              <SelectTrigger
                className="h-9 w-52 bg-card px-3"
                aria-label="Porte"
              >
                <SelectValue>
                  {(value: string | null) =>
                    value ? `${value} pessoas` : "Não informado"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Não informado</SelectItem>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} pessoas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </SettingGroup>
    </form>
  )
}
