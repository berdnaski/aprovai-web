import { z } from "zod"

import { isValidCnpj, onlyDigits } from "@/lib/cnpj"
import { CompanyMemberRole } from "@/types/enums"

export const companySchema = z.object({
  cnpj: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 14, "O CNPJ precisa ter 14 dígitos.")
    .refine(isValidCnpj, "Este CNPJ não existe: confira os números digitados."),
  legalName: z
    .string()
    .trim()
    .min(3, "A razão social deve ter ao menos 3 caracteres.")
    .max(180),
  tradeName: z.string().trim().max(180).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  companySize: z.string().trim().max(20).optional().or(z.literal("")),
})

export type CompanyFormValues = z.input<typeof companySchema>

export const costCenterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter ao menos 2 caracteres.")
    .max(120),
  code: z.string().trim().max(30).optional().or(z.literal("")),
  managerId: z.uuid("Escolha quem responde por este Centro de Custo."),
})

export type CostCenterFormValues = z.infer<typeof costCenterSchema>

export const inviteSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  role: z.enum([
    CompanyMemberRole.REQUESTER,
    CompanyMemberRole.APPROVER,
    CompanyMemberRole.FINANCE_ADMIN,
  ]),
  defaultCostCenterId: z.string().optional(),
})

export type InviteFormValues = z.infer<typeof inviteSchema>

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const

export const INDUSTRIES = [
  "Indústria",
  "Comércio",
  "Serviços",
  "Tecnologia",
  "Saúde",
  "Educação",
  "Construção",
  "Agronegócio",
  "Logística",
  "Outro",
] as const
