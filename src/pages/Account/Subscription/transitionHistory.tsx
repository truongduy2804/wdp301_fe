import React, { useEffect, useMemo, useRef } from "react";
import {
  AnimatePresence,
  motion,
  easeOut,
  useReducedMotion,
} from "framer-motion";
import {
  X,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Badge, cx, formatNumber } from "@/components/ui/page/componentUI";
import type { EnterpriseTransactionItem } from "@/redux/api/enterprise/payment/types";

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

function paymentTone(status?: string) {
  const s = (status ?? "").toUpperCase();

  if (s === "FAILED" || s === "CANCELED" || s === "CANCELLED") {
    return "rose" as const;
  }
  if (s === "PAID" || s === "SUCCESS" || s === "COMPLETED") {
    return "emerald" as const;
  }

  return "amber" as const;
}

function paymentMethodVi(method?: string) {
  const m = (method ?? "").toUpperCase();

  switch (m) {
    case "BANK_TRANSFER":
      return "Chuyển khoản ngân hàng";
    case "CASH":
      return "Tiền mặt";
    case "CARD":
      return "Thẻ";
    case "EWALLET":
    case "E_WALLET":
      return "Ví điện tử";
    default:
      return method ?? "—";
  }
}

function PaymentStatusIcon({ status }: { status?: string }) {
  const s = (status ?? "").toUpperCase();

  if (s === "PAID" || s === "SUCCESS" || s === "COMPLETED") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (s === "FAILED" || s === "CANCELED" || s === "CANCELLED") {
    return <XCircle className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

export function TransactionHistoryModal({
  open,
  onClose,
  transactions,
  loading,
  page,
  totalPages,
  total,
  onPrev,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  transactions: EnterpriseTransactionItem[];
  loading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  useLockBodyScroll(open);
  const variants = useModalVariants();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[1120px] max-w-[1160px]
              max-h-[calc(100vh-5rem)]
              flex flex-col overflow-hidden rounded-3xl shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-emerald-600 px-6 sm:px-8 py-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                aria-label="Đóng"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ReceiptText className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Lịch sử giao dịch
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 bg-slate-50">
              {loading ? (
                <div className="min-h-[320px] rounded-3xl border border-slate-200 bg-white flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner color="blue" size="12" inline />
                    <div className="text-base font-bold text-slate-800">
                      Đang tải lịch sử giao dịch...
                    </div>
                    <div className="text-sm text-slate-500">
                      Vui lòng chờ trong giây lát
                    </div>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="min-h-[260px] rounded-3xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center px-6">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                    <ReceiptText className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-base font-bold text-slate-800">
                    Chưa có giao dịch nào
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Lịch sử thanh toán sẽ hiển thị tại đây sau khi có giao dịch.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-slate-500 mb-2">
                    Tổng số giao dịch:
                    <span className="ml-1 font-bold text-red-700">{total}</span>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed text-sm text-center">
                        <colgroup>
                          <col className="w-[15%]" />
                          <col className="w-[22%]" />
                          <col className="w-[13%]" />
                          <col className="w-[13%]" />
                          <col className="w-[16%]" />
                          <col className="w-[13%]" />
                          <col className="w-[8%]" />
                        </colgroup>

                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Mã giao dịch
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Mô tả
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Gói
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Số tiền
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Phương thức
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Thanh toán lúc
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {transactions.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/80 transition"
                            >
                              <td className="px-4 py-4 font-bold text-slate-900 break-words">
                                {item.referenceCode}
                              </td>

                              <td className="px-4 py-4 text-slate-600 break-words">
                                {item.description || "Thanh toán gói dịch vụ"}
                              </td>

                              <td className="px-4 py-4 font-semibold text-slate-900">
                                {item.planName || "—"}
                              </td>

                              <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                                {formatNumber(Number(item.amount || 0))}{" "}
                                {item.currency || "VND"}
                              </td>

                              <td className="px-4 py-4 text-slate-700">
                                {paymentMethodVi(item.method)}
                              </td>

                              <td className="px-4 py-4 text-slate-700">
                                {fmtDateTime(item.paidAt)}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex justify-center">
                                  <Badge tone={paymentTone(item.status)}>
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                      <PaymentStatusIcon status={item.status} />
                                      {paymentStatusVi(item.status)}
                                    </span>
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-slate-500">
                Trang{" "}
                <span className="font-semibold text-slate-700">{page}</span> /{" "}
                <span className="font-semibold text-slate-700">
                  {Math.max(totalPages, 1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={page <= 1}
                  className={cx(
                    "px-4 py-2 rounded-xl border text-sm font-semibold transition inline-flex items-center gap-2",
                    page <= 1
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={page >= totalPages}
                  className={cx(
                    "px-4 py-2 rounded-xl border text-sm font-semibold transition inline-flex items-center gap-2",
                    page >= totalPages
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50",
                  )}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
