"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  ensureTrainerProfile,
  fetchWorkoutTemplates,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { WorkoutTemplate } from "@/lib/types";

type TemplateSelection = {
  bodyParts?: string[];
  duration?: number;
  content?: string;
};

type WorkoutTemplateDrawerProps = {
  isOpen: boolean;
  currentBodyParts?: string[];
  currentDuration?: number;
  currentContent?: string;
  onSelect: (selection: TemplateSelection) => void;
  onClose: () => void;
};

export function WorkoutTemplateDrawer({
  isOpen,
  currentBodyParts,
  currentDuration,
  currentContent,
  onSelect,
  onClose,
}: WorkoutTemplateDrawerProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<WorkoutTemplate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchWorkoutTemplates(supabase);
      setTemplates(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "템플릿을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setShowNameInput(false);
      setNewTemplateName("");
      setErrorMessage(null);
    }
  }, [isOpen, loadTemplates]);

  async function handleSaveTemplate() {
    const name = newTemplateName.trim();
    if (!name) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      await createWorkoutTemplate(supabase, trainer.id, {
        name,
        bodyParts: currentBodyParts?.length ? currentBodyParts : undefined,
        duration: currentDuration,
        content: currentContent || undefined,
      });
      setNewTemplateName("");
      setShowNameInput(false);
      await loadTemplates();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "템플릿 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTemplate) return;

    try {
      const supabase = createBrowserSupabaseClient();
      await deleteWorkoutTemplate(supabase, deletingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      setDeletingTemplate(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "템플릿 삭제에 실패했습니다.",
      );
    }
  }

  if (!isOpen) return null;

  const hasCurrentData =
    (currentBodyParts && currentBodyParts.length > 0) ||
    currentDuration !== undefined ||
    (currentContent && currentContent.trim().length > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-3xl border-t border-white/[0.08] bg-zinc-950 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-base font-semibold text-zinc-100">운동 템플릿</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(80vh - 100px)" }}>
          {errorMessage ? (
            <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {errorMessage}
            </p>
          ) : null}

          {/* Save current as template */}
          {hasCurrentData ? (
            <div className="mb-4">
              {showNameInput ? (
                <div className="flex gap-2">
                  <input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="템플릿 이름"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTemplate();
                      if (e.key === "Escape") setShowNameInput(false);
                    }}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName.trim() || isSaving}
                    className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNameInput(false)}
                    className="rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-500"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNameInput(true)}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  현재 입력값을 새 템플릿으로 저장
                </button>
              )}
            </div>
          ) : null}

          {/* Template list */}
          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">불러오는 중...</p>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-zinc-400">저장된 템플릿이 없습니다</p>
              <p className="mt-1 text-xs text-zinc-600">
                자주 쓰는 운동 패턴을 템플릿으로 저장해보세요
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((template) => (
                <li key={template.id}>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect({
                          bodyParts: template.bodyParts,
                          duration: template.duration,
                          content: template.content,
                        });
                        onClose();
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-zinc-100">{template.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.bodyParts?.map((part) => (
                          <span
                            key={part}
                            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400"
                          >
                            {part}
                          </span>
                        ))}
                        {template.duration ? (
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                            {template.duration}분
                          </span>
                        ) : null}
                      </div>
                      {template.content ? (
                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {template.content}
                        </p>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTemplate(template)}
                      aria-label="템플릿 삭제"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-600 hover:text-red-400"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deletingTemplate !== null}
        title="템플릿을 삭제할까요?"
        description={`"${deletingTemplate?.name}" 템플릿이 영구적으로 삭제됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingTemplate(null)}
      />
    </>
  );
}
