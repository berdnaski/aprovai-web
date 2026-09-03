import { Lifebuoy, PaperPlaneTilt } from "@phosphor-icons/react"
import { useState } from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FeedbackDialog } from "@/features/feedback/feedback-dialog"

export function NavSupport() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <>
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip="Suporte"
                render={<a href="#" />}
                className="text-label text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
              >
                <Lifebuoy />
                <span>Suporte</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip="Enviar feedback"
                onClick={() => setFeedbackOpen(true)}
                className="text-label text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
              >
                <PaperPlaneTilt />
                <span>Enviar feedback</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}
