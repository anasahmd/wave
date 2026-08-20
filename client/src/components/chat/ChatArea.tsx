import InputBar from "@/components/chat/InputBar";
import MessageList from "./MessageList";
import { Waves } from "lucide-react";
import { Button } from "../ui/button";
import AddDatabaseDialog from "../dialogs/AddDatabaseDialog";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useConnection } from "@/providers/ConnectionProvider";

interface ChatAreaStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function ChatAreaState({
  icon,
  title,
  description,
  children,
}: ChatAreaStateProps) {
  return (
    <div className="mx-auto flex min-h-full flex-col items-center justify-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

export default function ChatArea() {
  const { activeConnectionId, switchingId, loading, connections } =
    useConnection();

  const [isAddDatabaseOpen, setIsAddDatabaseOpen] = useState(false);

  const targetConnection = connections.find(
    (c) => c.id === (switchingId || activeConnectionId)
  );

  if (loading && connections.length === 0) {
    return (
      <ChatAreaState
        icon={<Spinner className="size-6 text-primary" />}
        title="Fetching databases..."
        description="Loading your database connections."
      />
    );
  }

  if (switchingId || (loading && targetConnection)) {
    return (
      <ChatAreaState
        icon={<Spinner className="size-6 text-primary" />}
        title={`Connecting to ${targetConnection?.name || "database"}...`}
        description="Establishing connection and loading database schema."
      />
    );
  }

  if (!activeConnectionId) {
    return (
      <>
        <ChatAreaState
          icon={<Waves className="size-6" />}
          title="Connect to a database to get started"
        >
          <Button className="mt-4" onClick={() => setIsAddDatabaseOpen(true)}>
            Add database
          </Button>
        </ChatAreaState>
        <AddDatabaseDialog
          open={isAddDatabaseOpen}
          onOpenChange={setIsAddDatabaseOpen}
        />
      </>
    );
  }
  return (
    <div className="mx-auto flex h-screen w-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageList />
      </div>

      <div className="sticky bottom-0 mx-auto w-full max-w-3xl bg-background px-6">
        <InputBar />
        <p className="my-3 text-center text-xs">
          Wave is AI and can make mistakes.
        </p>
      </div>
    </div>
  );
}
