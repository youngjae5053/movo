"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("비밀번호가 변경되었습니다. 로그인해 주세요.");
    router.push("/login");
  }

  return (
    <AppShell showHeader={false}>
      <div className="mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold">새 비밀번호 설정</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none"
            required
          />
          {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </AppShell>
  );
}
