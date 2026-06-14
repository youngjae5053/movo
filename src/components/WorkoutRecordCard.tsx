"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkoutRecord } from "@/lib/types";
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
  const menuRef = useRef<HTMLDivElement>(null);

  const dateParts = formatWorkoutDateParts(record.date);

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
    <article className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-emerald-950/30 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />

      <div ref={menuRef} className="absolute right-3 top-3 z-10">
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
          <div className="absolute right-0 top-full mt-1 min-w-[132px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit(record);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.05]"
            >
              수정하기
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(record);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-white/[0.05]"
            >
              삭제하기
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative flex gap-4 pr-6">
        <div className="shrink-0 text-center">
          <p className="text-[2rem] font-extralight leading-none tracking-tight text-white">
            {dateParts.day}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            {dateParts.weekday}
          </p>
        </div>

        <div className="min-w-0 flex-1 border-l border-white/[0.06] pl-4">
          <p className="text-xs font-medium tracking-wide text-emerald-400/90">
            {dateParts.monthYear}
          </p>

          {!record.content && record.title ? (
            <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-100">
              {record.title}
            </h3>
          ) : null}

          {record.content ? (
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.65] text-zinc-300/95">
              {record.content}
            </p>
          ) : record.note ? (
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.65] text-zinc-300/95">
              {record.note}
            </p>
          ) : null}

          {!record.content && record.exercises && record.exercises.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {record.exercises.map((exercise) => (
                <li
                  key={exercise}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400"
                >
                  {exercise}
                </li>
              ))}
            </ul>
          ) : null}

          {record.duration != null ? (
            <p className="mt-3 text-xs text-zinc-500">{record.duration}분</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
