"use client";

import { useState } from "react";
import { createMemberInvite, ensureTrainerProfile } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type MemberInviteButtonProps = {
  memberId: string;
};

export function MemberInviteButton({ memberId }: MemberInviteButtonProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateInvite() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const invite = await createMemberInvite(supabase, memberId, trainer.id);
      const url = `${window.location.origin}/invite/${invite.token}`;
      setInviteUrl(url);
      await navigator.clipboard.writeText(url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "초대 링크 생성에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">회원 앱 초대</p>
          <p className="mt-0.5 text-xs text-muted">
            링크를 공유하면 회원이 앱에 로그인할 수 있습니다
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateInvite}
          disabled={isLoading}
          className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
        >
          {isLoading ? "생성 중..." : "링크 생성"}
        </button>
      </div>
      {inviteUrl ? (
        <p className="mt-2 break-all text-xs text-emerald-400">
          링크가 복사되었습니다: {inviteUrl}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      ) : null}
    </div>
  );
}
