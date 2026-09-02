import {
  ArrowSquareOut,
  BellSimple,
  CheckCircle,
  Lock,
  WarningCircle,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth/use-session"
import { useMembers } from "@/hooks/members/use-members"
import { useCompanyName } from "@/hooks/companies/use-company-name"
import { useMe } from "@/hooks/users/use-users"
import { CompanyMemberRole, ROLE_LABELS } from "@/types/enums"

import { MyAbsenceCard } from "@/features/members/components/my-absence-card"

import { AvatarPicker } from "./components/avatar-picker"
import { ChangePasswordDialog } from "./components/change-password-dialog"
import { DangerZone } from "./components/danger-zone"
import { IdentityForm } from "./components/identity-form"

function joinedAt(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
}

export function ProfilePage() {
  const [changingPassword, setChangingPassword] = useState(false)
  const { membership } = useSession()

  const decides =
    membership?.role === CompanyMemberRole.APPROVER ||
    membership?.role === CompanyMemberRole.FINANCE_ADMIN

  const companyName = useCompanyName()
  const meQuery = useMe()
  const membersQuery = useMembers(decides)

  if (meQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-72" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader title="Meu perfil" />
        <LoadError
          message={getApiErrorMessage(meQuery.error)}
          onRetry={() => void meQuery.refetch()}
        />
      </div>
    )
  }

  const user = meQuery.data
  const members = membersQuery.data ?? []
  const me = members.find((member) => member.userId === user.id)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Meu perfil" }]}
        title={user.name}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-subhead text-muted-foreground">
              {user.email}
            </span>
            {membership ? (
              <>
                <span aria-hidden className="text-muted-foreground/40">
                  ·
                </span>
                <span className="text-subhead text-muted-foreground">
                  {ROLE_LABELS[membership.role]}
                  {companyName ? ` na ${companyName}` : ""}
                </span>
              </>
            ) : null}
          </span>
        }
        action={<AvatarPicker user={user} compact />}
      />

      {me ? <MyAbsenceCard me={me} members={members} /> : null}

      <IdentityForm user={user} />

      <SettingGroup
        title="Acesso e segurança"
        description="Como você entra no AprovAI."
      >
        <SettingRow
          label="E-mail"
          description="Não é possível alterar"
          hint={
            user.emailVerified
              ? undefined
              : "Este endereço ainda não foi confirmado. Alguns avisos podem não chegar."
          }
          control={
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-body text-muted-foreground">
                {user.email}
              </span>
              {user.emailVerified ? (
                <CheckCircle
                  size={15}
                  weight="fill"
                  aria-label="E-mail confirmado"
                  className="shrink-0 text-brand-accent-strong"
                />
              ) : (
                <WarningCircle
                  size={15}
                  weight="fill"
                  aria-label="E-mail não confirmado"
                  className="shrink-0 text-warning-strong"
                />
              )}
            </span>
          }
        />

        <SettingRow
          label="Senha"
          description="Confirmada por e-mail"
          control={
            <Button
              variant="outline"
              onClick={() => setChangingPassword(true)}
              className="h-9 gap-1.5 bg-card font-medium"
            >
              <Lock size={14} aria-hidden />
              Alterar senha
            </Button>
          }
        />

        <SettingRow
          label="Notificações"
          description="O que chega no seu e-mail"
          control={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/notificacoes/preferencias" />}
              className="h-9 gap-1.5 bg-card font-medium"
            >
              <BellSimple size={14} aria-hidden />
              Preferências
            </Button>
          }
        />

        <SettingRow
          label="Na equipe desde"
          control={
            <span className="text-body text-muted-foreground">
              {joinedAt(user.createdAt)}
            </span>
          }
        />
      </SettingGroup>

      {user.isSuperAdmin ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4 shadow-xs">
          <div className="min-w-0">
            <p className="text-label text-foreground">Acesso de plataforma</p>
            <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
              Sua conta administra outras organizações além desta.
            </p>
          </div>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/plataforma" />}
            className="h-9 shrink-0 gap-1.5 bg-card font-medium"
          >
            Abrir plataforma
            <ArrowSquareOut size={14} aria-hidden />
          </Button>
        </section>
      ) : null}

      <DangerZone />

      <ChangePasswordDialog
        open={changingPassword}
        onOpenChange={setChangingPassword}
        email={user.email}
      />
    </div>
  )
}
