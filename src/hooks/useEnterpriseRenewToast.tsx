import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

function daysUntil(endIso?: string | null) {
  if (!endIso) return null;

  const end = new Date(endIso).getTime();
  if (Number.isNaN(end)) return null;

  const diffMs = end - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function useEnterpriseRenewSoonToast(params: {
  enterpriseStatus?: string | null;
  subIsActive?: boolean;
  subIsExpired?: boolean;
  endDate?: string | null;
  onRenewNow: () => void;
}) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;

    const { enterpriseStatus, subIsActive, subIsExpired, endDate, onRenewNow } =
      params;

    const status = (enterpriseStatus ?? "").toUpperCase();

    const isEnterpriseExpired = status === "EXPIRED";

    const dayLeft = daysUntil(endDate);

    const SOON_TOAST_ID = "renew-soon-on-enter";
    const EXPIRED_TOAST_ID = "renew-expired-on-enter";

    /** ===============================
     *  Case 1: Enterprise expired
     *  =============================== */
    if (isEnterpriseExpired || subIsExpired) {
      shownRef.current = true;

      toast.info(
        <div className="w-full">
          <div className="flex items-start gap-3">
            <div className="flex-1 text-sm leading-5 text-slate-700">
              Gói dịch vụ của bạn đã hết hạn. Hãy gia hạn ngay để tiếp tục sử
              dụng và tránh gián đoạn.
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
                toast.dismiss(EXPIRED_TOAST_ID);
                onRenewNow();
              }}
              type="button"
            >
              Gia hạn ngay
            </button>
          </div>
        </div>,
        {
          autoClose: 7000,
          closeOnClick: false,
          pauseOnHover: true,
          toastId: EXPIRED_TOAST_ID,
        },
      );

      return;
    }

    /** ===============================
     *  Case 2: Expiring soon
     *  =============================== */
    if (!subIsActive) return;
    if (!dayLeft || dayLeft < 1 || dayLeft > 5) return;

    shownRef.current = true;

    toast.info(
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="flex-1 text-sm leading-5 text-slate-700">
            {dayLeft === 1
              ? "Gói dịch vụ sẽ hết hạn trong 1 ngày. Gia hạn để tránh gián đoạn."
              : `Gói dịch vụ sẽ hết hạn trong ${dayLeft} ngày. Gia hạn để tránh gián đoạn.`}
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
              toast.dismiss(SOON_TOAST_ID);
              onRenewNow();
            }}
            type="button"
          >
            Gia hạn ngay
          </button>
        </div>
      </div>,
      {
        autoClose: 6000,
        closeOnClick: false,
        pauseOnHover: true,
        toastId: SOON_TOAST_ID,
      },
    );
  }, [params]);
}
