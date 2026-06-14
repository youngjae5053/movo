"use client";

import Link from "next/link";

const AUTH_ERROR_PATTERN = /로그인/;

type AuthErrorBannerProps = {
  message: string;
};

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  const isAuthError = AUTH_ERROR_PATTERN.test(message);

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <p className="min-w-0 flex-1">{message}</p>
      {isAuthError ? (
        <Link
          href="/login"
          className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/30"
        >
          로그인하기
        </Link>
      ) : null}
    </div>
  );
}
