"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { redeemMemberInvite } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type InviteAcceptFormProps = {
  token: string;
};

export function InviteAcceptForm({ token }: InviteAcceptFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage("약관 및 개인정보 처리방침에 동의해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await redeemMemberInvite(supabase, token, password);
      router.push("/member");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "초대 수락에 실패했습니다.",
      );
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">비밀번호 설정</label>
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none focus:border-emerald-500/50"
          required
        />
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4 text-sm">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1"
          />
          <span>
            <Link href="/terms" className="text-emerald-400 hover:underline">
              이용약관
            </Link>
            에 동의합니다
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(event) => setAcceptedPrivacy(event.target.checked)}
            className="mt-1"
          />
          <span>
            <Link href="/privacy" className="text-emerald-400 hover:underline">
              개인정보처리방침
            </Link>
            에 동의합니다
          </span>
        </label>
      </div>

      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isLoading ? "가입 중..." : "회원 앱 시작하기"}
      </button>
    </form>
  );
}
