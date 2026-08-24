import { BrainCircuit } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useState } from "react";
import { useConnection } from "@/providers/ConnectionProvider";
import LearnedPatternsDialog from "../dialogs/LearnedPatternsDialog";

export default function LearnedPatternsItem() {
  const { activeConnection } = useConnection();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeConnection) return null;

  return (
    <>
      <SidebarGroup className="py-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-between text-sidebar-foreground hover:bg-accent"
              title="Manage Learned Query Patterns"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="size-4" />
                <span className="truncate text-sm font-medium">
                  Learned Patterns
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <LearnedPatternsDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        connection={activeConnection}
      />
    </>
  );
}
