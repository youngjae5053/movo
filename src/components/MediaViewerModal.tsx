"use client";

import { useEffect, useState } from "react";
import type { WorkoutMedia } from "@/lib/types";

type MediaViewerModalProps = {
  media: WorkoutMedia[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export function MediaViewerModal({
  media,
  initialIndex,
  isOpen,
  onClose,
}: MediaViewerModalProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        setIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === "ArrowRight") {
        setIndex((prev) => Math.min(prev + 1, media.length - 1));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, media.length, onClose]);

  if (!isOpen || media.length === 0) {
    return null;
  }

  const current = media[index];

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300"
        >
          닫기
        </button>
        <p className="text-sm text-zinc-400">
          {index + 1} / {media.length}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        {current.type === "video" ? (
          <video
            key={current.id}
            src={current.url}
            controls
            playsInline
            className="max-h-[72dvh] w-full rounded-2xl bg-black object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.fileName ?? "운동 사진"}
            className="max-h-[72dvh] w-full rounded-2xl object-contain"
          />
        )}
      </div>

      {media.length > 1 ? (
        <div className="flex items-center justify-center gap-4 pb-8">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((prev) => prev - 1)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-30"
          >
            이전
          </button>
          <button
            type="button"
            disabled={index === media.length - 1}
            onClick={() => setIndex((prev) => prev + 1)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      ) : null}
    </div>
  );
}
