import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { CurrentUser, UpdateUserPayload } from "@/api/users"
import {
  SettingActions,
  SettingGroup,
  SettingRow,
} from "@/components/shared/setting-row"
import { Input } from "@/components/ui/input"
import { useUpdateMe } from "@/hooks/users/use-users"

interface Draft {
  name: string
  phone: string
}

function toDraft(user: CurrentUser): Draft {
  return { name: user.name, phone: user.phone ?? "" }
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  const split = digits.length === 11 ? 7 : 6

  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`
}

export function IdentityForm({ user }: { user: CurrentUser }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(user))
  const update = useUpdateMe()

  const saved = toDraft(user)

  const changed = (Object.keys(saved) as (keyof Draft)[]).filter(
    (key) => draft[key].replace(/\D/g, "") !== saved[key].replace(/\D/g, "") ||
      (key === "name" && draft[key] !== saved[key]),
  )

  const name = draft.name.trim()
  const digits = draft.phone.replace(/\D/g, "")

  const nameError =
    name.length === 0
      ? "O nome é obrigatório."
      : name.length < 3
        ? "Precisa de ao menos 3 caracteres."
        : name.length > 120
          ? "No máximo 120 caracteres."
          : undefined

  const phoneError =
    digits.length > 0 && digits.length < 10
      ? "Informe DDD e número, ou deixe em branco."
      : undefined

  const blocked = Boolean(nameError || phoneError)

  function submit() {
    const payload: UpdateUserPayload = {}

    if (changed.includes("name")) {
      payload.name = name
    }

    if (changed.includes("phone")) {
      payload.phone = digits.length > 0 ? digits : null
    }

    update.mutate(payload, {
      onSuccess: () => toast.success("Perfil atualizado."),
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
        title="Seus dados"
        description="É assim que seu nome aparece nos pedidos, nas aprovações e na trilha de auditoria."
        footer={
          <SettingActions
            dirtyCount={changed.length}
            blocked={blocked}
            pending={update.isPending}
            onReset={() => setDraft(toDraft(user))}
          />
        }
      >
        <SettingRow
          label="Nome"
          description="Visível para toda a equipe"
          error={nameError}
          control={
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              aria-label="Nome"
              aria-invalid={Boolean(nameError)}
              autoComplete="name"
              className="h-9 w-full max-w-md text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="Telefone"
          description="Opcional"
          error={phoneError}
          hint="Usado só para contato interno. O AprovAI não envia mensagem para este número."
          control={
            <Input
              value={formatPhone(draft.phone)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              inputMode="tel"
              placeholder="(11) 98765-4321"
              aria-label="Telefone"
              aria-invalid={Boolean(phoneError)}
              autoComplete="tel"
              className="h-9 w-full max-w-[16rem] tabular-nums text-body md:text-body"
            />
          }
        />
      </SettingGroup>
    </form>
  )
}
