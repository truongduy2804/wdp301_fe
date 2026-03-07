import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  Timer,
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
  formatNumber,
} from "@/components/ui/page/componentUI";

import {
  useGetEnterpriseSubscriptionQuery,
  useRenewEnterpriseSubscriptionMutation,
} from "@/redux/api/enterprise/subscription";
import { useLazyGetEnterprisePaymentQuery } from "@/redux/api/enterprise/payment";
import type { PendingPayment } from "@/redux/api/enterprise/payment/types";
import { useGetEnterprisePlansQuery } from "@/redux/api/enterprise/plans";

import {
  PlanSelectModal,
  PaymentQrModal,
  type EnterprisePlan,
  type RenewBankInfo,
  type RenewPaymentInfo,
} from "./modal";

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

function isPaidStatus(status?: string) {
  const s = (status || "").toUpperCase();
  return s === "PAID" || s === "SUCCESS" || s === "COMPLETED";
}

function toneFromSub(params: { isExpired?: boolean; isActive?: boolean }) {
  if (params.isExpired) return "rose" as const;
  if (params.isActive) return "emerald" as const;
  return "slate" as const;
}

/** ✅ Extract pending payment info from GET /enterprise/subscription (new shape) */
function pickPendingQr(pending: any): {
  qrUrl?: string;
  bankInfo?: RenewBankInfo;
} {
  const qrUrl =
    pending?.qrCode?.qrUrl ||
    pending?.qrCode?.qrUrl ||
    pending?.qrUrl ||
    pending?.qrCodeUrl;

  const bankInfo = pending?.qrCode?.bankInfo || pending?.bankInfo;

  return { qrUrl, bankInfo };
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

  // modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<RenewBankInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<RenewPaymentInfo | null>(null);

  // GET /payment/{ref} result
  const [payment, setPayment] = useState<PendingPayment | null>(null);

  const pollRef = useRef<number | null>(null);

  // ✅ auto open plan modal when navigated with state
  useEffect(() => {
    const shouldOpen = (location.state as any)?.openPlanModal === true;
    if (shouldOpen) setPlanModalOpen(true);
  }, [location.state]);

  // auto select plan
  useEffect(() => {
    if (!selectedPlanId && plans.length) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (code: string) => {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await triggerPayment(code).unwrap();
        const p = (res as any)?.data ?? null;
        if (p) setPayment(p);

        if (isPaidStatus(p?.status)) {
          stopPolling();
          setPayModalOpen(false);
          refetchSub();
        }
      } catch {
        // silent
      }
    }, 3000);
  };

  useEffect(() => {
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterpriseName = payload?.enterpriseName ?? "Doanh nghiệp";
  const statusTone = toneFromSub({
    isActive: sub?.isActive,
    isExpired: sub?.isExpired,
  });

  const statusLabel = useMemo(() => {
    if (!payload) return "—";
    if (sub?.isExpired) return "Hết hạn";
    if (sub?.isActive) return "Đang hoạt động";
    return payload.enterpriseStatus || "Không rõ";
  }, [payload, sub?.isActive, sub?.isExpired]);

  const remainingLabel = useMemo(() => {
    const tr = sub?.timeRemaining;
    if (!tr) return "—";
    return `${tr.days} ngày ${tr.hours} giờ ${tr.minutes} phút`;
  }, [sub?.timeRemaining]);

  const pendingRefCode = (pendingFromGet as any)?.referenceCode as
    | string
    | undefined;
  const hasPendingPayment = Boolean(pendingRefCode);

  /** ✅ Resume pending payment: set QR + bankInfo + paymentInfo from GET subscription */
  const resumePayment = () => {
    if (!pendingFromGet?.referenceCode) return;

    const ref = pendingFromGet.referenceCode as string;
    const { qrUrl: q, bankInfo: b } = pickPendingQr(pendingFromGet);

    // ✅ fill UI immediately from GET /enterprise/subscription
    setReferenceCode(ref);
    setQrUrl(q ?? null);
    setBankInfo((b as RenewBankInfo) ?? null);

    // paymentInfo is used as fallback in modal (planName, expiresAt, status, amount)
    // get-subscription pendingPayment doesn't include currency/description/durationMonths -> fill reasonable defaults
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

    setPaymentInfo(payFallback);

    // open modal + polling
    setPayModalOpen(true);
    startPolling(ref);

    // (optional) fetch immediately once so createdAt/status updates faster
    triggerPayment(ref);
  };

  const onSubmitPlan = async () => {
    if (!selectedPlanId) return;

    try {
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

        // fetch immediately once
        triggerPayment(code);
        return;
      }

      refetchSub();
    } catch (e) {
      console.error("Create payment failed:", e);
    }
  };

  const globalLoading = isLoadingSub || isLoadingPlans;
  const globalError = isSubError || isPlansError;

  if (globalLoading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center p-4 sm:p-6">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner color="blue" size="12" inline />
          <div className="text-sm font-semibold text-slate-600">
            Đang tải thông tin gói...
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header sticky kiểu profile */}
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Pending payment banner */}
        {hasPendingPayment ? (
          <Card className="border-amber-200">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone="amber">Chờ thanh toán</Badge>
                  <div className="font-bold text-slate-900 truncate">
                    Bạn có 1 giao dịch đang chờ
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Mã: <span className="font-semibold">{pendingRefCode}</span>
                </div>
              </div>

              <Button onClick={resumePayment}>Tiếp tục thanh toán</Button>
            </div>
          </Card>
        ) : null}

        {/* HERO */}
        <Card>
          <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-emerald-700" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 truncate">
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

        {/* Stats */}
        {sub ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Gói hiện tại"
              value={sub.planName ?? "—"}
              sub={`Chu kỳ: ${sub.durationMonths ?? 0} tháng`}
              icon={CreditCard}
            />
            <StatCard
              title="Giá"
              value={`${formatNumber(sub.price ?? 0)} VNĐ`}
              sub="Theo chu kỳ hiện tại"
              icon={CreditCard}
            />
            <StatCard
              title="Còn lại"
              value={remainingLabel}
              sub={`Hết hạn: ${fmtDate(sub.endDate)}`}
              icon={Timer}
            />
          </div>
        ) : (
          <Card>
            <EmptyState
              title="Chưa có thông tin gói"
              desc="Doanh nghiệp chưa kích hoạt gói hoặc hệ thống chưa trả về dữ liệu."
              right={
                <Button onClick={() => setPlanModalOpen(true)}>Chọn gói</Button>
              }
            />
          </Card>
        )}

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5" hover={false}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thời gian
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                <span className="font-semibold text-slate-900">Bắt đầu:</span>
                <span>{fmtDate(sub?.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                <span className="font-semibold text-slate-900">Kết thúc:</span>
                <span>{fmtDate(sub?.endDate)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5" hover={false}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hướng dẫn
            </div>
            <div className="mt-3 text-sm text-slate-700">
              Chọn gói → tạo QR → chuyển khoản đúng nội dung → hệ thống tự cập
              nhật sau khi thanh toán thành công.
            </div>
          </Card>
        </div>
      </main>

      {/* Modal chọn plan */}
      <PlanSelectModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelect={(id) => setSelectedPlanId(id)}
        onConfirm={onSubmitPlan}
        confirming={renewState.isLoading}
      />

      {/* Modal QR/payment */}
      <PaymentQrModal
        open={payModalOpen}
        onClose={() => {
          stopPolling();
          setPayModalOpen(false);
        }}
        qrUrl={qrUrl}
        referenceCode={referenceCode}
        bankInfo={bankInfo}
        paymentInfo={paymentInfo}
        payment={payment}
        polling={Boolean(pollRef.current)}
        fetching={paymentState.isFetching}
      />
    </div>
  );
}
