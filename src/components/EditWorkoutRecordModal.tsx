"use client";

import { FormEvent, useEffect, useState } from "react";

type EditWorkoutRecordModalProps = {
  isOpen: boolean;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
};

export function EditWorkoutRecordModal({
  isOpen,
  initialContent,
  onClose,
  onSave,
}: EditWorkoutRecordModalProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    onSave(trimmed);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold tracking-tight">기록 수정</h2>
        <p className="mt-1 text-sm text-zinc-500">운동 내용을 편집하세요</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm leading-relaxed text-zinc-100 outline-none transition-colors focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            required
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
