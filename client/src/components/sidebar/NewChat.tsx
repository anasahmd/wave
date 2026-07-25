import { SquarePen } from "lucide-react";
import { Button } from "../ui/button";
import { useChat } from "@/providers/ChatProvider";

export default function NewChat() {
  const { activeThreadId, setActiveThread } = useChat();
  return (
    <Button
      className={`mx-2 justify-start gap-2 text-xs ${activeThreadId ? "" : "bg-accent"}`}
      variant="ghost"
      onClick={() => setActiveThread("")}
    >
      <SquarePen />
      <span>New chat</span>
    </Button>
  );
}
