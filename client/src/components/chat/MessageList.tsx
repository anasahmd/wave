import { useChat } from "@/providers/ChatProvider";

import { Waves } from "lucide-react";

import { Spinner } from "../ui/spinner";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { messages, status, activeThreadId } = useChat();

  const isPending = status === "sending";

  if (status === "loading") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

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
    <MessageScrollerProvider key={activeThreadId} defaultScrollPosition="last-anchor">
      <MessageScroller className="flex-1">
        <MessageScrollerViewport className="py-10">
          <MessageScrollerContent className="mx-auto max-w-2xl">
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <MessageItem message={message} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
