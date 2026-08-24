import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { Connection } from "@/types";
import { useConnection } from "@/providers/ConnectionProvider";
import { FileText } from "lucide-react";

interface BusinessRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: Connection | undefined;
}

export default function BusinessRulesDialog({
  open,
  onOpenChange,
  connection,
}: BusinessRulesDialogProps) {
  const { updateConnectionInstructions } = useConnection();
  const [instructions, setInstructions] = useState(
    connection?.custom_instructions || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (connection) {
      setInstructions(connection.custom_instructions || "");
    }
  }, [connection]);

  if (!connection) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateConnectionInstructions({
      id: connection.id,
      custom_instructions: instructions,
    });
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[700px] max-w-2xl flex-col rounded-lg sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <div className="flex gap-2">
            <div className="mt-1 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Business Rules & Instructions
              </DialogTitle>
              <DialogDescription className="text-xs">
                Custom rules for <strong>{connection.name}</strong> (
                {connection.db_type}). The AI assistant uses these instructions
                for every query in this database.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-2">
          <Textarea
            placeholder={`Examples:\n- Active users means status = 'active' and last_login within 30 days.\n- High value orders are orders with total_amount > 500.\n- Revenue calculation: sum of invoice totals where paid = true.`}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="h-full flex-1 resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        <DialogFooter className="shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Spinner />}
            Save Rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
