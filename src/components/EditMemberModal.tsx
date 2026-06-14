"use client";

import { FormEvent, useEffect, useState } from "react";
import { getStatusLabel } from "@/lib/status";
import type { Member, MemberStatus } from "@/lib/types";

type EditMemberModalProps = {
  isOpen: boolean;
  member: Member;
  onClose: () => void;
  onSave: (
    data: Pick<Member, "name" | "age" | "phone" | "goal" | "status">,
  ) => void;
};

type FormState = {
  name: string;
  age: string;
  phone: string;
  goal: string;
  status: MemberStatus;
};

const STATUS_OPTIONS: MemberStatus[] = ["active", "paused", "inactive"];

export function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSave,
}: EditMemberModalProps) {
  const [form, setForm] = useState<FormState>({
    name: member.name,
    age: String(member.age),
    phone: member.phone,
    goal: member.goal,
    status: member.status,
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: member.name,
        age: String(member.age),
        phone: member.phone,
        goal: member.goal,
        status: member.status,
      });
    }
  }, [isOpen, member]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const age = Number(form.age);
    if (!form.name.trim() || !form.phone.trim() || !form.goal.trim() || !age) {
      return;
    }

    onSave({
      name: form.name.trim(),
      age,
      phone: form.phone.trim(),
      goal: form.goal.trim(),
      status: form.status,
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

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-border bg-surface-elevated p-6 sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold">회원 정보 수정</h2>
        <p className="mt-1 text-sm text-muted">{member.name} 회원</p>

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

          <FormField label="상태">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as MemberStatus,
                }))
              }
              className={inputClassName}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
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
              저장
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
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
