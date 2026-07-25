import { Button } from "@base-ui/react";
import { Textarea } from "./ui/textarea";
import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "@/services/apiClient";
import { useConnection } from "@/providers/ConnectionProvider";
import { useChat } from "@/providers/ChatProvider";

export default function InputBar() {
  const [message, setMessage] = useState("");
  const { activeConnection } = useConnection();
  const { activeThreadId, addMessage, addThread } = useChat();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeConnection) {
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        sql_query: null,
        content: message,
        created_at: new Date().toISOString(),
      });
      setMessage("");
      try {
        const response = await api.chat({
          message,
          connectionId: activeConnection.id,
          threadId: activeThreadId,
        });

        addMessage(response.message);
        if (!activeThreadId) {
          addThread(response.thread);
        }
      } catch {
        // error toasted by interceptor
      }
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current!.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex w-full items-center rounded-2xl border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-accent"
    >
      {/* <textarea
          ref={inputRef}
          id="chat-input"
          className="chat-input"
          placeholder={
            hasPending
              ? "Review the SQL above first..."
              : isConnected
                ? "Ask about your data..."
                : "Connect a database first..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!isConnected || isLoading || hasPending}
          rows={1}
        /> */}
      <Textarea
        placeholder="Ask anything or generate SQL..."
        className="my-auto w-full resize-none border-0 bg-transparent py-5 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        rows={1}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {/* <button
          id="send-btn"
          type="submit"
          className="send-btn"
          disabled={!isConnected || isLoading || !input.trim() || hasPending}
        >
          <Send size={16} />
        </button> */}
      <Button
        type="submit"
        className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
      >
        <ArrowUp className="size-5" />
      </Button>
    </form>
  );
}
