import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PurchaseRequest } from "@/api/purchase-requests"
import { PersonPicker } from "@/components/shared/person-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useMembers } from "@/hooks/members/use-members"
import { useReassignStep } from "@/hooks/purchase-requests/use-purchase-requests"
import { CompanyMemberRole } from "@/types/enums"

export function ReassignDialog({
  request,
  currentApproverId,
  open,
  onOpenChange,
}: {
  request: PurchaseRequest
  currentApproverId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [memberId, setMemberId] = useState<string | null>(null)

  const { data: members = [] } = useMembers()
  const reassign = useReassignStep(request.id)

  const options = members
    .filter(
      (member) =>
        member.role === CompanyMemberRole.APPROVER ||
        member.role === CompanyMemberRole.FINANCE_ADMIN,
    )
    .map((member) => ({
      member,
      blocked:
        member.id === currentApproverId
          ? "Já é o aprovador desta etapa"
          : member.id === request.requesterId
            ? "Não pode aprovar o próprio pedido"
            : null,
    }))

  function close(next: boolean) {
    if (!next) {
      setMemberId(null)
    }

    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (!memberId) {
              return
            }

            reassign.mutate(memberId, {
              onSuccess: () => {
                toast.success("Etapa reatribuída.")
                close(false)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-heading">Reatribuir etapa</DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              A etapa atual passa para outra pessoa. As etapas seguintes seguem
              a rota original.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-5">
            <Label className="text-label text-foreground">Novo aprovador</Label>
            <PersonPicker
              options={options}
              value={memberId}
              onChange={setMemberId}
              allowEmpty={false}
              placeholder="Escolher quem decide"
            />
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" className="font-medium" />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!memberId || reassign.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {reassign.isPending ? "Reatribuindo…" : "Reatribuir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
