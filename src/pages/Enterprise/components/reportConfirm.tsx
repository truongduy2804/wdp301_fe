// reportConfirm.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";

type ConfirmTone = "emerald" | "rose";

type ConfirmOpts = {
  title: React.ReactNode;
  content: React.ReactNode;
  okText: React.ReactNode;
  cancelText?: React.ReactNode;
  tone: ConfirmTone;
  disabled?: boolean;
  onOk: () => Promise<void> | void;
};

function lockScroll() {
  const prev = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
  return () => {
    document.documentElement.style.overflow = prev;
  };
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.16, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.12 } },
};

function openConfirm(opts: ConfirmOpts) {
  if (opts.disabled) return;

  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  const cleanup = () => {
    try {
      root.unmount();
    } finally {
      host.remove();
    }
  };

  function ConfirmUI() {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const reduceMotion = useReducedMotion();

    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    // lock scroll
    useEffect(() => lockScroll(), []);

    // ESC đóng (không cho đóng khi đang loading)
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (loading) return;
          setOpen(false);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, loading]);

    const close = () => {
      if (loading) return;
      setOpen(false);
    };

    const onOk = async () => {
      if (loading) return;
      try {
        setLoading(true);
        await opts.onOk?.();
        setOpen(false);
      } catch {
        setLoading(false);
      }
    };

    const okBtnCls =
      opts.tone === "emerald"
        ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
        : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800";

    const useOverlay = reduceMotion ? undefined : overlayVariants;
    const useModal = reduceMotion ? undefined : modalVariants;

    return (
      <AnimatePresence onExitComplete={cleanup}>
        {open ? (
          <motion.div
            ref={overlayRef}
            variants={useOverlay}
            initial={reduceMotion ? { opacity: 0 } : "hidden"}
            animate={reduceMotion ? { opacity: 1 } : "visible"}
            exit={reduceMotion ? { opacity: 0 } : "exit"}
            className="fixed inset-0 z-[2200] bg-black/45 backdrop-blur-[1px]"
            onMouseDown={(e) => {
              if (e.target === overlayRef.current) close();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              variants={useModal}
              initial={reduceMotion ? { opacity: 0, y: 10 } : "hidden"}
              animate={reduceMotion ? { opacity: 1, y: 0 } : "visible"}
              exit={reduceMotion ? { opacity: 0, y: 10 } : "exit"}
              onMouseDown={(e) => e.stopPropagation()}
              className="
                fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[min(560px,calc(100vw-32px))]
                max-h-[calc(100vh-64px)]
                overflow-hidden
                rounded-2xl bg-white shadow-2xl
                ring-1 ring-black/5
              "
            >
              {/* Header */}
              <div className="relative border-b border-slate-100 px-5 py-4 pr-12">
                <div className="text-[15px] font-extrabold text-slate-900">
                  {opts.title}
                </div>

                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  aria-label="Đóng"
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

              {/* Body (scroll nếu dài) */}
              <div className="px-5 py-4 text-sm text-slate-700 overflow-y-auto custom-scrollbar max-h-[calc(100vh-64px-56px-64px)]">
                {opts.content}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3">
                <button
                  autoFocus
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="
                    rounded-xl border border-slate-200 bg-white px-4 py-2
                    text-sm font-extrabold text-slate-700
                    hover:bg-slate-50 active:scale-[0.98] transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {opts.cancelText ?? "Huỷ"}
                </button>

                <button
                  type="button"
                  onClick={onOk}
                  disabled={loading}
                  className={`
                    inline-flex items-center justify-center gap-2
                    rounded-xl px-4 py-2 text-sm font-extrabold text-white
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
                    opts.okText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }

  root.render(<ConfirmUI />);
}

/** API gọi như cũ */
export function confirmAcceptReport(opts: {
  reportId: number;
  disabled?: boolean;
  onOk: () => Promise<void> | void;
}) {
  openConfirm({
    title: `Xác nhận duyệt đơn #${opts.reportId}`,
    content: "Bạn chắc chắn muốn duyệt đơn này? Thao tác không thể hoàn tác.",
    okText: "Duyệt",
    cancelText: "Huỷ",
    tone: "emerald",
    disabled: opts.disabled,
    onOk: opts.onOk,
  });
}

export function confirmRejectReport(opts: {
  reportId: number;
  disabled?: boolean;
  onOk: () => Promise<void> | void;
}) {
  openConfirm({
    title: `Xác nhận từ chối đơn #${opts.reportId}`,
    content: "Bạn chắc chắn muốn từ chối đơn này? Thao tác không thể hoàn tác.",
    okText: "Từ chối",
    cancelText: "Huỷ",
    tone: "rose",
    disabled: opts.disabled,
    onOk: opts.onOk,
  });
}
