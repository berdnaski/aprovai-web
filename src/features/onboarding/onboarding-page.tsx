import { useRef, useState } from "react"
import { appHomeFor } from "@/routes/destinations"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { SetupShell } from "@/components/layout/setup-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth/use-session"
import {
  useCompleteOnboarding,
  useOnboardingStatus,
} from "@/hooks/onboarding/use-onboarding"
import { CompanyMemberRole, OnboardingStep } from "@/types/enums"

import { InviteMemberDialog } from "@/features/members/components/invite-member-dialog"

import { CostCenterStep } from "./components/cost-center-step"
import { MatrixStep } from "./components/matrix-step"
import { SETUP_PHASES } from "./setup-phases"

const STEPS = ["cost-center", "approvals"] as const

type StepKey = (typeof STEPS)[number]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { membership } = useSession()
  const statusQuery = useOnboardingStatus()
  const completeMutation = useCompleteOnboarding()
  const [stepIndex, setStepIndex] = useState(0)
  const [invitingTeam, setInvitingTeam] = useState(false)
  const entered = useRef(false)

  // Ao concluir, o status vira DONE e este redirect dispararia antes do
  // convite aparecer. Enquanto o modal está aberto, quem navega é ele.
  if (statusQuery.data?.step === OnboardingStep.DONE && !invitingTeam) {
    return <Navigate to={appHomeFor(membership?.role)} replace />
  }

  // Acesso direto pela URL: quem não é Admin Financeiro não consegue
  // concluir nenhuma etapa daqui.
  if (membership && membership.role !== CompanyMemberRole.FINANCE_ADMIN) {
    return <Navigate to="/empresa-em-configuracao" replace />
  }

  const currentStep: StepKey = STEPS[stepIndex]

  function goBack() {
    setStepIndex((index) => Math.max(0, index - 1))
  }

  function goNext() {
    setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))
  }

  function handleFinish() {
    completeMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Tudo pronto. Sua empresa já aceita pedidos de compra.")
        setInvitingTeam(true)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  // Ao convidar, o modal avisa e fecha em seguida: sem esta trava as duas
  // navegações disparam juntas e a de fechar sobrescreve o destino certo.
  function enterApp(destination: string) {
    if (entered.current) {
      return
    }

    entered.current = true
    setInvitingTeam(false)
    navigate(destination, { replace: true })
  }

  return (
    <SetupShell phases={SETUP_PHASES} currentPhase={currentStep}>
      {statusQuery.isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-9 w-2/3 rounded-lg" />
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {currentStep === "cost-center" ? (
            <CostCenterStep onNext={goNext} />
          ) : null}

          {currentStep === "approvals" ? (
            <MatrixStep
              onBack={goBack}
              onNext={handleFinish}
              nextLabel="Concluir configuração"
              isSubmitting={completeMutation.isPending}
            />
          ) : null}
        </>
      )}

      <InviteMemberDialog
        open={invitingTeam}
        title="Empresa configurada. Quer chamar alguém?"
        description="Você já pode abrir pedidos sozinho. Se quiser trazer o time agora, o convite vai por e-mail — dá para convidar mais gente depois, em Equipe."
        cancelLabel="Deixar para depois"
        onInvited={() => enterApp("/equipe")}
        onOpenChange={(next) => {
          if (!next && invitingTeam) {
            enterApp("/")
          }
        }}
      />
    </SetupShell>
  )
}
