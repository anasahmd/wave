import { ChevronsUpDown, Plus, Waves } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddDatabaseDialog from "../dialogs/AddDatabaseDialog";
import { useConnection } from "@/providers/ConnectionProvider";
import { Spinner } from "../ui/spinner";

export default function DatabaseSwitcherMenu() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const {
    connections,
    activeConnection,
    switchingId,
    loading,
    switchConnection,
  } = useConnection();

  const switchingConnection = connections.find(
    (connection) => connection.id === switchingId
  );

  const handleSwitchConnection = (id: string) => {
    if (id !== activeConnection?.id) {
      switchConnection(id);
      navigate("/new");
    }
  };

  const [isAddDatabaseOpen, setIsAddDatabaseOpen] = useState(false);

  const isDisabled = loading || !!switchingId;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isDisabled}
              render={
                <SidebarMenuButton
                  size="lg"
                  disabled={isDisabled}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Waves className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {switchingConnection?.name ||
                        activeConnection?.name ||
                        "Wave"}
                    </span>
                    <span className="truncate text-xs">
                      {loading
                        ? "Loading..."
                        : switchingConnection?.db_type ||
                          activeConnection?.db_type ||
                          (connections.length > 0
                            ? "Choose Database"
                            : "No databases")}
                    </span>
                  </div>
                  {switchingConnection ? (
                    <Spinner />
                  ) : (
                    <ChevronsUpDown className="ml-auto" />
                  )}
                </SidebarMenuButton>
              }
            ></DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              {connections.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Databases
                  </DropdownMenuLabel>
                  {connections.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      onClick={() => handleSwitchConnection(connection.id)}
                      className="gap-2 p-2"
                    >
                      {connection.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )}

              {connections.length > 0 && <DropdownMenuSeparator />}

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsAddDatabaseOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add database
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AddDatabaseDialog
        open={isAddDatabaseOpen}
        onOpenChange={setIsAddDatabaseOpen}
      />
    </>
  );
}
