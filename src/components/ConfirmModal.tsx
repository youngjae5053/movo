"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "삭제",
  cancelLabel = "취소",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-sm rounded-t-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl sm:mx-4 sm:rounded-3xl">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-2xl bg-red-500/90 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
