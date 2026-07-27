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
import { ChevronRight } from "lucide-react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export default function MessageList() {
  const { messages, status } = useChat();

  const isPending = status === "sending" || status === "loading";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-full flex-col justify-end">
      {messages.map((message) => (
        <Message
          align={message.role === "user" ? "end" : "start"}
          className="my-7"
          key={message.id}
        >
          <MessageContent>
            <Bubble variant={message.role === "user" ? "default" : "ghost"}>
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
              {message.role === "assistant" && message.sql_query && (
                <Collapsible className="ml-0.5">
                  <CollapsibleTrigger className="group mt-2 flex cursor-pointer items-center justify-between gap-1 text-xs">
                    <span>SQL used</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-90"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="pt-3 text-xs text-muted-foreground">
                      {message.sql_query}
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
              <div className="flex items-center gap-1 py-1">
                <span
                  className="size-2 rounded-full bg-muted-foreground"
                  style={{
                    animation: "bounce-dot 1.4s infinite ease-in-out both",
                    animationDelay: "0s",
                  }}
                />
                <span
                  className="size-2 rounded-full bg-muted-foreground"
                  style={{
                    animation: "bounce-dot 1.4s infinite ease-in-out both",
                    animationDelay: "0.16s",
                  }}
                />
                <span
                  className="size-2 rounded-full bg-muted-foreground"
                  style={{
                    animation: "bounce-dot 1.4s infinite ease-in-out both",
                    animationDelay: "0.32s",
                  }}
                />
              </div>
            </BubbleContent>
          </Bubble>
        </Message>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
