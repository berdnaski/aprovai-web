import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(180),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(72),
})

export type LoginFormValues = z.infer<typeof loginSchema>
