import type { ChatMessage } from "@/lib/types";
import { formatChatTime } from "@/lib/utils";

type ChatBubbleProps = {
  message: ChatMessage;
  memberInitial: string;
};

export function ChatBubble({ message, memberInitial }: ChatBubbleProps) {
  const isTrainer = message.sender === "trainer";

  return (
    <div
      className={`flex items-end gap-2 ${isTrainer ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isTrainer ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
          {memberInitial}
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div
        className={`flex max-w-[75%] flex-col gap-1 ${isTrainer ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isTrainer
              ? "rounded-br-md bg-emerald-500 text-black"
              : "rounded-bl-md bg-zinc-800 text-zinc-100"
          }`}
        >
          {message.content}
        </div>
        <time className="px-1 text-[11px] text-zinc-500">
          {formatChatTime(message.sentAt)}
        </time>
      </div>
    </div>
  );
}
