import { BookOpenText } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useState } from "react";
import { useConnection } from "@/providers/ConnectionProvider";
import BusinessRulesDialog from "../BusinessRulesDialog";

export default function BusinessRulesItem() {
  const { activeConnection } = useConnection();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeConnection) return null;

  const hasRules = Boolean(
    activeConnection.custom_instructions &&
    activeConnection.custom_instructions.trim().length > 0
  );

  return (
    <>
      <SidebarGroup className="py-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-between text-sidebar-foreground hover:bg-accent"
              title="Edit Business Rules & Custom Instructions"
            >
              <div className="flex items-center gap-2">
                <BookOpenText className="size-4" />
                <span className="truncate text-sm font-medium">
                  Business Rules
                </span>
              </div>
              {hasRules && (
                <span className="text-[11px] font-normal text-muted-foreground">
                  Active
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <BusinessRulesDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        connection={activeConnection}
      />
    </>
  );
}
