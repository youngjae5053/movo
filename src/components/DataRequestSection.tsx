"use client";

import { FormEvent, useState } from "react";
import { createDataRequest } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type DataRequestSectionProps = {
  role: "trainer" | "member";
};

export function DataRequestSection({ role }: DataRequestSectionProps) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitRequest(requestType: "export" | "deletion") {
    setIsLoading(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await createDataRequest(supabase, {
        requestType,
        requesterRole: role,
        notes,
      });
      setMessage(
        requestType === "export"
          ? "데이터보내기 요청이 접수되었습니다. 7영업일 내 처리됩니다."
          : "데이터 삭제 요청이 접수되었습니다. 검토 후 연락드립니다.",
      );
      setNotes("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "요청 접수에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent, type: "export" | "deletion") {
    event.preventDefault();
    submitRequest(type);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5">
      <h2 className="text-lg font-semibold">개인정보 요청</h2>
      <p className="mt-1 text-sm text-muted">
        데이터보내기 또는 삭제를 요청할 수 있습니다. 보관 기간은 계약 종료 후
        3년이며, 법령에 따라 일부 정보는 추가 보관될 수 있습니다.
      </p>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="요청 사유 (선택)"
        rows={3}
        className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-emerald-500/50"
      />

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-emerald-400">{message}</p> : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={(event) => handleSubmit(event, "export")}
          className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:border-emerald-500/40"
        >
          데이터보내기
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={(event) => handleSubmit(event, "deletion")}
          className="flex-1 rounded-xl border border-red-500/30 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          데이터 삭제 요청
        </button>
      </div>
    </section>
  );
}
