export interface SetupPhase {
  key: string
  title: string
}

export const SETUP_PHASES: SetupPhase[] = [
  { key: "company", title: "Empresa" },
  { key: "cost-center", title: "Centro de Custo" },
  { key: "approvals", title: "Aprovações" },
  { key: "team", title: "Equipe" },
]
