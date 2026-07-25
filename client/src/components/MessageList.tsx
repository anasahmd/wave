import { useEffect, useRef } from "react";
import MarkDown from "react-markdown";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useChat } from "@/providers/ChatProvider";

export default function MessageList() {
  const { messages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-full flex-col justify-end">
      {messages.map((message) => (
        <Message
          align={message.role === "user" ? "end" : "start"}
          className="my-10"
          key={message.id}
        >
          <MessageContent>
            <Bubble variant={message.role === "user" ? "default" : "ghost"}>
              <BubbleContent
                className={message.role === "assistant" ? "w-full" : ""}
              >
                <MarkDown>{message.content}</MarkDown>
              </BubbleContent>
              {/* {message.role === "assistant" && <span>{message.sql_query}</span>} */}
            </Bubble>
          </MessageContent>
        </Message>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
