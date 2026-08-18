import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowRight, Building2, Pencil, Search } from "lucide-react"

import { getApiErrorMessage } from "@/api/client"
import { SetupShell } from "@/components/layout/setup-shell"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authKeys, useSession } from "@/hooks/auth/use-session"
import {
  useCreateCompany,
  useLookupCnpj,
} from "@/hooks/onboarding/use-onboarding"
import { formatCnpj } from "@/lib/cnpj"

import {
  companySchema,
  COMPANY_SIZES,
  INDUSTRIES,
  type CompanyFormValues,
} from "./onboarding-schema"
import { SETUP_PHASES } from "./setup-phases"

export function CreateCompanyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const createCompanyMutation = useCreateCompany()
  const lookupMutation = useLookupCnpj()
  const [confirmed, setConfirmed] = useState(false)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    mode: "onBlur",
    defaultValues: {
      cnpj: "",
      legalName: "",
      tradeName: "",
      industry: "",
      companySize: "",
    },
  })

  const cnpjValue = String(form.watch("cnpj") ?? "")
  const canLookup = cnpjValue.replace(/\D/g, "").length === 14

  function handleLookup() {
    lookupMutation.mutate(cnpjValue, {
      onSuccess: (outcome) => {
        if (!outcome.ok) {
          toast.error(outcome.message)
          setConfirmed(true)
          return
        }

        form.setValue("legalName", outcome.data.legalName, {
          shouldValidate: true,
        })

        if (outcome.data.tradeName) {
          form.setValue("tradeName", outcome.data.tradeName)
        }

        setConfirmed(true)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setConfirmed(true)
      },
    })
  }

  function onSubmit(values: CompanyFormValues) {
    const parsed = companySchema.parse(values)

    createCompanyMutation.mutate(
      {
        cnpj: parsed.cnpj,
        legalName: parsed.legalName,
        tradeName: parsed.tradeName || undefined,
        industry: parsed.industry || undefined,
        companySize: parsed.companySize || undefined,
      },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: authKeys.session })
          navigate("/onboarding", { replace: true })
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  const firstName = user?.name.split(" ")[0]

  return (
    <SetupShell phases={SETUP_PHASES} currentPhase="company">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <div className="max-w-xl">
            <h1 className="text-display text-foreground">
              {firstName ? `Bem-vindo, ${firstName}` : "Bem-vindo"}
            </h1>
            <p className="mt-3 text-subhead text-muted-foreground">
              Vamos começar pela sua empresa. Informe o CNPJ e buscamos os dados
              na Receita Federal. Leva alguns segundos.
            </p>
          </div>

          {!confirmed ? (
            <>
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label text-foreground">
                      CNPJ
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="00.000.000/0000-00"
                          inputMode="numeric"
                          autoFocus
                          className="h-12 pl-10 text-subhead tabular-nums md:text-subhead"
                          value={formatCnpj(String(field.value ?? ""))}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value.replace(/\D/g, ""),
                            )
                          }
                          onBlur={field.onBlur}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && canLookup) {
                              event.preventDefault()
                              handleLookup()
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  onClick={handleLookup}
                  disabled={!canLookup || lookupMutation.isPending}
                  className="h-12 bg-primary text-body font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  {lookupMutation.isPending ? (
                    "Consultando a Receita..."
                  ) : (
                    <>
                      <Search className="size-4" />
                      Buscar dados da empresa
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  disabled={!canLookup}
                  className="text-center text-label font-normal text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Preencher manualmente
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-brand-accent/25 bg-brand-accent/5 px-4 py-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/12 text-brand-accent">
                  <ApprovalMark className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-overline text-muted-foreground">
                    CNPJ
                  </p>
                  <p className="text-body font-semibold text-foreground tabular-nums">
                    {formatCnpj(cnpjValue)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmed(false)
                    lookupMutation.reset()
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                  Alterar
                </Button>
              </div>

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label text-foreground">
                      Razão social
                    </FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label text-foreground">
                      Nome fantasia
                      <span className="ml-1 font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Como o time chama a empresa"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-label text-foreground">
                        Ramo
                        <span className="ml-1 font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-label text-foreground">
                        Funcionários
                        <span className="ml-1 font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border pt-6">
                <Button
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="h-11 bg-primary px-7 font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  {createCompanyMutation.isPending
                    ? "Criando empresa..."
                    : "Criar empresa"}
                  {!createCompanyMutation.isPending ? (
                    <ArrowRight className="size-4" />
                  ) : null}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </SetupShell>
  )
}
