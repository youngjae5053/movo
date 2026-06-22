"use client";

import { useRouter } from "next/navigation";
import { DataRequestSection } from "@/components/DataRequestSection";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type SettingsSectionProps = {
  role: "trainer" | "member";
};

export function SettingsSection({ role }: SettingsSectionProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">계정</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl border border-border py-3 text-sm font-medium text-red-400"
        >
          로그아웃
        </button>
      </section>

      <DataRequestSection role={role} />
    </div>
  );
}
