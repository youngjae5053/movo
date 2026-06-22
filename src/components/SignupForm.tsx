"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ensureTrainerProfile } from "@/lib/api/client";
import { getPostLoginPath, resolveUserProfile } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage("이용약관과 개인정보처리방침에 동의해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "trainer" },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      await ensureTrainerProfile(supabase);
      const profile = await resolveUserProfile(supabase, data.user.id);
      setSuccessMessage(
        "가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.",
      );
      router.push(getPostLoginPath(profile));
      router.refresh();
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          이름
        </label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
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
            에 동의합니다 (필수)
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
            에 동의합니다 (필수)
          </span>
        </label>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-400">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-emerald-400">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isLoading ? "가입 중..." : "트레이너 가입"}
      </button>

      <p className="text-center text-sm text-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
