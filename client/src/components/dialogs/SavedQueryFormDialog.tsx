import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { SavedQuery } from "@/types";
import { api } from "@/services/apiClient";
import { toast } from "sonner";

interface PatternFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  /** When provided, dialog operates in edit mode */
  pattern?: SavedQuery;
  onSaved: () => void;
}

export default function SavedQueryFormDialog({
  open,
  onOpenChange,
  connectionId,
  pattern,
  onSaved,
}: PatternFormDialogProps) {
  const [question, setQuestion] = useState("");
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!pattern;

  // Pre-fill form when editing
  useEffect(() => {
    if (open && pattern) {
      setQuestion(pattern.question);
      setQuery(pattern.query);
    } else if (open) {
      setQuestion("");
      setQuery("");
    }
  }, [open, pattern]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !query.trim()) {
      toast.error("Question and Query are required.");
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing) {
        await api.updateSavedQuery({
          id: pattern.id,
          question: question.trim(),
          query: query.trim(),
        });
        toast.success("Query updated successfully!");
      } else {
        await api.addSavedQuery({
          connectionId,
          question: question.trim(),
          query: query.trim(),
        });
        toast.success("Saved query added successfully!");
      }

      setQuestion("");
      setQuery("");
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error(
        err.message || `Failed to ${isEditing ? "update" : "add"} query.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Query" : "Add Saved Query"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update the question or query for this saved query."
              : "Teach the AI a verified question → query mapping it should follow."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              User Question
            </label>
            <Input
              placeholder="e.g. What is our total revenue for this month?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Target Query (SQL / MQL)
            </label>
            <Textarea
              placeholder={`SELECT SUM(total_amount) FROM orders WHERE created_at >= date_trunc('month', CURRENT_DATE);`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-56 font-mono text-sm leading-relaxed"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner className="mr-1 size-3.5" />}
              {isEditing ? "Update Query" : "Save Query"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
