"use client";

import type { WorkoutMedia } from "@/lib/types";

type WorkoutMediaGalleryProps = {
  media: WorkoutMedia[];
  onOpen?: (index: number) => void;
  compact?: boolean;
  hiddenCount?: number;
};

export function WorkoutMediaGallery({
  media,
  onOpen,
  compact = false,
  hiddenCount = 0,
}: WorkoutMediaGalleryProps) {
  if (media.length === 0) {
    return null;
  }

  const gridClass =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  const itemHeight = compact ? "h-[88px]" : "h-[112px]";

  return (
    <div className={`mt-4 grid gap-1.5 ${gridClass}`}>
      {media.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen?.(index)}
          className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30 ${itemHeight} ${
            media.length === 3 && index === 0 ? "col-span-2 row-span-2 h-[228px]" : ""
          }`}
        >
          {item.type === "video" ? (
            <>
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.fileName ?? "운동 사진"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}

          {hiddenCount > 0 && index === media.length - 1 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
              +{hiddenCount}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
