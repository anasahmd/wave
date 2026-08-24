import type { Message as MessageType } from "@/types";
import MarkDown from "react-markdown";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Bookmark, BookmarkCheck, BrainCircuit, ChevronRight } from "lucide-react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { useAppSelector } from "@/store";
import { api } from "@/services/apiClient";
import { toast } from "sonner";
import DataTableRenderer from "./DataTableRenderer";

export default function MessageItem({ message }: { message: MessageType }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { activeConnectionId } = useAppSelector((state) => state.connection);
  const chatMessages = useAppSelector((state) => state.chat.messages);

  const handleVerify = async () => {
    if (!message.query_used) return;

    // Find preceding user question
    const msgIndex = chatMessages.findIndex((m) => m.id === message.id);
    const userQuestion =
      msgIndex > 0 && chatMessages[msgIndex - 1]?.role === "user"
        ? chatMessages[msgIndex - 1].content
        : undefined;

    if (!activeConnectionId || !userQuestion) {
      toast.error("Unable to locate active connection or user question.");
      return;
    }

    try {
      setIsVerifying(true);
      await api.addPattern({
        connectionId: activeConnectionId,
        question: userQuestion,
        query: message.query_used,
      });
      setIsVerified(true);
      toast.success("Query saved as a ground-truth pattern!");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark pattern.");
    } finally {
      setIsVerifying(false);
    }
  };

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
            <MarkDown
              remarkPlugins={[remarkGfm]}
              components={{ table: DataTableRenderer }}
            >
              {message.content}
            </MarkDown>
          </BubbleContent>

          {message.patterns_used && message.patterns_used.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary w-fit">
              <BrainCircuit className="size-3.5 shrink-0 text-primary" />
              <span>
                Guided by pattern{message.patterns_used.length > 1 ? "s" : ""}:{" "}
                {message.patterns_used.map((p) => `"${p.question}"`).join(", ")}
              </span>
            </div>
          )}

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
                <div className="flex flex-col gap-2 pt-3 text-xs text-muted-foreground">
                  <div className="rounded border border-border/50 bg-muted/30 p-2 font-mono text-[11px] text-foreground">
                    {message.query_used}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleVerify}
                      disabled={isVerifying || isVerified}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        isVerified
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title="Save this query as a ground-truth pattern for future AI questions"
                    >
                      {isVerifying ? (
                        <Spinner className="size-3" />
                      ) : isVerified ? (
                        <>
                          <BookmarkCheck className="size-3 text-primary" />
                          Marked Pattern
                        </>
                      ) : (
                        <>
                          <Bookmark className="size-3" />
                          Mark as Pattern
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Bubble>
      </MessageContent>
    </Message>
  );
}
