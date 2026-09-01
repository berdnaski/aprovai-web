import { Check, Copy } from "@phosphor-icons/react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import type { Company } from "@/api/companies"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs"
import { useMyCompany } from "@/hooks/companies/use-companies"
import { formatCnpj } from "@/lib/cnpj"
import { cn } from "@/lib/utils"

import { DetailsForm } from "./components/details-form"
import { PolicyForm } from "./components/policy-form"

const TABS = {
  details: "/empresa/dados",
  policy: "/empresa/politica",
} as const

type TabId = keyof typeof TABS

function CompanyMeta({ company }: { company: Company }) {
  const [copied, setCopied] = useState(false)
  const traits = [company.industry, company.companySize].filter(Boolean)

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatCnpj(company.cnpj))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar CNPJ"
        className={cn(
          "group/cnpj -mx-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-subhead tabular-nums transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          copied
            ? "text-brand-accent-strong"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {formatCnpj(company.cnpj)}
        {copied ? (
          <Check size={12} weight="bold" aria-hidden />
        ) : (
          <Copy
            size={12}
            aria-hidden
            className="opacity-0 transition-opacity group-hover/cnpj:opacity-60"
          />
        )}
      </button>

      {traits.length > 0 ? (
        <>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="text-subhead text-muted-foreground">
            {traits.join(" · ")}
          </span>
        </>
      ) : null}
    </span>
  )
}

export function CompanyPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const companyQuery = useMyCompany()
  const tab: TabId = pathname.startsWith(TABS.policy) ? "policy" : "details"

  if (companyQuery.isPending) {
    return <CompanySkeleton />
  }

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader title="Empresa" />
        <LoadError
          message="Não foi possível carregar os dados da empresa."
          onRetry={() => void companyQuery.refetch()}
        />
      </div>
    )
  }

  const company = companyQuery.data

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Empresa" }]}
        title={company.tradeName ?? company.legalName}
        description={<CompanyMeta company={company} />}
      />

      <Tabs value={tab} onValueChange={(next) => navigate(TABS[next as TabId])}>
        <TabsList>
          <TabsTab value="details">Dados</TabsTab>
          <TabsTab value="policy">Política</TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="details">
          <DetailsForm company={company} />
        </TabsPanel>

        <TabsPanel value="policy">
          <PolicyForm company={company} />
        </TabsPanel>
      </Tabs>
    </div>
  )
}

function CompanySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando dados da empresa</span>

      <div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
      </div>

      <Skeleton className="h-9 w-44 rounded-lg" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  )
}
