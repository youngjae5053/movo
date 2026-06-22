"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessage("비밀번호 재설정 링크를 이메일로 보냈습니다.");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          가입 이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none focus:border-emerald-500/50"
          required
        />
      </div>

      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isLoading ? "전송 중..." : "재설정 링크 보내기"}
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-emerald-400 hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}
