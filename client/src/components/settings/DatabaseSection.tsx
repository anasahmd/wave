import { useConnection } from "@/providers/ConnectionProvider";
import { Button } from "../ui/button";
import { useState } from "react";
import { Edit, Trash, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
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
import type { Connection } from "@/types";

export default function DatabaseSection() {
  const { connections } = useConnection();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h3 className="mt-2 mb-6 font-semibold">Databases</h3>
      <div className="flex-1 overflow-y-auto pr-2">
        {connections.map((connection) => (
          <DatabaseItem key={connection.id} connection={connection} />
        ))}
      </div>
    </div>
  );
}

function DatabaseItem({ connection }: { connection: Connection }) {
  const { updateConnectionName, removeConnection } = useConnection();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(connection.name);

  const handleSubmit = () => {
    setIsEditing(false);
    const trimmed = editedName.trim();

    if (!trimmed || trimmed === connection.name) {
      setEditedName(connection.name);
      return;
    }

    updateConnectionName(connection.id, trimmed);
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
    <div className="flex items-center justify-between border-b py-3">
      <div className="flex items-center gap-4">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            autoFocus
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="h-8 w-40"
          />
        ) : (
          <span>{connection.name}</span>
        )}
        <span className="rounded-full border-2 border-accent px-2 py-1 text-xs">
          {connection.db_type}
        </span>
      </div>
      <div className="flex gap-4">
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit />
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive">
                <Trash />
              </Button>
            }
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete database?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this database connection and
                associated conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => removeConnection(connection.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
