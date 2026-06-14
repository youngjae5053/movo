"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Member } from "@/lib/types";

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<Member, "id" | "email" | "status" | "joinedAt" | "lastWorkoutAt" | "workoutRecords">) => void;
};

type FormState = {
  name: string;
  age: string;
  phone: string;
  goal: string;
};

const initialFormState: FormState = {
  name: "",
  age: "",
  phone: "",
  goal: "",
};

export function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialFormState);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const age = Number(form.age);
    if (!form.name.trim() || !form.phone.trim() || !form.goal.trim() || !age) {
      return;
    }

    onAdd({
      name: form.name.trim(),
      age,
      phone: form.phone.trim(),
      goal: form.goal.trim(),
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-border bg-surface-elevated p-6 sm:rounded-3xl sm:mx-4">
        <h2 className="text-lg font-semibold">새 회원 추가</h2>
        <p className="mt-1 text-sm text-muted">기본 정보를 입력해 주세요.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormField label="이름">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="홍길동"
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="나이">
            <input
              type="number"
              min={1}
              max={120}
              value={form.age}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, age: event.target.value }))
              }
              placeholder="28"
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="연락처">
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="010-1234-5678"
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="목표">
            <input
              value={form.goal}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, goal: event.target.value }))
              }
              placeholder="체지방 감량"
              className={inputClassName}
              required
            />
          </FormField>

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
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
