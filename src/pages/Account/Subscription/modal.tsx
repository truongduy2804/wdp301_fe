import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  easeOut,
  useReducedMotion,
} from "framer-motion";
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  AlertCircle,
  Lock,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Badge, cx, formatNumber } from "@/components/ui/page/componentUI";

/** ===== shared helpers ===== */
function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);
}

async function copyText(text?: string | null) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

/** ===== Types (match BE) ===== */
export type EnterprisePlan = {
  id: number;
  name: string;
  description: string;
  price: string;
  durationMonths: number;
  isActive: boolean;
};

export type RenewPaymentInfo = {
  referenceCode: string;
  amount: number;
  currency: string;
  description: string;
  planName: string;
  durationMonths: number;
  expiresAt: string;
  status: string; // PENDING...
};

export type RenewBankInfo = {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  transferContent: string;
};

export type PendingPayment = any;

/** ===== Status mapping VI ===== */
function paymentStatusVi(status?: string) {
  const s = (status ?? "").toUpperCase();
  switch (s) {
    case "PENDING":
      return "Đang chờ";
    case "PAID":
    case "SUCCESS":
    case "COMPLETED":
      return "Thành công";
    case "FAILED":
      return "Thất bại";
    case "CANCELED":
    case "CANCELLED":
      return "Đã hủy";
    case "EXPIRED":
      return "Hết hạn";
    default:
      return status ?? "—";
  }
}

function isPaymentSuccess(status?: string) {
  const s = (status ?? "").toUpperCase();
  return s === "PAID" || s === "SUCCESS" || s === "COMPLETED";
}

function isPaymentExpired(status?: string) {
  return (status ?? "").toUpperCase() === "EXPIRED";
}

function paymentTone(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (
    s === "FAILED" ||
    s === "CANCELED" ||
    s === "CANCELLED" ||
    s === "EXPIRED"
  ) {
    return "rose" as const;
  }
  if (isPaymentSuccess(s)) return "emerald" as const;
  return "amber" as const;
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** ===== Modal base variants ===== */
function useModalVariants() {
  const reduceMotion = useReducedMotion();
  return useMemo(() => {
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
          transition: { duration: reduceMotion ? 0.1 : 0.16, ease: easeOut },
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
}

/** =======================================================================
 *  1) Plan Select Modal
 *  ======================================================================= */
export function PlanSelectModal({
  open,
  title = "Chọn gói dịch vụ",
  subtitle = "Chọn gói và xác nhận để tạo QR thanh toán.",
  plans,
  selectedPlanId,
  onSelect,
  onClose,
  onConfirm,
  confirming,
}: {
  open: boolean;
  title?: string;
  subtitle?: string;
  plans: EnterprisePlan[];
  selectedPlanId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}) {
  useLockBodyScroll(open);
  const variants = useModalVariants();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1600] bg-black/45"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[720px] max-w-[760px]
              max-h-[calc(100vh-5rem)]
              flex flex-col overflow-hidden
              rounded-2xl shadow-2xl 
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-emerald-600 px-6 sm:px-8 py-6">
              <button
                onClick={onClose}
                disabled={confirming}
                className="
                  absolute right-4 top-4 grid h-10 w-10 place-items-center
                  rounded-full bg-white/20 hover:bg-white/30 backdrop-blur
                  text-white transition active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                aria-label="Đóng"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {title}
                  </h2>
                  <p className="text-sm text-emerald-50">{subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 bg-slate-50">
              {plans.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((p) => {
                    const active = p.id === selectedPlanId;
                    const price = Number(p.price) || 0;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelect(p.id)}
                        className={cx(
                          "group text-left rounded-2xl border p-4 transition-all",
                          "hover:-translate-y-[1px] hover:shadow-md",
                          active
                            ? "border-emerald-300 bg-emerald-50/40"
                            : "border-slate-200 bg-white shadow-sm hover:border-emerald-200",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base font-extrabold text-slate-900 truncate">
                              {p.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                              {p.description}
                            </div>
                          </div>

                          {active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đang chọn
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              Gói
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Thời hạn
                            </div>
                            <div className="mt-1 text-sm font-bold text-slate-900">
                              {p.durationMonths} tháng
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Giá
                            </div>
                            <div className="mt-1 text-sm font-black text-slate-900">
                              {formatNumber(price)} VNĐ
                            </div>
                          </div>
                        </div>

                        <div
                          className={cx(
                            "mt-3 text-xs font-semibold",
                            active ? "text-emerald-700" : "text-slate-500",
                          )}
                        >
                          Nhấn để chọn gói này
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="text-sm font-semibold text-slate-700">
                    Không có gói nào đang hoạt động
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Vui lòng kiểm tra lại cấu hình gói trên hệ thống.
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-6 sm:px-8 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={confirming}
                className="
                  px-5 py-2 rounded-xl font-semibold
                  text-slate-700 bg-white border border-slate-200
                  hover:bg-slate-50 hover:border-slate-300
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                Huỷ
              </button>

              <button
                onClick={onConfirm}
                disabled={confirming || !selectedPlanId}
                className="
                  px-6 py-2 rounded-xl font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition inline-flex items-center gap-2
                "
                type="button"
              >
                {confirming ? (
                  <>
                    <LoadingSpinner
                      color="white"
                      size="4"
                      inline
                      className="border-2"
                    />
                    Đang tạo...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** =======================================================================
 *  2) Payment QR Modal
 *  ======================================================================= */
export function PaymentQrModal({
  open,
  onClose,
  onRenew,
  renewing = false,
  qrUrl,
  referenceCode,
  bankInfo,
  paymentInfo,
  payment,
  initialLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onRenew?: (subscriptionPlanConfigId?: number) => void;
  renewing?: boolean;
  qrUrl: string | null;
  referenceCode: string | null;

  bankInfo: RenewBankInfo | null;
  paymentInfo: RenewPaymentInfo | null;

  payment: PendingPayment | null;
  polling?: boolean;
  fetching?: boolean;
  initialLoading?: boolean;
}) {
  useLockBodyScroll(open);
  const variants = useModalVariants();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const statusRaw =
    (payment as any)?.status ?? paymentInfo?.status ?? "PENDING";
  const statusText = paymentStatusVi(statusRaw);
  const tone = paymentTone(statusRaw);

  const createdAt = (payment as any)?.createdAt ?? null;
  const expiresAt =
    (payment as any)?.expiresAt ?? paymentInfo?.expiresAt ?? null;

  const amount =
    Number(
      (payment as any)?.amount ?? paymentInfo?.amount ?? bankInfo?.amount ?? 0,
    ) || 0;

  const planConfig = (payment as any)?.subscriptionPlanConfig ?? null;
  const subscriptionPlanConfigId =
    (payment as any)?.subscriptionPlanConfig?.id ??
    (payment as any)?.subscriptionPlanConfigId ??
    null;

  const planName = planConfig?.name ?? paymentInfo?.planName ?? "—";
  const duration =
    planConfig?.durationMonths ?? paymentInfo?.durationMonths ?? "—";

  const transferContent =
    bankInfo?.transferContent ||
    (referenceCode ? `Thanh toan ${referenceCode}` : "Thanh toan");

  const expiresTs = useMemo(() => {
    if (!expiresAt) return NaN;
    const ts = new Date(expiresAt).getTime();
    return Number.isNaN(ts) ? NaN : ts;
  }, [expiresAt]);

  const qrExpired = useMemo(() => {
    if (isPaymentExpired(statusRaw)) return true;
    if (Number.isFinite(expiresTs) && Date.now() >= expiresTs) return true;
    return false;
  }, [statusRaw, expiresTs]);

  const isContentLoading =
    open &&
    Boolean(
      initialLoading &&
      !qrExpired &&
      (!referenceCode ||
        !paymentInfo ||
        !bankInfo ||
        !expiresAt ||
        !payment ||
        !qrUrl),
    );

  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setRemainingMs(null);
      return;
    }

    if (!Number.isFinite(expiresTs)) {
      setRemainingMs(null);
      return;
    }

    const update = () => {
      const left = Math.max(expiresTs - Date.now(), 0);
      setRemainingMs(left);
    };

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [open, expiresTs]);

  useEffect(() => {
    if (!open) return;
    if (!isPaymentSuccess(statusRaw)) return;
    onClose();
  }, [open, statusRaw, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const countdownText = useMemo(() => {
    if (remainingMs === null) return null;
    if (remainingMs <= 0) return "Đã hết hạn";

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  }, [remainingMs]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1600] bg-black/45"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[860px] max-w-[920px]
              max-h-[calc(100vh-5rem)]
              flex flex-col overflow-hidden
              rounded-2xl shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-emerald-600 px-6 sm:px-8 py-6">
              <button
                onClick={onClose}
                className="
                  absolute right-4 top-4 grid h-10 w-10 place-items-center
                  rounded-full bg-white/20 hover:bg-white/30 backdrop-blur
                  text-white transition active:scale-[0.98]
                "
                aria-label="Đóng"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    Thanh toán chuyển khoản
                  </h2>
                  <p className="text-sm text-emerald-50">
                    Quét QR để chuyển khoản. Hệ thống sẽ tự kiểm tra trạng thái.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 bg-white">
              {isContentLoading ? (
                <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                  <LoadingSpinner color="blue" size="12" inline />
                  <div className="mt-4 text-base font-bold text-slate-800">
                    Đang tải thông tin thanh toán...
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Vui lòng chờ trong giây lát
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-900">Mã QR</div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center min-h-[280px]">
                      {qrExpired ? (
                        <div className="flex flex-col items-center justify-center text-center min-h-[260px] w-full rounded-2xl bg-slate-50">
                          <Lock className="h-7 w-7 text-slate-400" />
                          <div className="mt-3 text-sm font-semibold text-slate-700">
                            QR đã hết hạn
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Vui lòng đóng cửa sổ này và tạo giao dịch mới.
                          </div>
                          {onRenew && (
                            <button
                              onClick={() =>
                                onRenew?.(subscriptionPlanConfigId)
                              }
                              disabled={renewing}
                              className="
    mt-4 px-4 py-2 rounded-xl
    bg-emerald-600 text-white text-sm font-semibold
    hover:bg-emerald-700 active:scale-[0.98]
    disabled:opacity-60 disabled:cursor-not-allowed
    transition inline-flex items-center gap-2
  "
                            >
                              {renewing ? (
                                <>
                                  <LoadingSpinner
                                    color="white"
                                    size="4"
                                    inline
                                  />
                                  Đang tạo QR...
                                </>
                              ) : (
                                "Gia hạn lại"
                              )}
                            </button>
                          )}
                        </div>
                      ) : qrUrl ? (
                        <div className="relative flex items-center justify-center">
                          <img
                            src={qrUrl}
                            alt="QR Payment"
                            className="max-h-[260px] object-contain transition"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <LoadingSpinner color="blue" size="6" inline />
                          Đang lấy QR...
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-500">Tạo lúc:</span>{" "}
                        <span className="font-semibold text-slate-800">
                          {fmtDateTime(createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500">Hết hạn:</span>{" "}
                        <span className="font-semibold text-slate-800">
                          {fmtDateTime(expiresAt)}
                        </span>
                      </div>

                      <div
                        className={cx(
                          "mt-3 rounded-2xl border px-4 py-3 transition",
                          qrExpired
                            ? "border-rose-300 bg-rose-100"
                            : "border-rose-200 bg-rose-50",
                        )}
                      >
                        <div
                          className={cx(
                            "text-[11px] font-semibold uppercase tracking-wider",
                            qrExpired ? "text-rose-700" : "text-rose-600",
                          )}
                        >
                          {qrExpired ? "Trạng thái mã QR" : "Thời gian còn lại"}
                        </div>

                        {remainingMs === null && !qrExpired ? (
                          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-rose-500">
                            <LoadingSpinner color="blue" size="5" inline />
                            Đang tính thời gian...
                          </div>
                        ) : qrExpired ? (
                          <>
                            <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-rose-700">
                              QR đã hết hạn
                            </div>
                            <div className="mt-1 text-sm text-rose-700">
                              Mã thanh toán không còn hiệu lực. Vui lòng đóng
                              cửa sổ này và tạo lại giao dịch mới.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-1 text-2xl sm:text-3xl font-black tracking-wider text-rose-700">
                              {countdownText}
                            </div>
                            <div className="mt-1 text-xs text-rose-600">
                              Vui lòng hoàn tất chuyển khoản trước khi mã hết
                              hạn.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-900">
                        Thông tin thanh toán
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={tone}>{statusText}</Badge>
                      </div>
                    </div>

                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-500">
                              Gói
                            </div>
                            <div className="mt-1 font-bold text-slate-900">
                              {planName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Thời hạn:{" "}
                              <span className="font-semibold">{duration}</span>{" "}
                              tháng
                            </div>
                          </div>

                          {planConfig ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                              Thông tin
                            </span>
                          ) : null}
                        </div>

                        {planConfig ? (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs font-semibold text-emerald-700">
                              Xem chi tiết gói
                            </summary>
                            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 space-y-1">
                              <div>
                                <span className="text-slate-500">Mô tả: </span>
                                <span className="font-semibold">
                                  {planConfig.description ?? "—"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Giá: </span>
                                <span className="font-semibold">
                                  {formatNumber(Number(planConfig.price ?? 0))}{" "}
                                  VND
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">
                                  Ngày tạo:{" "}
                                </span>
                                <span className="font-semibold">
                                  {fmtDateTime(planConfig.createdAt)}
                                </span>
                              </div>
                            </div>
                          </details>
                        ) : null}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs font-semibold text-slate-500">
                          Số tiền
                        </div>
                        <div className="mt-1 text-lg font-black text-slate-900">
                          {formatNumber(amount)} VND
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-500">
                          Số tài khoản
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="font-bold text-slate-900 break-all">
                            {bankInfo?.accountNumber ?? "—"}
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-xl hover:bg-slate-100 transition"
                            onClick={() =>
                              copyText(bankInfo?.accountNumber ?? null)
                            }
                            aria-label="Copy account number"
                          >
                            <Copy className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-500 mt-2">
                          Chủ TK:{" "}
                          <span className="font-semibold text-slate-700">
                            {bankInfo?.accountHolder ?? "—"}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-500">
                          Nội dung chuyển khoản
                        </div>
                        <div className="mt-1 flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-900 break-all">
                            {transferContent}
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-xl hover:bg-slate-100 transition"
                            onClick={() => copyText(transferContent)}
                            aria-label="Copy transfer content"
                          >
                            <Copy className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <div>
                          Sau khi thanh toán thành công, hệ thống sẽ tự cập nhật
                          gói dịch vụ.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-6 sm:px-8 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="
                  px-5 py-2 rounded-xl font-semibold
                  text-slate-700 bg-white border border-slate-200
                  hover:bg-slate-50 hover:border-slate-300
                  active:scale-[0.98]
                  transition
                "
                type="button"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
