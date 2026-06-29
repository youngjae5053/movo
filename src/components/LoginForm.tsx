"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ensureTrainerProfile } from "@/lib/api/client";
import { getPostLoginPath, resolveUserProfile } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("사용자 정보를 확인하지 못했습니다.");
      }

      let profile = await resolveUserProfile(supabase, user.id);

      // 회원(invite 경로)이 아닌 경우, 트레이너 레코드가 없으면 생성
      if (profile.role !== "member") {
        await ensureTrainerProfile(supabase);
        profile = await resolveUserProfile(supabase, user.id);
      }

      router.push(getPostLoginPath(profile));
      router.refresh();
    } catch (profileError) {
      setErrorMessage(
        profileError instanceof Error
          ? profileError.message
          : "로그인 후 프로필을 확인하지 못했습니다.",
      );
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="trainer@example.com"
          className={inputClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
          className={inputClassName}
          required
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-400">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/signup" className="text-emerald-400 hover:underline">
          트레이너 회원가입
        </Link>
        <Link href="/forgot-password" className="text-muted hover:text-foreground">
          비밀번호 찾기
        </Link>
      </div>
    </form>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
