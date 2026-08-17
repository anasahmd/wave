import { useEffect, useRef } from "react";
import MarkDown from "react-markdown";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useChat } from "@/providers/ChatProvider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronRight, Waves } from "lucide-react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Spinner } from "../ui/spinner";

export default function MessageList() {
  const { messages, status } = useChat();

  const isPending = status === "sending";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isPending) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Waves className="size-6" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            What do you want to know?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask questions about your data in plain English.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-end">
      {messages.map((message) => (
        <Message
          align={message.role === "user" ? "end" : "start"}
          className="my-7"
          key={message.id}
        >
          <MessageContent>
            <Bubble
              variant={message.role === "user" ? "default" : "ghost"}
              className={message.role === "assistant" ? "w-full" : ""}
            >
              <BubbleContent
                className={cn(
                  message.role === "assistant" ? "w-full" : "",
                  "markdown-content overflow-auto"
                )}
              >
                <MarkDown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </MarkDown>
              </BubbleContent>
              {message.role === "assistant" && message.query_used && (
                <Collapsible className="ml-0.5">
                  <CollapsibleTrigger className="group mt-2 flex cursor-pointer items-center justify-between gap-1 text-xs">
                    <span>Query used</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-90"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="pt-3 text-xs text-muted-foreground">
                      {message.query_used}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </Bubble>
          </MessageContent>
        </Message>
      ))}
      {isPending && (
        <Message className="my-7">
          <Bubble variant="ghost">
            <BubbleContent className="w-full">
              <Marker role="status">
                <MarkerIcon>
                  <Spinner />
                </MarkerIcon>
                <MarkerContent className="shimmer">
                  Generating response…
                </MarkerContent>
              </Marker>
            </BubbleContent>
          </Bubble>
        </Message>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
