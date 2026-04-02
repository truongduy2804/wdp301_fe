import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Timer,
  ReceiptText,
  ChevronsRight,
  CheckCircle2,
  Clock3,
  XCircle,
  History,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RefreshButton from "@/components/ui/button/refreshButton";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  StatCard,
  cx,
  formatNumber,
} from "@/components/ui/page/componentUI";

import {
  useGetEnterpriseSubscriptionQuery,
  useRenewEnterpriseSubscriptionMutation,
} from "@/redux/api/enterprise/subscription";
import {
  useLazyGetEnterprisePaymentQuery,
  useGetEnterpriseTransactionHistoryQuery,
} from "@/redux/api/enterprise/payment";
import type {
  PendingPayment,
  EnterpriseTransactionItem,
} from "@/redux/api/enterprise/payment/types";
import { useGetEnterprisePlansQuery } from "@/redux/api/enterprise/plans";

import {
  PlanSelectModal,
  PaymentQrModal,
  type EnterprisePlan,
  type RenewBankInfo,
  type RenewPaymentInfo,
} from "./modal";

import { TransactionHistoryModal } from "./transitionHistory";
import { toast } from "react-toastify";

type RenewResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    payment: RenewPaymentInfo;
    qrCode: { qrUrl: string; bankInfo: RenewBankInfo };
  };
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
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

function isPaidStatus(status?: string) {
  const s = (status || "").toUpperCase();
  return s === "PAID" || s === "SUCCESS" || s === "COMPLETED";
}

function toneFromSub(params: { isExpired?: boolean; isActive?: boolean }) {
  if (params.isExpired) return "rose" as const;
  if (params.isActive) return "emerald" as const;
  return "slate" as const;
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

function pickPendingQr(pending: any): {
  qrUrl?: string;
  bankInfo?: RenewBankInfo;
} {
  const qrUrl = pending?.qrCode?.qrUrl || pending?.qrUrl || pending?.qrCodeUrl;
  const bankInfo = pending?.qrCode?.bankInfo || pending?.bankInfo;

  return { qrUrl, bankInfo };
}

function RecentTransactionsPreview({
  transactions,
  loading,
  total,
  onViewAll,
}: {
  transactions: EnterpriseTransactionItem[];
  loading?: boolean;
  total: number;
  onViewAll: () => void;
}) {
  return (
    <Card>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div>
              <div className="text-lg font-semibold text-slate-900">
                Lịch sử giao dịch gần đây
              </div>
              <div className="text-sm text-slate-500">
                Tổng số giao dịch:{" "}
                <span className="font-semibold text-red-700">{total}</span>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={onViewAll}>
            Xem tất cả
          </Button>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner color="blue" size="10" inline />
                <div className="text-sm font-semibold text-slate-600">
                  Đang tải lịch sử giao dịch...
                </div>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="min-h-[180px] rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center px-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 border border-slate-200">
                <ReceiptText className="h-6 w-6" />
              </div>
              <div className="mt-3 text-base font-semibold text-slate-800">
                Chưa có giao dịch nào
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Các giao dịch thanh toán sẽ hiển thị tại đây.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
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
                        <td className="px-4 py-4 font-semibold text-slate-900 break-words">
                          {item.referenceCode}
                        </td>

                        <td className="px-4 py-4 text-slate-600 break-words">
                          {item.description || "Thanh toán gói dịch vụ"}
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {item.planName || "—"}
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900 whitespace-nowrap">
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
          )}
        </div>
      </div>
    </Card>
  );
}

export default function EnterpriseSubscription() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: subData,
    isLoading: isLoadingSub,
    isError: isSubError,
    error: subErr,
    refetch: refetchSub,
    isFetching: isFetchingSub,
  } = useGetEnterpriseSubscriptionQuery();

  const {
    data: plansData,
    isLoading: isLoadingPlans,
    isError: isPlansError,
    refetch: refetchPlans,
    isFetching: isFetchingPlans,
  } = useGetEnterprisePlansQuery();

  const [renew, renewState] = useRenewEnterpriseSubscriptionMutation();
  const [triggerPayment, paymentState] = useLazyGetEnterprisePaymentQuery();

  const payload = subData?.data;
  const sub = payload?.subscription;
  const pendingFromGet = payload?.pendingPayment ?? null;

  const plans: EnterprisePlan[] = useMemo(() => {
    const all = (plansData as any)?.data as EnterprisePlan[] | undefined;
    return (all ?? []).filter((p) => p.isActive);
  }, [plansData]);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<RenewBankInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<RenewPaymentInfo | null>(null);

  const hasBootstrappedPaymentRef = useRef(false);
  const reloadingRef = useRef(false);

  const [payment, setPayment] = useState<PendingPayment | null>(null);
  const pollRef = useRef<number | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const previewLimit = 5;
  const modalLimit = 5;

  const { data: previewHistoryData, isFetching: isFetchingPreviewHistory } =
    useGetEnterpriseTransactionHistoryQuery(
      { page: 1, limit: previewLimit },
      { skip: globalThis?.window === undefined ? false : false },
    );

  const { data: transactionHistoryData, isFetching: isFetchingHistory } =
    useGetEnterpriseTransactionHistoryQuery(
      { page: historyPage, limit: modalLimit },
      { skip: !historyModalOpen },
    );

  const [renewingDirect, setRenewingDirect] = useState(false);

  const previewTransactions = previewHistoryData?.data?.transactions ?? [];
  const previewPagination = previewHistoryData?.data?.pagination;
  const totalTransactions = previewPagination?.total ?? 0;

  const transactions = transactionHistoryData?.data?.transactions ?? [];
  const historyPagination = transactionHistoryData?.data?.pagination;
  const totalPages = historyPagination?.totalPages ?? 1;

  useEffect(() => {
    const shouldOpen = (location.state as any)?.openPlanModal === true;
    if (shouldOpen) setPlanModalOpen(true);
  }, [location.state]);

  useEffect(() => {
    if (!selectedPlanId && plans.length) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  useEffect(() => {
    const shouldResume = (location.state as any)?.resumePendingPayment === true;
    if (shouldResume) {
      resumePayment();
    }
  }, [location.state]);

  const handleRenewDirect = async (planId?: number) => {
    if (!planId) return;

    try {
      setRenewingDirect(true);

      const res = await renew({
        subscriptionPlanConfigId: planId,
      }).unwrap();

      const code = res?.data?.payment?.referenceCode;
      const qr = res?.data?.qrCode?.qrUrl;
      const bank = res?.data?.qrCode?.bankInfo;
      const pay = res?.data?.payment;

      if (code) {
        setReferenceCode(code);
        setQrUrl(qr ?? null);
        setBankInfo(bank ?? null);
        setPaymentInfo(pay ?? null);

        startPolling(code);
      }
    } catch (err) {
      console.error("Renew failed:", err);
    } finally {
      setRenewingDirect(false);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = async (code: string) => {
    stopPolling();

    try {
      const res = await triggerPayment(code).unwrap();
      const p = (res as any)?.data ?? null;

      if (p) {
        setPayment(p);
        hasBootstrappedPaymentRef.current = true;
      }

      if (isPaidStatus(p?.status) && !reloadingRef.current) {
        reloadingRef.current = true;
        setPayModalOpen(false);

        toast.success("Thanh toán thành công. Gói dịch vụ đã được gia hạn.", {
          autoClose: 1200,
        });

        window.setTimeout(() => {
          window.location.reload();
        }, 900);
        return;
      }
    } catch {
      // silent
    }

    pollRef.current = window.setInterval(async () => {
      try {
        const res = await triggerPayment(code).unwrap();
        const p = (res as any)?.data ?? null;

        if (p) setPayment(p);

        if (isPaidStatus(p?.status) && !reloadingRef.current) {
          reloadingRef.current = true;
          stopPolling();
          setPayModalOpen(false);

          toast.success("Thanh toán thành công. Gói dịch vụ đã được gia hạn.", {
            autoClose: 1200,
          });

          window.setTimeout(() => {
            window.location.reload();
          }, 900);
        }
      } catch {
        // silent
      }
    }, 3000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  type EnterpriseStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "INACTIVE";
  type BadgeTone = "emerald" | "rose" | "amber" | "slate";

  const enterpriseName: string = payload?.enterpriseName ?? "Doanh nghiệp";

  const enterpriseStatus = payload?.enterpriseStatus as
    | EnterpriseStatus
    | undefined;

  const statusTone = useMemo<BadgeTone>(() => {
    switch (enterpriseStatus) {
      case "ACTIVE":
        return "emerald";
      case "EXPIRED":
        return "rose";
      case "PENDING":
        return "amber";
      case "INACTIVE":
        return "slate";
      default:
        return "slate";
    }
  }, [enterpriseStatus]);

  const statusLabel = useMemo<string>(() => {
    switch (enterpriseStatus) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "EXPIRED":
        return "Hết hạn";
      case "PENDING":
        return "Chờ kích hoạt";
      case "INACTIVE":
        return "Không hoạt động";
      default:
        return "Không rõ";
    }
  }, [enterpriseStatus]);

  const remainingLabel = useMemo(() => {
    const tr = sub?.timeRemaining;
    if (!tr) return "—";
    return `${tr.days} ngày ${tr.hours} giờ ${tr.minutes} phút`;
  }, [sub?.timeRemaining]);

  const pendingRefCode = (pendingFromGet as any)?.referenceCode as
    | string
    | undefined;
  const hasPendingPayment = Boolean(pendingRefCode);

  const resumePayment = () => {
    if (!pendingFromGet?.referenceCode) return;

    hasBootstrappedPaymentRef.current = false;
    reloadingRef.current = false;

    setPayment(null);
    setQrUrl(null);
    setBankInfo(null);
    setPaymentInfo(null);
    setReferenceCode(null);

    const ref = pendingFromGet.referenceCode as string;
    const { qrUrl: q, bankInfo: b } = pickPendingQr(pendingFromGet);

    const payFallback: RenewPaymentInfo = {
      referenceCode: ref,
      amount: Number(pendingFromGet.amount ?? 0),
      currency: "VND",
      description: `Thanh toan ${ref}`,
      planName: pendingFromGet.planName ?? sub?.planName ?? "—",
      durationMonths: sub?.durationMonths ?? 0,
      expiresAt: pendingFromGet.expiresAt ?? "",
      status: pendingFromGet.status ?? "PENDING",
    };

    setReferenceCode(ref);
    setQrUrl(q ?? null);
    setBankInfo((b as RenewBankInfo) ?? null);
    setPaymentInfo(payFallback);

    setPayModalOpen(true);
    startPolling(ref);
  };

  const onSubmitPlan = async () => {
    if (!selectedPlanId) return;

    try {
      hasBootstrappedPaymentRef.current = false;
      reloadingRef.current = false;

      setPayment(null);
      setQrUrl(null);
      setBankInfo(null);
      setPaymentInfo(null);
      setReferenceCode(null);

      const raw = (await renew({
        subscriptionPlanConfigId: selectedPlanId,
      }).unwrap()) as unknown as RenewResponse;

      const code = raw?.data?.payment?.referenceCode;
      const q = raw?.data?.qrCode?.qrUrl;
      const b = raw?.data?.qrCode?.bankInfo;
      const pay = raw?.data?.payment;

      setPlanModalOpen(false);

      if (code) {
        setReferenceCode(code);
        setQrUrl(q ?? null);
        setBankInfo(b ?? null);
        setPaymentInfo(pay ?? null);

        setPayModalOpen(true);
        startPolling(code);
        return;
      }

      refetchSub();
    } catch (e) {
      console.error("Create payment failed:", e);
    }
  };

  const globalLoading = isLoadingSub || isLoadingPlans;
  const globalError = isSubError || isPlansError;

  if (globalError) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center p-4 sm:p-6">
        <Card className="p-6 max-w-xl w-full">
          <div className="text-rose-700 font-semibold">
            Không tải được dữ liệu.
          </div>
          <div className="text-sm text-slate-500 mt-1">Vui lòng thử lại.</div>

          <div className="mt-4 flex gap-2">
            <RefreshButton
              onClick={() => refetchSub()}
              isFetching={isFetchingSub}
            />
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>

          <details className="mt-4">
            <summary className="text-xs text-slate-500 cursor-pointer">
              Chi tiết lỗi
            </summary>
            <pre className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-auto">
              {JSON.stringify({ subErr }, null, 2)}
            </pre>
          </details>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-sm transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800">
              Gói dịch vụ
            </div>
            <div className="text-xs text-slate-500">
              Gia hạn / mua thêm và thanh toán QR
            </div>
          </div>

          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={() => {
                setHistoryPage(1);
                setHistoryModalOpen(true);
              }}
              className="group flex items-center gap-2"
            >
              <History className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[180deg]" />
              Xem lịch sử giao dịch
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {globalLoading ? (
          <Card className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 py-10">
              <LoadingSpinner color="blue" size="12" inline />
              <div className="text-sm font-semibold text-slate-600">
                Đang tải thông tin gói...
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {hasPendingPayment ? (
              <Card className="border-amber-200">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="amber">Chờ thanh toán</Badge>
                      <div className="font-semibold text-slate-900 truncate">
                        Bạn có 1 giao dịch đang chờ
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Mã:{" "}
                      <span className="font-semibold">{pendingRefCode}</span>
                    </div>
                  </div>

                  <Button onClick={resumePayment}>Tiếp tục thanh toán</Button>
                </div>
              </Card>
            ) : null}

            <Card>
              <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-emerald-700" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 truncate">
                    {enterpriseName}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone}>{statusLabel}</Badge>

                    {sub?.planName ? (
                      <Badge tone="blue">{sub.planName}</Badge>
                    ) : null}
                  </div>

                  {sub?.endDate ? (
                    <div className="mt-2 text-sm text-slate-600">
                      Hết hạn:{" "}
                      <span className="font-semibold text-slate-900">
                        {fmtDate(sub.endDate)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    onClick={() => setPlanModalOpen(true)}
                    disabled={renewState.isLoading}
                    className="min-w-[190px]"
                  >
                    {sub?.isExpired ? "Gia hạn ngay" : "Gia hạn / Mua thêm"}
                  </Button>

                  <RefreshButton
                    onClick={() => {
                      refetchSub();
                      refetchPlans();
                    }}
                    isFetching={isFetchingSub || isFetchingPlans}
                  />
                </div>
              </div>
            </Card>

            {sub ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5" hover={false}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Thời gian
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-700" />
                        <span className="font-semibold text-slate-900">
                          Bắt đầu:
                        </span>
                        <span>{fmtDate(sub?.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-emerald-700" />
                        <span className="font-semibold text-slate-900">
                          Kết thúc:
                        </span>
                        <span>{fmtDate(sub?.endDate)}</span>
                      </div>
                    </div>
                  </Card>

                  <StatCard
                    title="Còn lại"
                    value={remainingLabel}
                    sub={`Hết hạn: ${fmtDate(sub.endDate)}`}
                    icon={Timer}
                  />

                  <Card className="p-5" hover={false}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Hướng dẫn
                    </div>
                    <div className="mt-3 text-sm text-slate-700">
                      Chọn gói → tạo QR → chuyển khoản đúng nội dung → hệ thống
                      tự cập nhật sau khi thanh toán thành công.
                    </div>
                  </Card>
                </div>

                <RecentTransactionsPreview
                  transactions={previewTransactions}
                  loading={isFetchingPreviewHistory}
                  total={totalTransactions}
                  onViewAll={() => {
                    setHistoryPage(1);
                    setHistoryModalOpen(true);
                  }}
                />
              </>
            ) : (
              <Card>
                <EmptyState
                  title="Chưa có thông tin gói"
                  desc="Doanh nghiệp chưa kích hoạt gói hoặc hệ thống chưa trả về dữ liệu."
                  right={
                    <Button onClick={() => setPlanModalOpen(true)}>
                      Chọn gói
                    </Button>
                  }
                />
              </Card>
            )}
          </div>
        )}
      </main>

      <PlanSelectModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelect={(id) => setSelectedPlanId(id)}
        onConfirm={onSubmitPlan}
        confirming={renewState.isLoading}
      />

      <PaymentQrModal
        open={payModalOpen}
        onClose={() => {
          stopPolling();
          setPayModalOpen(false);
        }}
        onRenew={handleRenewDirect}
        renewing={renewingDirect}
        qrUrl={qrUrl}
        referenceCode={referenceCode}
        bankInfo={bankInfo}
        paymentInfo={paymentInfo}
        payment={payment}
        polling={Boolean(pollRef.current)}
        fetching={paymentState.isFetching}
        initialLoading={!hasBootstrappedPaymentRef.current}
      />

      <TransactionHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        transactions={transactions}
        loading={isFetchingHistory}
        page={historyPage}
        totalPages={totalPages}
        total={totalTransactions}
        onPrev={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setHistoryPage((prev) => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
}
