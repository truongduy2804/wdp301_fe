import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";

export type ConfirmTone = "emerald" | "rose";

type Props = {
  open: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  tone?: ConfirmTone;
  loading?: boolean;
  onClose: () => void;
  onOk: () => void;
};

export default function ConfirmModal({
  open,
  title,
  content,
  okText = "Xác nhận",
  cancelText = "Huỷ",
  tone = "emerald",
  loading = false,
  onClose,
  onOk,
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (loading) return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  const okBtnCls =
    tone === "emerald"
      ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
      : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800";

  const toneIconWrap =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200";

  const TitleIcon = tone === "emerald" ? ShieldCheck : AlertTriangle;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[2200] bg-black/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current && !loading) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2
              w-[min(520px,calc(100vw-32px))]
              overflow-hidden rounded-2xl bg-white shadow-2xl
              ring-1 ring-black/5
            "
            initial={
              reduceMotion
                ? { opacity: 0, y: 10 }
                : { opacity: 0, y: 10, scale: 0.985 }
            }
            animate={
              reduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0, y: 10 }
                : { opacity: 0, y: 10, scale: 0.985 }
            }
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative border-b border-slate-100 px-5 py-4 pr-14">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "grid h-9 w-9 place-items-center rounded-xl",
                    toneIconWrap,
                  ].join(" ")}
                >
                  <TitleIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-slate-900 leading-6">
                    {title}
                  </div>
                </div>
              </div>

              {/* Close */}
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute right-3 top-3  place-items-center grid h-9 w-9  rounded-md hover:bg-gray-100 "
                onClick={onClose}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 text-sm text-slate-700">{content}</div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  rounded-xl border border-slate-200 bg-white px-4 py-2
                  text-sm font-semibold text-slate-700
                  hover:bg-slate-50 active:scale-[0.98] transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onOk}
                disabled={loading}
                className={`
                  inline-flex items-center justify-center gap-2
                  rounded-xl px-4 py-2 text-sm font-semibold text-white
                  ${okBtnCls}
                  disabled:opacity-70 disabled:cursor-not-allowed
                  active:scale-[0.98] transition
                `}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Đang xử lý...
                  </span>
                ) : (
                  okText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
