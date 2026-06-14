"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { fetchChatPreviews } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";
import { formatChatListTime, getInitials } from "@/lib/utils";

type ChatPreview = {
  member: Member;
  preview: string;
  time?: string;
  unreadCount: number;
};

export function ChatListSection() {
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPreviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const previews = await fetchChatPreviews(supabase);
      setChatPreviews(previews);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "채팅 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  const totalUnread = chatPreviews.reduce(
    (sum, preview) => sum + preview.unreadCount,
    0,
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>
    );
  }

  return (
    <>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <section className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">채팅</h1>
        <p className="mt-1.5 text-sm text-muted">
          {totalUnread > 0
            ? `읽지 않은 메시지 ${totalUnread}건`
            : `회원과의 대화 ${chatPreviews.length}명`}
        </p>
      </section>

      {chatPreviews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
          아직 대화가 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated/50">
          {chatPreviews.map(({ member, preview, time, unreadCount }) => (
            <li key={member.id}>
              <Link
                href={`/members/${member.id}/chat`}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-white/[0.03] hover:bg-white/[0.02]"
              >
                <div className="relative shrink-0">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 text-lg font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
                    {getInitials(member.name)}
                  </div>
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`truncate text-[15px] ${unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-zinc-200"}`}
                    >
                      {member.name}
                    </p>
                    {time ? (
                      <span
                        className={`shrink-0 text-[11px] ${unreadCount > 0 ? "font-medium text-emerald-400" : "text-zinc-500"}`}
                      >
                        {formatChatListTime(time)}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={`mt-0.5 truncate text-sm ${unreadCount > 0 ? "font-medium text-zinc-300" : "text-muted"}`}
                  >
                    {preview}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
