import { Button } from "@base-ui/react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import { useChat } from "@/providers/ChatProvider";
import { Spinner } from "@/components/ui/spinner";

export default function InputBar() {
  const [message, setMessage] = useState("");
  const { sendMessage, status } = useChat();

  const isPending = status === "sending" || status === "loading";
  const isDisabled = isPending || !message.trim();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDisabled) {
      sendMessage(message);
      setMessage("");
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isDisabled) {
        formRef.current!.requestSubmit();
      }
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex w-full items-center rounded-2xl border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-muted"
    >
      <Textarea
        placeholder="Ask anything or generate SQL..."
        className="my-auto w-full resize-none border-0 bg-transparent py-5 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        rows={1}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        type="submit"
        className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isDisabled}
      >
        {isPending ? <Spinner /> : <ArrowUp className="size-5" />}
      </Button>
    </form>
  );
}
