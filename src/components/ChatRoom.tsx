"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatBubble } from "@/components/ChatBubble";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import {
  ensureTrainerProfile,
  fetchMessages,
  markMessagesAsRead,
  sendTrainerMessage,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { getInitials } from "@/lib/utils";

type ChatRoomProps = {
  memberId: string;
  memberName: string;
};

export function ChatRoom({ memberId, memberName }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isInputReady, setIsInputReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const memberInitial = getInitials(memberName);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchMessages(supabase, memberId);
      setMessages(data);
      await markMessagesAsRead(supabase, memberId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "메시지를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  function resetInput() {
    setText("");
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
    }
  }

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const newMessage = await sendTrainerMessage(
        supabase,
        memberId,
        trainer.id,
        trimmed,
      );
      setMessages((prev) => [...prev, newMessage]);
      resetInput();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "메시지 전송에 실패했습니다.",
      );
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    if (event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    handleSubmit();
  }

  const canSend = text.trim().length > 0;

  return (
    <div className="flex min-h-[calc(100dvh-73px)] flex-col">
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-28">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted">불러오는 중...</div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              memberInitial={memberInitial}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-md">
        <form
          onSubmit={(event) => event.preventDefault()}
          autoComplete="off"
          className="mx-auto flex max-w-lg items-end gap-2 px-4 py-3"
        >
          <textarea
            ref={textareaRef}
            value={text}
            name={`chat-message-${memberId}`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            readOnly={!isInputReady}
            onFocus={() => setIsInputReady(true)}
            onChange={(event) => {
              setText(event.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!canSend}
            aria-label="메시지 전송"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
