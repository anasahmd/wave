import InputBar from "./InputBar";
import MessageList from "./MessageList";
import { ScrollArea } from "./ui/scroll-area";

export default function ChatArea() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col px-12 pt-12">
      <ScrollArea className="flex-1">
        <MessageList />
      </ScrollArea>
      <div className="sticky bottom-0 bg-background pb-6 pt-4">
        <InputBar />
      </div>
    </div>
  );
}
