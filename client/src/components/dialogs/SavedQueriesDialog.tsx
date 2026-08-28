import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Connection, SavedQuery } from "@/types";
import { api } from "@/services/apiClient";
import { toast } from "sonner";
import { BrainCircuit, Plus, Trash2, Pencil } from "lucide-react";
import SavedQueryFormDialog from "./SavedQueryFormDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";

interface SavedQueriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: Connection | undefined;
  onPatternsChange?: () => void;
}

export default function SavedQueriesDialog({
  open,
  onOpenChange,
  connection,
  onPatternsChange,
}: SavedQueriesDialogProps) {
  const [patterns, setPatterns] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<SavedQuery | undefined>(
    undefined
  );

  const loadPatterns = useCallback(async () => {
    if (!connection?.id) return;
    try {
      setIsLoading(true);
      const data = await api.getSavedQueries(connection.id);
      setPatterns(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load saved queries");
    } finally {
      setIsLoading(false);
    }
  }, [connection?.id]);

  useEffect(() => {
    if (open && connection?.id) {
      loadPatterns();
    }
  }, [open, connection?.id, loadPatterns]);

  if (!connection) return null;

  const handleDeletePattern = async (id: string) => {
    try {
      await api.deleteSavedQuery(id);
      toast.success("Query removed.");
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      onPatternsChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete pattern.");
    }
  };

  const handleOpenAdd = () => {
    setEditingPattern(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (pattern: SavedQuery) => {
    setEditingPattern(pattern);
    setFormOpen(true);
  };

  const handleFormSaved = () => {
    loadPatterns();
    onPatternsChange?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[700px] max-w-2xl flex-col rounded-lg sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <div className="flex gap-2.5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BrainCircuit className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-lg">Saved Queries</DialogTitle>
                <DialogDescription className="text-xs">
                  Ground-truth SQL/MQL reference patterns for{" "}
                  <strong>{connection.name}</strong>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-6 text-muted-foreground" />
              </div>
            ) : patterns.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center">
                <BrainCircuit className="size-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">No saved queries yet</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Manually add queries here or click &quot;Save Query&quot;
                  under any assistant response in chat.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenAdd}
                  className="mt-2 gap-1.5 text-xs"
                >
                  <Plus className="size-3.5" />
                  Add Your First Query
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {patterns.map((item) => (
                  <Card key={item.id} className="m-2 rounded-lg py-3">
                    <CardHeader className="flex items-center justify-between border-b pb-3!">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-sm">
                          {item.question}
                        </CardTitle>
                        <span className="w-fit rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Used {item.usage_count ?? 0}{" "}
                          {item.usage_count === 1 ? "time" : "times"}
                        </span>
                      </div>
                      <CardAction className="flex items-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit query"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeletePattern(item.id)}
                          title="Delete query"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <p className="py-1 font-mono text-xs wrap-break-word text-muted-foreground">
                        {item.query}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Fixed footer with Add button */}
          {!isLoading && (
            <div className="flex shrink-0 justify-end border-t border-border pt-4">
              <Button
                size="sm"
                variant="default"
                onClick={handleOpenAdd}
                className="gap-1.5 text-sm"
              >
                <Plus className="size-3.5" />
                Add Query
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SavedQueryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        connectionId={connection.id}
        pattern={editingPattern}
        onSaved={handleFormSaved}
      />
    </>
  );
}
