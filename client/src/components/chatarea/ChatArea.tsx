import InputBar from "@/components/chatarea/InputBar";
import MessageList from "./MessageList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/store";
import { Waves } from "lucide-react";
import { Button } from "../ui/button";
import AddDatabaseDialog from "../AddDatabaseDialog";
import { useState } from "react";

export default function ChatArea() {
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  const [isAddDatabaseOpen, setIsAddDatabaseOpen] = useState(false);

  if (!activeConnectionId) {
    return (
      <div className="mx-auto flex min-h-full flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Waves className="size-6" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Connect to a database to get started
          </h2>
          <Button className="mt-4" onClick={() => setIsAddDatabaseOpen(true)}>
            Add database
          </Button>
        </div>
        <AddDatabaseDialog
          open={isAddDatabaseOpen}
          onOpenChange={setIsAddDatabaseOpen}
        />
      </div>
    );
  }
  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col px-12 pt-12">
      <ScrollArea className="min-h-0 flex-1">
        <MessageList />
      </ScrollArea>
      <div className="sticky bottom-0 bg-background pt-4">
        <InputBar />
        <p className="my-3 text-center text-xs">
          Wave is AI and can make mistakes.
        </p>
      </div>
    </div>
  );
}
