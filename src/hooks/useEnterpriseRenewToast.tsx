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
  enterpriseStatus?: string | null; // ✅ giữ type cho khỏi vỡ chỗ gọi, nhưng không dùng nữa
  subIsActive?: boolean;
  subIsExpired?: boolean;
  endDate?: string | null;
  onRenewNow: () => void;
}) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;

    const { subIsActive, subIsExpired, endDate, onRenewNow } = params;

    // ✅ chỉ chặn khi EXPIRED (đúng yêu cầu bạn)
    if (subIsExpired) return;

    // ✅ khuyến nghị: vẫn nên yêu cầu sub active, nếu bạn muốn hiện cho cả inactive thì bỏ dòng này
    if (!subIsActive) return;

    const dayLeft = daysUntil(endDate);
    if (!dayLeft || dayLeft < 1 || dayLeft > 5) return;

    shownRef.current = true;

    const TOAST_ID = "renew-soon-on-enter";

    toast.info(
      <div className="w-full">
        <div className="flex items-start gap-3">
          {/* Text */}
          <div className="flex-1 text-sm leading-5 text-slate-700">
            {dayLeft === 1
              ? "Gói dịch vụ sẽ hết hạn trong 1 ngày. Gia hạn để tránh gián đoạn."
              : `Gói dịch vụ sẽ hết hạn trong ${dayLeft} ngày. Gia hạn để tránh gián đoạn.`}
          </div>

          {/* Button nhỏ sát chữ */}
          <button
            className="
          shrink-0 mt-[10px]
          rounded-lg  border border-emerald-200 bg-emerald-50
          px-3 py-1.5 text-xs font-semibold text-emerald-800
          hover:bg-emerald-100 hover:border-emerald-300
          active:scale-[0.98] transition
        "
            onClick={() => {
              toast.dismiss(TOAST_ID);
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
        toastId: TOAST_ID,
      },
    );
  }, [params]);
}
