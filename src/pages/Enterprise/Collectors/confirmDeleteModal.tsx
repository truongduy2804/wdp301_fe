// ConfirmDeleteModal.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, easeInOut } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  desc: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  open,
  loading,
  title,
  desc,
  onClose,
  onConfirm,
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const variants = useMemo(() => {
    return {
      overlay: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reduceMotion ? 0.08 : 0.14 },
        },
        exit: {
          opacity: 0,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
      },
      panel: {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: reduceMotion ? 0.1 : 0.16, ease: easeInOut },
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: 10,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
      },
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1700] bg-black/45"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === overlayRef.current) {
              if (!loading) onClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={variants.panel}
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[520px] max-w-[520px]
              max-h-[calc(100vh-5rem)]
              overflow-hidden rounded-2xl bg-white shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-5 py-4 border-b border-slate-100">
              <div className="flex items-start gap-3 pr-10">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 border border-rose-100">
                  <AlertTriangle className="h-5 w-5 text-rose-700" />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-extrabold text-slate-900 truncate">
                    {title}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    Hành động này không thể hoàn tác.
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Đóng"
                disabled={!!loading}
                onClick={onClose}
                className="
                  absolute right-3 top-3 grid h-9 w-9 place-items-center
                  rounded-xl border border-slate-200 bg-white
                  hover:bg-slate-50 active:scale-[0.98] transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <div className="text-sm text-slate-700 leading-relaxed">
                {desc}
              </div>

              {loading ? (
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
                  <LoadingSpinner color="blue" size="4" inline />
                  Đang xoá...
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!!loading}
                onClick={onClose}
                className="
                  rounded-xl border border-slate-200 bg-white px-4 py-2
                  text-sm font-extrabold text-slate-700
                  hover:bg-slate-50 active:scale-[0.98] transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                Huỷ
              </button>

              <button
                type="button"
                disabled={!!loading}
                onClick={onConfirm}
                className="
                  inline-flex items-center gap-2
                  rounded-xl bg-rose-600 px-4 py-2
                  text-sm font-extrabold text-white
                  hover:bg-rose-700 active:bg-rose-800 active:scale-[0.98]
                  transition disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                <Trash2 className="h-4 w-4" />
                Xoá
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
