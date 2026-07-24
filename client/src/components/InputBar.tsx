import { Button } from "@base-ui/react";
import { Textarea } from "./ui/textarea";
import { ArrowUp } from "lucide-react";

export default function InputBar() {
  return (
    <form className="relative flex w-full items-center rounded-2xl border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-accent">
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
        className="my-auto w-full resize-none border-0 bg-transparent p-2 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        rows={1}
      />
      {/* <button
          id="send-btn"
          type="submit"
          className="send-btn"
          disabled={!isConnected || isLoading || !input.trim() || hasPending}
        >
          <Send size={16} />
        </button> */}
      <Button className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ArrowUp className="size-5" />
      </Button>
    </form>
  );
}
