import { Check, MagnifyingGlass, Users } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
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
import {
  useCompanyMembers,
  useLinkCostCenterMembers,
} from "@/hooks/cost-centers/use-cost-centers"
import { initialsOf } from "@/lib/people"
import { ROLE_LABELS } from "@/types/enums"
import { cn } from "@/lib/utils"


export function LinkMemberDialog({
  costCenterId,
  costCenterName,
  linkedIds,
  trigger,
}: {
  costCenterId: string
  costCenterName: string
  linkedIds: string[]
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<string[]>([])

  const { data: members = [], isPending } = useCompanyMembers()
  const link = useLinkCostCenterMembers(costCenterId)

  const alreadyLinked = new Set(linkedIds)
  const term = query.trim().toLowerCase()

  const candidates = members.filter((member) => {
    if (!term) {
      return true
    }

    const name = member.user?.name?.toLowerCase() ?? ""
    const email = member.user?.email?.toLowerCase() ?? ""

    return name.includes(term) || email.includes(term)
  })

  const available = candidates.filter(
    (member) => !alreadyLinked.has(member.id),
  )
  const linked = candidates.filter((member) => alreadyLinked.has(member.id))

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (picked.length === 0) {
      return
    }

    link.mutate(picked, {
      onSuccess: () => {
        toast.success(
          picked.length === 1
            ? `1 pessoa vinculada a ${costCenterName}.`
            : `${picked.length} pessoas vinculadas a ${costCenterName}.`,
        )
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery("")
          setPicked([])
        }
      }}
    >
      <DialogTrigger render={trigger} />

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Vincular pessoa a {costCenterName}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Quem for vinculado passa a abrir pedidos neste centro. O perfil e
              a alçada valem para a empresa inteira e são alterados em Equipe,
              não aqui.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-5">
            <div className="relative">
              <MagnifyingGlass
                size={15}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou e-mail"
                aria-label="Buscar pessoa"
                autoFocus
                className="h-10 pl-9 text-body md:text-body"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
              {isPending ? (
                <p className="px-4 py-10 text-center text-caption text-muted-foreground">
                  Carregando pessoas…
                </p>
              ) : available.length === 0 && linked.length === 0 ? (
                <p className="px-4 py-10 text-center text-caption text-muted-foreground">
                  {term
                    ? "Ninguém encontrado com esse nome."
                    : "Todo mundo da empresa já está vinculado aqui."}
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {available.map((member) => {
                    const selected = picked.includes(member.id)
                    const name = member.user?.name ?? "Pessoa sem cadastro"

                    return (
                      <li key={member.id}>
                        <button
                          type="button"
                          onClick={() => toggle(member.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            selected ? "bg-primary/6" : "hover:bg-muted/50",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-medium",
                              selected
                                ? "bg-primary/12 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {initialsOf(name)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body text-foreground">
                              {name}
                            </p>
                            <p className="truncate text-caption text-muted-foreground">
                              {ROLE_LABELS[member.role]}
                              {member.user?.email ? (
                                <>
                                  <span aria-hidden className="px-1.5 text-border">
                                    /
                                  </span>
                                  {member.user.email}
                                </>
                              ) : null}
                            </p>
                          </div>

                          <span
                            aria-hidden
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border",
                            )}
                          >
                            {selected ? (
                              <Check size={12} weight="bold" />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })}

                  {linked.map((member) => (
                    <li key={member.id}>
                      <div className="flex w-full items-center gap-3 px-3 py-2.5 opacity-55">
                        <span
                          aria-hidden
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-muted-foreground"
                        >
                          {initialsOf(member.user?.name ?? "?")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body text-foreground">
                            {member.user?.name ?? "Pessoa sem cadastro"}
                          </p>
                        </div>

                        <span className="shrink-0 text-caption text-muted-foreground">
                          já vinculado
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-caption text-muted-foreground">
              {picked.length === 0
                ? "Selecione quem deve abrir pedidos aqui."
                : `${picked.length} ${picked.length === 1 ? "pessoa selecionada" : "pessoas selecionadas"}.`}
            </p>
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
              disabled={picked.length === 0 || link.isPending}
              className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <Users size={15} aria-hidden />
              {link.isPending
                ? "Vinculando…"
                : picked.length > 1
                  ? `Vincular ${picked.length} pessoas`
                  : "Vincular pessoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
