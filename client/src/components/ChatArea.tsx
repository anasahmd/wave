import InputBar from "./InputBar";
import MessageList from "./MessageList";
import { ScrollArea } from "./ui/scroll-area";

export default function ChatArea() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col px-12 pt-12">
      <ScrollArea className="min-h-0 flex-1">
        <MessageList />
      </ScrollArea>
      <div className="sticky bottom-0 bg-background pt-4 pb-6">
        <InputBar />
      </div>
    </div>
  );
}
