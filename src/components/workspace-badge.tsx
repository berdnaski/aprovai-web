import icon from "@/assets/icon.svg"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/hooks/auth/use-session"

export function WorkspaceBadge() {
  const { membership } = useSession()
  const name = membership?.companyName ?? "AprovAI"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={name}
          className="gap-2.5 hover:bg-transparent active:bg-transparent"
        >
          <img src={icon} alt="" className="size-5 shrink-0" />
          <div className="grid flex-1 text-left">
            <span className="truncate text-label text-foreground">{name}</span>
            <span className="truncate text-caption text-muted-foreground">
              AprovAI
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
