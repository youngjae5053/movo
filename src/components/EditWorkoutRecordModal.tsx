"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UpdateWorkoutRecordInput } from "@/lib/api/client";
import type { WorkoutRecord } from "@/lib/types";
import { getWorkoutRecordText } from "@/lib/utils";
import {
  BODY_PART_OPTIONS,
  DURATION_OPTIONS,
  isMediaOnlyPlaceholder,
  MOOD_OPTIONS,
  type MoodValue,
} from "@/lib/workout";

type EditWorkoutRecordModalProps = {
  isOpen: boolean;
  record: WorkoutRecord | null;
  onClose: () => void;
  onSave: (input: UpdateWorkoutRecordInput) => void;
};

function moodFromNote(note?: string): MoodValue | undefined {
  if (!note) return undefined;
  if (note.includes("최고")) return "great";
  if (note.includes("좋음")) return "good";
  if (note.includes("보통")) return "normal";
  if (note.includes("피곤")) return "tired";
  return undefined;
}

export function EditWorkoutRecordModal({
  isOpen,
  record,
  onClose,
  onSave,
}: EditWorkoutRecordModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodValue | undefined>();

  useEffect(() => {
    if (!isOpen || !record) return;

    setTitle(record.title ?? "");
    setContent(
      record.content && !isMediaOnlyPlaceholder(record.content)
        ? record.content
        : getWorkoutRecordText(record),
    );
    setDuration(record.duration);
    setBodyParts(record.exercises ?? []);
    setMood(moodFromNote(record.note));
  }, [isOpen, record]);

  if (!isOpen || !record) {
    return null;
  }

  function toggleBodyPart(part: string) {
    setBodyParts((prev) =>
      prev.includes(part)
        ? prev.filter((item) => item !== part)
        : [...prev, part],
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!record) return;

    const trimmed = content.trim();
    const hasMedia = Boolean(record.media?.length);

    if (!trimmed && !hasMedia && !title.trim()) {
      return;
    }

    onSave({
      title: title.trim() || undefined,
      content: trimmed || undefined,
      duration,
      bodyParts,
      mood,
    });
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

      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold tracking-tight">기록 수정</h2>
        <p className="mt-1 text-sm text-zinc-500">
          운동 내용과 태그를 편집하세요
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 (선택)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-500/40"
          />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            placeholder="운동 내용"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm leading-relaxed text-zinc-100 outline-none focus:border-emerald-500/40"
          />

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">운동 부위</p>
            <div className="flex flex-wrap gap-2">
              {BODY_PART_OPTIONS.map((part) => {
                const active = bodyParts.includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => toggleBodyPart(part)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-emerald-500 text-black"
                        : "border border-white/10 text-zinc-400 hover:border-emerald-500/30"
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">운동 시간</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    setDuration((prev) =>
                      prev === minutes ? undefined : minutes,
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    duration === minutes
                      ? "bg-emerald-500 text-black"
                      : "border border-white/10 text-zinc-400"
                  }`}
                >
                  {minutes}분
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">컨디션</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setMood((prev) =>
                      prev === option.value ? undefined : option.value,
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    mood === option.value
                      ? "bg-emerald-500 text-black"
                      : "border border-white/10 text-zinc-400"
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
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
