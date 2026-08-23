import { CaretUpDown, ShieldCheck, SignOut, User } from "@phosphor-icons/react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { ROLE_LABELS } from "@/types/enums"

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return (first + last).toUpperCase()
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, membership } = useSession()
  const logoutMutation = useLogout()

  if (!user) {
    return null
  }

  const monogram = initials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-accent"
              />
            }
          >
            <Avatar className="size-8 rounded-md">
              <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="rounded-md bg-primary text-caption font-medium text-primary-foreground">
                {monogram}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left">
              <span className="truncate text-label text-foreground">
                {user.name}
              </span>
              <span className="truncate text-caption text-muted-foreground">
                {membership ? ROLE_LABELS[membership.role] : user.email}
              </span>
            </div>
            <CaretUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center gap-3 px-1.5 py-2">
              <Avatar className="size-9 rounded-md">
                <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="rounded-md bg-primary text-caption font-medium text-primary-foreground">
                  {monogram}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1">
                <span className="truncate text-label text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-caption text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-label"
                render={<Link to="/perfil" />}
              >
                <User className="text-muted-foreground" />
                Meu perfil
              </DropdownMenuItem>

              {user.isSuperAdmin ? (
                <DropdownMenuItem
                  className="text-label"
                  render={<Link to="/plataforma" />}
                >
                  <ShieldCheck className="text-muted-foreground" />
                  Ir para plataforma
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="text-label"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              <SignOut />
              {logoutMutation.isPending ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
