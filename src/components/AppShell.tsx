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
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
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
              <button
                type="button"
                onClick={handleLogout}
                aria-label="로그아웃"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
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
