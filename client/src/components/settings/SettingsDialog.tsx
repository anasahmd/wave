import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DatabaseSection from "./DatabaseSection";
import SettingsNavButton from "./SettingsNavButton";
import { useState } from "react";
import { CircleUserRound, Database } from "lucide-react";
import AccountSection from "./AccountSection";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState("account");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-lg p-0 sm:max-w-3xl">
        <div className="flex h-[700px] gap-0">
          <nav className="flex w-3/12 flex-col border-r px-2 py-2">
            <p className="my-4 ml-2 text-sm text-muted-foreground">Settings</p>
            <SettingsNavButton
              active={activeSection === "account"}
              onClick={() => setActiveSection("account")}
            >
              <CircleUserRound className="size-4" />
              <p className="pt-0.5">Account</p>
            </SettingsNavButton>
            <SettingsNavButton
              active={activeSection === "database"}
              onClick={() => setActiveSection("database")}
            >
              <Database className="size-4" />
              <p className="pt-0.5">Databases</p>
            </SettingsNavButton>
          </nav>

          {/* Right content */}
          <div className="mx-2 mt-16 flex min-h-0 flex-1 flex-col px-4">
            {activeSection === "account" && <AccountSection />}
            {activeSection === "database" && <DatabaseSection />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
