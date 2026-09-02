import { useState } from "react"
import { APP_HOME } from "@/routes/destinations"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { SetupShell } from "@/components/layout/setup-shell"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCompleteOnboarding,
  useOnboardingStatus,
} from "@/hooks/onboarding/use-onboarding"
import { OnboardingStep } from "@/types/enums"

import { CostCenterStep } from "./components/cost-center-step"
import { MatrixStep } from "./components/matrix-step"
import { TeamStep } from "./components/team-step"
import { SETUP_PHASES } from "./setup-phases"

const STEPS = ["cost-center", "approvals", "team"] as const

type StepKey = (typeof STEPS)[number]

export function OnboardingPage() {
  const navigate = useNavigate()
  const statusQuery = useOnboardingStatus()
  const completeMutation = useCompleteOnboarding()
  const [stepIndex, setStepIndex] = useState(0)

  if (statusQuery.data?.step === OnboardingStep.DONE) {
    return <Navigate to={APP_HOME} replace />
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
        navigate("/", { replace: true })
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
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
            <MatrixStep onBack={goBack} onNext={goNext} />
          ) : null}

          {currentStep === "team" ? (
            <TeamStep
              onBack={goBack}
              onFinish={handleFinish}
              isFinishing={completeMutation.isPending}
            />
          ) : null}
        </>
      )}
    </SetupShell>
  )
}
