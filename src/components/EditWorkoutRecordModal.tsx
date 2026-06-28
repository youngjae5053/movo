"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { UpdateWorkoutRecordInput } from "@/lib/api/client";
import type { WorkoutRecord, WorkoutMedia } from "@/lib/types";
import { getWorkoutRecordText } from "@/lib/utils";
import {
  BODY_PART_OPTIONS,
  DURATION_OPTIONS,
  formatFileSize,
  isMediaOnlyPlaceholder,
  MOOD_OPTIONS,
  type MoodValue,
} from "@/lib/workout";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 10;

type NewAttachment = {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
};

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
  const [existingMedia, setExistingMedia] = useState<WorkoutMedia[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<NewAttachment[]>([]);

  attachmentsRef.current = newAttachments;

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
    setExistingMedia(record.media ?? []);
    setRemoveMediaIds([]);
    setNewAttachments([]);
  }, [isOpen, record]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) =>
        URL.revokeObjectURL(attachment.url),
      );
    };
  }, []);

  if (!isOpen || !record) {
    return null;
  }

  const visibleExisting = existingMedia.filter(
    (item) => !removeMediaIds.includes(item.id),
  );
  const totalMediaCount = visibleExisting.length + newAttachments.length;

  function toggleBodyPart(part: string) {
    setBodyParts((prev) =>
      prev.includes(part)
        ? prev.filter((item) => item !== part)
        : [...prev, part],
    );
  }

  function removeExistingMedia(id: string) {
    setRemoveMediaIds((prev) => [...prev, id]);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_FILES - totalMediaCount;
    if (remainingSlots <= 0) {
      event.target.value = "";
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    const added = selected
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
      }));

    setNewAttachments((prev) => [...prev, ...added]);
    event.target.value = "";
  }

  function removeNewAttachment(id: string) {
    setNewAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!record) return;

    const trimmed = content.trim();

    if (!trimmed && totalMediaCount === 0 && !title.trim()) {
      return;
    }

    onSave({
      title: title.trim() || undefined,
      content: trimmed || undefined,
      duration,
      bodyParts,
      mood,
      files: newAttachments.map((item) => item.file),
      removeMediaIds: removeMediaIds.length ? removeMediaIds : undefined,
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
          운동 내용, 태그, 사진·영상을 편집하세요
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 (선택)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-500/40"
          />

          {totalMediaCount > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleExisting.map((item) => (
                <div
                  key={item.id}
                  className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.fileName ?? "첨부"}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(item.id)}
                    aria-label="첨부 제거"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {newAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >
                  {attachment.type === "video" ? (
                    <video
                      src={attachment.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachment.url}
                      alt={attachment.file.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewAttachment(attachment.id)}
                    aria-label="첨부 제거"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400"
            >
              사진·영상 추가 ({totalMediaCount}/{MAX_FILES})
            </button>
            <span className="text-xs text-zinc-600">
              최대 {formatFileSize(MAX_FILE_SIZE)}
            </span>
          </div>

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
