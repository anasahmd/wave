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
import { useAppDispatch, useAppSelector } from "@/store";
import {
  removeConnection,
  updateConnectionName,
} from "@/slices/connectionSlice";

export default function DatabaseSection() {
  const { connections } = useAppSelector((state) => state.connection);
  return (
    <div className="overflow-y-auto px-4">
      <h3 className="mb-3 font-semibold">Databases</h3>
      <div>
        {connections.map((connection) => (
          <DatabaseItem key={connection.id} connection={connection} />
        ))}
      </div>
    </div>
  );
}

function DatabaseItem({ connection }: { connection: Connection }) {
  const dispatch = useAppDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(connection.name);

  const handleSubmit = () => {
    setIsEditing(false);
    const trimmed = editedName.trim();

    if (!trimmed || trimmed === connection.name) {
      setEditedName(connection.name);
      return;
    }

    dispatch(updateConnectionName({ id: connection.id, name: trimmed }));
  };

  const handleRemoveConnection = (id: string) => {
    dispatch(removeConnection(id));
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
            className="h-8 w-40 rounded-md focus-visible:ring-1"
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
              <AlertDialogTitle>Delete {connection.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{connection.name}</strong>{" "}
                and its associated conversations. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => handleRemoveConnection(connection.id)}
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
