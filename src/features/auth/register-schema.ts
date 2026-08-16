import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome deve ter ao menos 3 caracteres.")
    .max(120),
  email: z.email("Informe um e-mail válido.").max(180),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(72),
  termsAccepted: z.literal(true, {
    error: "É preciso aceitar os termos para continuar.",
  }),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
