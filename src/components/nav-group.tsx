import { CaretRight } from "@phosphor-icons/react"
import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavEntry {
  label: string
  to: string
  icon: React.ReactNode
}

export function NavGroup({
  label,
  entries,
}: {
  label: string
  entries: NavEntry[]
}) {
  const { pathname } = useLocation()
  const { state } = useSidebar()
  const [open, setOpen] = React.useState(true)

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`)

  const collapsedToIcons = state === "collapsed"

  return (
    <Collapsible
      open={collapsedToIcons ? true : open}
      onOpenChange={setOpen}
      render={<SidebarGroup className="group/nav-group" />}
    >
      <CollapsibleTrigger
        render={
          <SidebarGroupLabel className="text-overline text-muted-foreground transition-colors hover:text-foreground" />
        }
      >
        {label}
        <CaretRight className="ml-auto size-3.5 transition-transform duration-150 group-data-open/nav-group:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <SidebarGroupContent>
          <SidebarMenu>
            {entries.map((entry) => (
              <SidebarMenuItem key={entry.to}>
                <SidebarMenuButton
                  tooltip={entry.label}
                  isActive={isActive(entry.to)}
                  render={<Link to={entry.to} />}
                  className="text-label [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground data-active:[&>svg]:text-primary"
                >
                  {entry.icon}
                  <span>{entry.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </CollapsibleContent>
    </Collapsible>
  )
}
