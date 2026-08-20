import { Button } from "../ui/button";
import { useState } from "react";
import { Edit, FileText, Trash, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { Connection } from "@/types";
import {
  removeConnection as removeConnectionAction,
} from "@/slices/connectionSlice";
import { useConnection } from "@/providers/ConnectionProvider";
import AddDatabaseDialog from "../dialogs/AddDatabaseDialog";
import BusinessRulesDialog from "../dialogs/BusinessRulesDialog";

export default function DatabaseSection() {
  const { connections } = useConnection();
  const [isAddDbOpen, setIsAddDbOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Databases</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDbOpen(true)}
        >
          Add Database
        </Button>
      </div>
      {connections.length === 0 ? (
        <div className="mb-20 flex flex-1 items-center justify-center">
          <h3 className="font-semibold">No databases</h3>
        </div>
      ) : (
        <div>
          {connections.map((connection) => (
            <DatabaseItem key={connection.id} connection={connection} />
          ))}
        </div>
      )}
      <AddDatabaseDialog open={isAddDbOpen} onOpenChange={setIsAddDbOpen} />
    </div>
  );
}

function DatabaseItem({ connection }: { connection: Connection }) {
  const { updateConnectionName, removeConnection } = useConnection();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(connection.name);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const handleSubmit = () => {
    setIsEditing(false);
    const trimmed = editedName.trim();

    if (!trimmed || trimmed === connection.name) {
      setEditedName(connection.name);
      return;
    }

    updateConnectionName({ id: connection.id, name: trimmed });
  };

  const handleRemoveConnection = async (id: string) => {
    setIsDeleting(true);
    const result = await removeConnection(id);
    setIsDeleting(false);
    if (removeConnectionAction.fulfilled.match(result)) {
      setOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
    if (event.key === "Escape") {
      setEditedName(connection.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-4">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            autoFocus
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="h-8 w-40 focus-visible:ring-1"
          />
        ) : (
          <span>{connection.name}</span>
        )}
        <span className="rounded-full border-2 border-accent px-2 py-1 text-xs">
          {connection.db_type}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          title="Business Rules & Instructions"
          onClick={() => setIsInstructionsOpen(true)}
        >
          <FileText className="h-4 w-4" />
        </Button>

        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => {
              setEditedName(connection.name);
              setIsEditing(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}

        <AlertDialog
          open={open}
          onOpenChange={(val) => !isDeleting && setOpen(val)}
        >
          <AlertDialogTrigger
            render={
              <Button variant="destructive">
                <Trash className="h-4 w-4" />
              </Button>
            }
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete {connection.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{connection.name}</strong>{" "}
                and its associated conversations. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => handleRemoveConnection(connection.id)}
              >
                {isDeleting && <Spinner />}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <BusinessRulesDialog
          open={isInstructionsOpen}
          onOpenChange={setIsInstructionsOpen}
          connection={connection}
        />
      </div>
    </div>
  );
}
