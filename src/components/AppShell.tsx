"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
  showHeader?: boolean;
  title?: string;
  showBackButton?: boolean;
  backFallback?: string;
  showLogout?: boolean;
  mainClassName?: string;
};

export function AppShell({
  children,
  showHeader = true,
  title,
  showBackButton = false,
  backFallback = "/",
  showLogout = false,
  mainClassName,
}: AppShellProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backFallback);
  }

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      {showHeader && (
        <header className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#060608]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3 px-4 py-4">
            {showBackButton ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-emerald-500/40 hover:text-foreground"
                aria-label="뒤로 가기"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              {title ? (
                <h1 className="truncate text-lg font-semibold">{title}</h1>
              ) : (
                <Link href="/" className="inline-flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">
                    Movo
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                    Trainer
                  </span>
                </Link>
              )}
            </div>
            {showLogout ? (
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href="/settings"
                  aria-label="설정"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="로그아웃"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        </header>
      )}
      <main className={`flex-1 px-4 py-5 ${mainClassName ?? ""}`}>
        {children}
      </main>
    </div>
  );
}
