"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
      <p className="mt-2 text-sm text-muted">
        {error.message || "일시적인 오류입니다. 잠시 후 다시 시도해 주세요."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400"
      >
        다시 시도
      </button>
    </div>
  );
}
