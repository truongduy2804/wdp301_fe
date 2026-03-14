import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

type PendingPayment = {
  referenceCode?: string;
  status?: string;
};

export function usePendingPaymentToast(params: {
  pendingPayment?: PendingPayment | null;
  onResumePayment: () => void;
}) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;

    const { pendingPayment, onResumePayment } = params;

    if (!pendingPayment) return;

    const status = (pendingPayment.status ?? "").toUpperCase();

    if (status !== "PENDING") return;

    shownRef.current = true;

    const TOAST_ID = "enterprise-pending-payment";

    toast.info(
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="flex-1 text-sm leading-5 text-slate-700">
            Bạn đang có một giao dịch thanh toán chưa hoàn tất. Hãy tiếp tục
            thanh toán để kích hoạt gói dịch vụ.
          </div>

          <button
            className="
              shrink-0 mt-[10px]
              rounded-lg border border-emerald-200 bg-emerald-50
              px-3 py-1.5 text-xs font-semibold text-emerald-800
              hover:bg-emerald-100 hover:border-emerald-300
              active:scale-[0.98] transition
            "
            onClick={() => {
              toast.dismiss(TOAST_ID);
              onResumePayment();
            }}
            type="button"
          >
            Thanh toán ngay
          </button>
        </div>
      </div>,
      {
        autoClose: 7000,
        closeOnClick: false,
        pauseOnHover: true,
        toastId: TOAST_ID,
      },
    );
  }, [params]);
}
