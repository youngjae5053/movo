"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { completeTrainerOnboarding, ensureTrainerProfile } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await ensureTrainerProfile(supabase); // 레코드 없으면 먼저 생성
      await completeTrainerOnboarding(supabase, {
        name: name.trim(),
        centerName: centerName.trim(),
        phone: phone.trim() || undefined,
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "온보딩을 완료하지 못했습니다.",
      );
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">이름</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">센터/브랜드명</label>
        <input
          value={centerName}
          onChange={(event) => setCenterName(event.target.value)}
          placeholder="Movo PT Studio"
          className={inputClassName}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">연락처 (선택)</label>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={inputClassName}
        />
      </div>

      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isLoading ? "저장 중..." : "시작하기"}
      </button>
    </form>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm outline-none focus:border-emerald-500/50";
