import { Lifebuoy, PaperPlaneTilt } from "@phosphor-icons/react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { label: "Suporte", href: "#", icon: <Lifebuoy /> },
  { label: "Enviar feedback", href: "#", icon: <PaperPlaneTilt /> },
]

export function NavSupport() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                size="sm"
                tooltip={item.label}
                render={<a href={item.href} />}
                className="text-label text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
