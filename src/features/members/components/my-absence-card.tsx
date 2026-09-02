import { Airplane, X } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Member } from "@/api/members"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSetMySubstitute } from "@/hooks/members/use-members"
import { cn } from "@/lib/utils"
import { CompanyMemberRole } from "@/types/enums"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

const ELIGIBLE: CompanyMemberRole[] = [
  CompanyMemberRole.APPROVER,
  CompanyMemberRole.FINANCE_ADMIN,
]

function todayValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function MyAbsenceCard({
  me,
  members,
}: {
  me: Member
  members: Member[]
}) {
  const [open, setOpen] = useState(false)
  const [substituteId, setSubstituteId] = useState(me.substituteId ?? "")
  const [from, setFrom] = useState(me.absentFrom?.slice(0, 10) ?? todayValue())
  const [until, setUntil] = useState(me.absentUntil?.slice(0, 10) ?? "")

  const save = useSetMySubstitute()

  const substitute = me.substituteId
    ? members.find((item) => item.id === me.substituteId)
    : undefined

  const candidates = members
    .filter((item) => item.id !== me.id && ELIGIBLE.includes(item.role))
    .map((item) => ({
      member: item,
      blocked: item.substituteId
        ? "já delegou para outra pessoa"
        : members.some((other) => other.substituteId === item.id)
          ? "já está cobrindo alguém"
          : null,
    }))

  const valid = Boolean(substituteId && from && until && until >= from)

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    save.mutate(
      { substituteId, absentFrom: from, absentUntil: until },
      {
        onSuccess: () => {
          toast.success("Substituto definido.")
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  function clearSubstitute() {
    save.mutate(
      { substituteId: null, absentFrom: null, absentUntil: null },
      {
        onSuccess: () => {
          toast.success("Substituição removida. As aprovações voltam para você.")
          setSubstituteId("")
          setUntil("")
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <section
      aria-label="Minha ausência"
      className={cn(
        "rise-in flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg border px-4 py-3.5 shadow-xs",
        substitute ? "border-warning/25 bg-warning/6" : "border-border bg-card",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            substitute
              ? "border-warning/20 bg-warning/10 text-warning-strong"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          <Airplane size={16} />
        </span>

        <div className="min-w-0">
          <p className="text-label text-foreground">
            {substitute ? "Você está fora" : "Vai se ausentar?"}
          </p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            {substitute ? (
              <>
                <span className="text-foreground">
                  {substitute.user?.name}
                </span>{" "}
                decide no seu lugar
                {me.absentUntil
                  ? ` até ${DATE.format(new Date(me.absentUntil))}`
                  : ""}
                .
              </>
            ) : (
              "Defina quem decide os pedidos que caírem em você enquanto estiver fora."
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {substitute ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={save.isPending}
            onClick={clearSubstitute}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X size={13} aria-hidden />
            Voltei
          </Button>
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" className="h-9 bg-card font-medium" />
            }
          >
            {substitute ? "Alterar" : "Definir substituto"}
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle className="text-heading">
                  Quem decide enquanto você estiver fora
                </DialogTitle>
                <DialogDescription className="text-caption leading-relaxed">
                  Os pedidos que caírem em você no período seguem direto para o
                  substituto, sem esperar seu retorno.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="absent-from"
                      className="text-label text-foreground"
                    >
                      Saio em
                    </Label>
                    <Input
                      id="absent-from"
                      type="date"
                      value={from}
                      min={todayValue()}
                      onChange={(event) => setFrom(event.target.value)}
                      className="h-10 text-body md:text-body"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="absent-until"
                      className="text-label text-foreground"
                    >
                      Volto em
                    </Label>
                    <Input
                      id="absent-until"
                      type="date"
                      value={until}
                      min={from}
                      onChange={(event) => setUntil(event.target.value)}
                      className="h-10 text-body md:text-body"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-label text-foreground">Substituto</span>

                  {candidates.length > 0 ? (
                    <PersonPicker
                      options={candidates}
                      value={substituteId || null}
                      onChange={(next) => setSubstituteId(next ?? "")}
                      allowEmpty={false}
                      placeholder="Escolher quem assume"
                    />
                  ) : (
                    <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-caption leading-relaxed text-muted-foreground">
                      Nenhum aprovador ou admin financeiro disponível para
                      assumir suas decisões.
                    </p>
                  )}

                  <p className="text-caption leading-relaxed text-muted-foreground">
                    Quem substitui decide no seu lugar, mas com a sua alçada — o
                    perfil e o teto dele não mudam.
                  </p>
                </div>

                {until && from && until < from ? (
                  <p className="text-caption text-destructive">
                    A volta precisa ser depois da saída.
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <DialogClose
                  render={
                    <Button
                      variant="outline"
                      type="button"
                      className="font-medium"
                    />
                  }
                >
                  Cancelar
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!valid || save.isPending}
                  className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  {save.isPending ? "Salvando…" : "Definir substituto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
