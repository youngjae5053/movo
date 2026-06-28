"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDaysToDateString, getTodayDateString } from "@/lib/utils";

const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

type BookSessionModalProps = {
  isOpen: boolean;
  memberName: string;
  title?: string;
  submitLabel?: string;
  initialDate?: string;
  initialTime?: string;
  onClose: () => void;
  onBook: (data: { date: string; time: string }) => void | Promise<void>;
};

type FormState = {
  date: string;
  time: string;
};

export function BookSessionModal({
  isOpen,
  memberName,
  title = "수업 예약",
  submitLabel = "예약하기",
  initialDate,
  initialTime,
  onClose,
  onBook,
}: BookSessionModalProps) {
  const today = getTodayDateString();
  const maxDate = addDaysToDateString(today, 30);

  const [form, setForm] = useState<FormState>({
    date: initialDate ?? today,
    time: initialTime ?? "10:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        date: initialDate ?? today,
        time: initialTime ?? "10:00",
      });
    }
  }, [isOpen, today, initialDate, initialTime]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.date || !form.time) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onBook(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-border bg-surface-elevated p-6 sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{memberName} 회원</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">날짜</span>
            <input
              type="date"
              value={form.date}
              min={today}
              max={maxDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              className={inputClassName}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">시간</span>
            <select
              value={form.time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, time: event.target.value }))
              }
              className={inputClassName}
              required
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {isSubmitting ? "처리 중..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
