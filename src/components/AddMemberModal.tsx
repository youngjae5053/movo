"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Member } from "@/lib/types";

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    member: Omit<
      Member,
      "id" | "status" | "joinedAt" | "lastWorkoutAt" | "workoutRecords"
    > & {
      privacyConsent: boolean;
      termsConsent: boolean;
    },
  ) => void;
};

type FormState = {
  name: string;
  email: string;
  age: string;
  phone: string;
  goal: string;
  privacyConsent: boolean;
  termsConsent: boolean;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  age: "",
  phone: "",
  goal: "",
  privacyConsent: false,
  termsConsent: false,
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
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.goal.trim() ||
      !age ||
      !form.privacyConsent ||
      !form.termsConsent
    ) {
      return;
    }

    onAdd({
      name: form.name.trim(),
      email: form.email.trim() || "",
      age,
      phone: form.phone.trim(),
      goal: form.goal.trim(),
      privacyConsent: form.privacyConsent,
      termsConsent: form.termsConsent,
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

      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface-elevated p-6 sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold">새 회원 추가</h2>
        <p className="mt-1 text-sm text-muted">기본 정보와 개인정보 동의를 입력해 주세요.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormField label="이름">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="이메일 (선택, 앱 초대용)">
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className={inputClassName}
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
              className={inputClassName}
              required
            />
          </FormField>

          <div className="space-y-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={form.privacyConsent}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    privacyConsent: event.target.checked,
                  }))
                }
                className="mt-1"
                required
              />
              <span>개인정보 수집·이용에 동의합니다 (필수)</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={form.termsConsent}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    termsConsent: event.target.checked,
                  }))
                }
                className="mt-1"
                required
              />
              <span>서비스 이용약관에 동의합니다 (필수)</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black"
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
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
