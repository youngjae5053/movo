"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EditWorkoutRecordModal } from "@/components/EditWorkoutRecordModal";
import { WorkoutRecordCard } from "@/components/WorkoutRecordCard";
import {
  createWorkoutRecord,
  deleteWorkoutRecord,
  ensureTrainerProfile,
  fetchWorkoutRecords,
  updateWorkoutRecord,
  type UpdateWorkoutRecordInput,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { WorkoutRecord } from "@/lib/types";
import {
  BODY_PART_OPTIONS,
  DURATION_OPTIONS,
  formatFileSize,
  MOOD_OPTIONS,
  type MoodValue,
} from "@/lib/workout";

const PLACEHOLDER =
  "오늘 하체 위주로 했고 스쿼트 80kg 3세트\n컨디션 좋았음. 다음엔 중량 올려볼 것";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 10;
const PAGE_SIZE = 20;

type AttachmentPreview = {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
};

type WorkoutRecordSectionProps = {
  memberId: string;
};

export function WorkoutRecordSection({ memberId }: WorkoutRecordSectionProps) {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodValue | undefined>();
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(
    null,
  );
  const [deletingRecord, setDeletingRecord] = useState<WorkoutRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<AttachmentPreview[]>([]);

  attachmentsRef.current = attachments;

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchWorkoutRecords(supabase, memberId, {
        limit: PAGE_SIZE,
        offset: 0,
      });
      setRecords(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "운동 기록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  async function loadMoreRecords() {
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchWorkoutRecords(supabase, memberId, {
        limit: PAGE_SIZE,
        offset: records.length,
      });
      setRecords((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "운동 기록을 더 불러오지 못했습니다.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) =>
        URL.revokeObjectURL(attachment.url),
      );
    };
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 128)}px`;
  }, []);

  function resetInput() {
    setTitle("");
    setText("");
    setDuration(undefined);
    setBodyParts([]);
    setMood(undefined);
    attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    setAttachments([]);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "128px";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function toggleBodyPart(part: string) {
    setBodyParts((prev) =>
      prev.includes(part)
        ? prev.filter((item) => item !== part)
        : [...prev, part],
    );
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_FILES - attachments.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`사진/영상은 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.`);
      event.target.value = "";
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    const rejected: string[] = [];

    const newAttachments = selected
      .filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          rejected.push(`${file.name} (${formatFileSize(file.size)})`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
      }));

    if (rejected.length > 0) {
      setErrorMessage(
        `50MB 이하 파일만 업로드할 수 있습니다: ${rejected.join(", ")}`,
      );
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    event.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((attachment) => attachment.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    setErrorMessage(null);
    setIsSaving(true);
    setUploadProgress(
      attachments.length > 0 ? "사진/영상 업로드 중..." : "저장 중...",
    );

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const newRecord = await createWorkoutRecord(
        supabase,
        memberId,
        trainer.id,
        {
          title: title.trim() || undefined,
          content: trimmed || undefined,
          duration,
          bodyParts,
          mood,
          files: attachments.map((item) => item.file),
        },
      );
      setRecords((prev) => [newRecord, ...prev]);
      resetInput();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "기록 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  }

  async function handleSaveEdit(input: UpdateWorkoutRecordInput) {
    if (!editingRecord) return;

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const updated = await updateWorkoutRecord(
        supabase,
        editingRecord.id,
        memberId,
        trainer.id,
        input,
      );
      setRecords((prev) =>
        prev.map((record) => (record.id === updated.id ? updated : record)),
      );
      setEditingRecord(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "기록 수정에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingRecord) return;

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await deleteWorkoutRecord(supabase, deletingRecord.id);
      setRecords((prev) =>
        prev.filter((record) => record.id !== deletingRecord.id),
      );
      setDeletingRecord(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "기록 삭제에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const canSend =
    (text.trim().length > 0 || attachments.length > 0) && !isSaving;

  return (
    <section>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Journal
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
            운동 기록
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            사진·영상과 함께 오늘의 수업을 남겨보세요
          </p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
          {records.length}개
        </span>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted">불러오는 중...</div>
      ) : records.length === 0 ? (
        <div className="mb-6 rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
          <p className="text-sm font-medium text-zinc-300">첫 운동 기록을 남겨보세요</p>
          <p className="mt-1 text-xs text-zinc-500">
            텍스트, 사진, 영상을 함께 저장할 수 있습니다
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {records.map((record) => (
            <li key={record.id}>
              <WorkoutRecordCard
                record={record}
                onEdit={setEditingRecord}
                onDelete={setDeletingRecord}
              />
            </li>
          ))}
        </ul>
      )}

      {hasMore && !isLoading ? (
        <div className="mb-6 mt-4 text-center">
          <button
            type="button"
            onClick={loadMoreRecords}
            disabled={isLoadingMore}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-60"
          >
            {isLoadingMore ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="relative mt-6 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-zinc-900/90 to-black/80 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

        <div className="rounded-[1.15rem] bg-black/20 p-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 (선택) · 예: PT 12회차"
            className="mb-3 w-full bg-transparent text-sm font-medium text-zinc-200 outline-none placeholder:text-zinc-600"
          />

          <div className="mb-3 flex flex-wrap gap-1.5">
            {BODY_PART_OPTIONS.map((part) => {
              const active = bodyParts.includes(part);
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => toggleBodyPart(part)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-emerald-500 text-black"
                      : "border border-white/[0.08] text-zinc-500 hover:border-emerald-500/30"
                  }`}
                >
                  {part}
                </button>
              );
            })}
          </div>

          {attachments.length > 0 ? (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >
                  {attachment.type === "video" ? (
                    <>
                      <video
                        src={attachment.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                          영상
                        </div>
                      </div>
                    </>
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
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label="첨부 파일 제거"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              adjustTextareaHeight();
            }}
            placeholder={PLACEHOLDER}
            rows={5}
            style={{ minHeight: "128px" }}
            className="w-full resize-none bg-transparent text-[15px] leading-[1.7] text-zinc-100 outline-none placeholder:whitespace-pre-line placeholder:text-zinc-600"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() =>
                  setDuration((prev) =>
                    prev === minutes ? undefined : minutes,
                  )
                }
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  duration === minutes
                    ? "bg-emerald-500 text-black"
                    : "border border-white/[0.08] text-zinc-500"
                }`}
              >
                {minutes}분
              </button>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setMood((prev) =>
                    prev === option.value ? undefined : option.value,
                  )
                }
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  mood === option.value
                    ? "bg-emerald-500 text-black"
                    : "border border-white/[0.08] text-zinc-500"
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
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
                aria-label="사진 또는 영상 첨부"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-500 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <span className="text-xs text-zinc-600">
                사진·영상 {attachments.length}/{MAX_FILES}
              </span>
            </div>

            <button
              type="submit"
              disabled={!canSend}
              aria-label="기록 저장"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>

          {uploadProgress ? (
            <p className="mt-2 text-center text-xs text-emerald-400/90">
              {uploadProgress}
            </p>
          ) : null}
        </div>
      </form>

      <EditWorkoutRecordModal
        isOpen={editingRecord !== null}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={deletingRecord !== null}
        title="기록을 삭제할까요?"
        description="삭제한 운동 기록과 첨부된 사진·영상은 복구할 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRecord(null)}
      />
    </section>
  );
}
