"use client";

import { useEffect, useRef, useState } from "react";
import { MediaViewerModal } from "@/components/MediaViewerModal";
import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery";
import type { WorkoutRecord } from "@/lib/types";
import { formatWorkoutTime, isMediaOnlyPlaceholder } from "@/lib/workout";
import { formatWorkoutDateParts } from "@/lib/utils";

type WorkoutRecordCardProps = {
  record: WorkoutRecord;
  onEdit: (record: WorkoutRecord) => void;
  onDelete: (record: WorkoutRecord) => void;
};

export function WorkoutRecordCard({
  record,
  onEdit,
  onDelete,
}: WorkoutRecordCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dateParts = formatWorkoutDateParts(record.date);
  const timeLabel = formatWorkoutTime(record.createdAt);
  const media = record.media ?? [];
  const showContent =
    record.content && !isMediaOnlyPlaceholder(record.content);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <article className="relative rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-emerald-950/30 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />

        <div ref={menuRef} className="absolute right-3 top-3 z-30">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="더보기"
            aria-expanded={isMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(record);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.05]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                수정하기
              </button>
              <div className="mx-3 border-t border-white/[0.06]" />
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(record);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
                삭제하기
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative flex gap-4 pr-8">
          <div className="shrink-0 text-center">
            <p className="text-[2rem] font-extralight leading-none tracking-tight text-white">
              {dateParts.day}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {dateParts.weekday}
            </p>
          </div>

          <div className="min-w-0 flex-1 border-l border-white/[0.06] pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium tracking-wide text-emerald-400/90">
                {dateParts.monthYear}
              </p>
              {timeLabel ? (
                <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-500">
                  {timeLabel}
                </span>
              ) : null}
              {record.duration != null ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {record.duration}분
                </span>
              ) : null}
            </div>

            {record.title ? (
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-zinc-100">
                {record.title}
              </h3>
            ) : null}

            {record.exercises && record.exercises.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {record.exercises.map((exercise) => (
                  <li
                    key={exercise}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"
                  >
                    {exercise}
                  </li>
                ))}
              </ul>
            ) : null}

            {showContent ? (
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.65] text-zinc-300/95">
                {record.content}
              </p>
            ) : null}

            {record.note ? (
              <p className="mt-2 text-xs text-zinc-500">{record.note}</p>
            ) : null}

            {media.length > 0 ? (
              <WorkoutMediaGallery
                media={media.slice(0, 4)}
                hiddenCount={Math.max(0, media.length - 4)}
                onOpen={(index) => {
                  setViewerIndex(index);
                  setIsViewerOpen(true);
                }}
              />
            ) : null}
          </div>
        </div>
      </article>

      <MediaViewerModal
        media={media}
        initialIndex={viewerIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
