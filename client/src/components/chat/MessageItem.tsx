import type { Message as MessageType } from "@/types";
import MarkDown from "react-markdown";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronRight } from "lucide-react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Spinner } from "../ui/spinner";

export default function MessageItem({ message }: { message: MessageType }) {
  if (message.role === "user") {
    return (
      <Message align="end" className="mt-6">
        <MessageContent>
          <Bubble variant="default">
            <BubbleContent className="overflow-auto">
              {message.content}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  // Assistant message pending state
  if (!message.content) {
    return (
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent className="shimmer">Generating response…</MarkerContent>
      </Marker>
    );
  }

  // Assistant message content
  return (
    <Message align="start">
      <MessageContent>
        <Bubble variant="ghost" className="w-full">
          <BubbleContent
            className={cn(
              "w-full",
              "prose prose-sm max-w-none dark:prose-invert",
              "prose-p:my-1.5 prose-p:leading-relaxed",
              "prose-pre:my-2 prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground",
              "prose-code:rounded prose-code:border prose-code:border-border prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
              "prose-ol:my-2 prose-ul:my-2 prose-li:my-0.5",
              "prose-table:my-3 prose-table:w-full prose-th:border prose-th:border-border prose-th:bg-muted/60 prose-th:px-3 prose-th:py-2 prose-th:text-sm prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-sm",
              "overflow-auto"
            )}
          >
            <MarkDown remarkPlugins={[remarkGfm]}>{message.content}</MarkDown>
          </BubbleContent>
          {message.query_used && (
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
  );
}
