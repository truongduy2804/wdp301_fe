import React, { useMemo, useRef, useSyncExternalStore } from "react";
import dayjs from "dayjs";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, CheckCircle2, XCircle, Lock, Clock } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";
import { confirmAcceptReport, confirmRejectReport } from "./reportConfirm";
import TagPill from "./tagPill";

type Props = {
  data: EnterpriseReport[];
  actionLoadingId: number | null;

  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;

  onAccept: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
};

/** robust parse: hỗ trợ ISO / number seconds / number ms */
function toMs(v?: unknown): number | null {
  if (v == null) return null;

  if (typeof v === "number" && Number.isFinite(v)) {
    return v < 1e12 ? v * 1000 : v; // seconds -> ms
  }

  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;

    // numeric string
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      if (!Number.isFinite(n)) return null;
      return n < 1e12 ? n * 1000 : n;
    }

    const t = new Date(s).getTime();
    return Number.isFinite(t) ? t : null;
  }

  return null;
}

function expiryText(ms: number) {
  return `${dayjs(ms).format("h:mm A")} | ${dayjs(ms).format("DD/MM/YYYY")}`;
}

function formatCountdownClamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** window hiển thị countdown ở cột "Thời gian hết hạn" */
const LIVE_WINDOW_MS = 60 * 60 * 1000;

/** 1 interval duy nhất cho countdown (chỉ chạy khi có subscriber) */
const nowStore = (() => {
  let now = Date.now();
  const listeners = new Set<() => void>();
  let timer: any = null;

  const start = () => {
    if (timer) return;
    timer = globalThis.setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  };

  const stopIfIdle = () => {
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      start();
      return () => {
        listeners.delete(cb);
        stopIfIdle();
      };
    },
    getSnapshot() {
      return now;
    },
  };
})();

function useSharedNowMs() {
  return useSyncExternalStore(
    nowStore.subscribe,
    nowStore.getSnapshot,
    nowStore.getSnapshot,
  );
}

/** ✅ theo dõi hết hạn "đúng thời điểm" (không cần refresh) */
function useExpiredFlag(expiredAt?: unknown) {
  const expMs = useMemo(() => toMs(expiredAt), [expiredAt]);

  const [expired, setExpired] = React.useState(() =>
    expMs != null ? expMs <= Date.now() : false,
  );

  React.useEffect(() => {
    if (expMs == null) {
      setExpired(false);
      return;
    }

    const now = Date.now();
    if (expMs <= now) {
      setExpired(true);
      return;
    }

    setExpired(false);

    // setTimeout tới đúng thời điểm hết hạn
    const delay = expMs - now + 80; // buffer nhỏ
    const MAX = 2_147_483_647; // ~24.8 ngày
    const t = window.setTimeout(() => setExpired(true), Math.min(delay, MAX));

    return () => window.clearTimeout(t);
  }, [expMs]);

  return { expMs, expired };
}

/** ✅ status tự đổi EXPIRED khi tới hạn (chỉ override khi còn pending) */
const StatusPillLive = React.memo(function StatusPillLive(props: {
  status?: unknown;
  expiredAt?: unknown;
}) {
  const { expired } = useExpiredFlag(props.expiredAt);

  const raw = String(props.status ?? "PENDING");
  const key = raw.trim().toUpperCase();

  const shouldOverride = ["PENDING", "WAITING"].includes(key);
  const value = expired && shouldOverride ? "EXPIRED" : key;

  return <TagPill kind="reportStatus" value={value} />;
});

const ExpiryLive = React.memo(function ExpiryLive(props: { expMs: number }) {
  const now = useSharedNowMs();
  const msLeftRaw = props.expMs - now;
  const expired = msLeftRaw <= 0;

  const right = expiryText(props.expMs);

  const text = formatCountdownClamp(msLeftRaw);

  return (
    <Tooltip
      destroyOnHidden
      title={
        <div style={{ display: "grid", gap: 6 }}>
          <div>
            <b>Hết hạn lúc:</b> {right}
          </div>
          <div>
            <b>{expired ? "Đã hết hạn:" : "Còn lại:"}</b> {text}
          </div>
        </div>
      }
    >
      {/* pill countdown */}
      <span
        className={[
          "inline-flex items-center justify-center",
          "rounded-full border px-3 py-1",
          "tabular-nums font-medium",
          expired
            ? "border-slate-200 bg-slate-100 text-slate-500"
            : "border-rose-200 bg-rose-50 text-rose-700",
        ].join(" ")}
      >
        {text}
      </span>
    </Tooltip>
  );
});

const ExpiryCell = React.memo(function ExpiryCell(props: {
  expiredAt?: unknown;
}) {
  const expMs = toMs(props.expiredAt);
  if (!expMs) return <span className="text-slate-500">—</span>;

  const msLeftNow = expMs - Date.now();

  // xa hơn 60 phút thì hiển thị timestamp (không tick)
  if (msLeftNow > LIVE_WINDOW_MS) {
    const right = expiryText(expMs);
    return (
      <Tooltip destroyOnHidden title={`Hết hạn lúc ${right}`}>
        <span className="text-slate-600">{right}</span>
      </Tooltip>
    );
  }

  return <ExpiryLive expMs={expMs} />;
});

const ActionButtons = React.memo(function ActionButtons(props: {
  r: EnterpriseReport;
  loading: boolean;
  expiredAt?: unknown;

  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;
  onAccept: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}) {
  const {
    r,
    loading,
    expiredAt,
    onView,
    onPrefetchDetail,
    onAccept,
    onReject,
  } = props;

  const { expired } = useExpiredFlag(expiredAt);

  // ✅ chỉ nút vừa bấm mới hiện spinner
  const lastActionRef = useRef<"accept" | "reject" | null>(null);

  const showAcceptSpin = loading && lastActionRef.current === "accept";
  const showRejectSpin = loading && lastActionRef.current === "reject";

  return (
    <div className="inline-flex items-center gap-2 flex-nowrap whitespace-nowrap">
      {/* View luôn cho phép */}
      <button
        onMouseEnter={() => onPrefetchDetail?.(r.id)}
        onClick={() => onView(r.id)}
        className="
          inline-flex items-center gap-1 rounded-xl
          border border-slate-200 bg-white px-2 py-1.5
          text-sm font-medium text-slate-700
          transition-all duration-200 ease-out
          hover:-translate-y-[1px] hover:shadow-sm
          hover:border-emerald-200 hover:bg-emerald-50/60
        "
      >
        <Eye className="h-4 w-4 shrink-0" />
        Xem
      </button>

      {/* ✅ hết hạn thì ẩn Duyệt/Từ chối ngay lập tức */}
      {expired ? (
        <span className="inline-flex items-center gap-2 text-slate-400">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Hết hạn</span>
        </span>
      ) : (
        <>
          <button
            disabled={loading}
            onClick={() => {
              lastActionRef.current = "accept";
              confirmAcceptReport({
                reportId: r.id,
                disabled: loading,
                onOk: () => onAccept(r.id),
              });
            }}
            className="
              inline-flex items-center gap-1 rounded-xl
              bg-emerald-600 px-2 py-1.5
              text-sm font-medium text-white
              transition-all duration-200 ease-out
              hover:-translate-y-[1px] hover:shadow-sm
              hover:bg-emerald-700 active:bg-emerald-800
              disabled:opacity-70
            "
          >
            {showAcceptSpin ? (
              <LoadingSpinner color="white" size="4" inline />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            Duyệt
          </button>

          <button
            disabled={loading}
            onClick={() => {
              lastActionRef.current = "reject";
              confirmRejectReport({
                reportId: r.id,
                disabled: loading,
                onOk: () => onReject(r.id),
              });
            }}
            className="
              inline-flex items-center gap-1 rounded-xl
              bg-rose-600 px-2 py-1.5
              text-sm font-medium text-white
              transition-all duration-200 ease-out
              hover:-translate-y-[1px] hover:shadow-sm
              hover:bg-rose-700 active:bg-rose-800
              disabled:opacity-70
            "
          >
            {showRejectSpin ? (
              <LoadingSpinner color="white" size="4" inline />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            Từ chối
          </button>
        </>
      )}
    </div>
  );
});

const WaitingReportsTable = React.memo(function WaitingReportsTable({
  data,
  actionLoadingId,
  onView,
  onPrefetchDetail,
  onAccept,
  onReject,
}: Props) {
  /** DESKTOP columns */
  const columnsDesktop: ColumnsType<EnterpriseReport> = useMemo(() => {
    return [
      {
        title: <div className="text-center font-semibold">Mã đơn</div>,
        dataIndex: "id",
        key: "id",
        align: "center",
        width: 90,
        render: (id: number) => (
          <span className="font-semibold text-slate-900 tabular-nums">
            #{id}
          </span>
        ),
      },
      {
        title: <div className="text-center font-semibold">Địa chỉ</div>,
        dataIndex: "address",
        key: "address",
        align: "left",
        ellipsis: { showTitle: false },
        render: (v: string) => (
          <Tooltip destroyOnHidden title={v}>
            <span className="block w-full min-w-0 truncate">{v}</span>
          </Tooltip>
        ),
      },
      {
        title: <div className="text-center font-semibold">Trạng thái</div>,
        key: "status",
        align: "center",
        width: 170,
        render: (_: unknown, r: EnterpriseReport) => (
          <div className="inline-flex justify-center">
            <StatusPillLive
              status={(r as any)?.status ?? "PENDING"}
              expiredAt={r.expiredAt}
            />
          </div>
        ),
      },
      {
        title: (
          <div className="text-center font-semibold">Thời gian hết hạn</div>
        ),
        key: "expiry",
        align: "center",
        width: 260,
        render: (_: unknown, r: EnterpriseReport) => (
          <ExpiryCell expiredAt={r.expiredAt} />
        ),
      },
      {
        title: <div className="text-center font-semibold">Thao tác</div>,
        key: "actions",
        align: "center",
        width: 340,
        render: (_: unknown, r: EnterpriseReport) => {
          const loading = actionLoadingId === r.id;
          return (
            <ActionButtons
              r={r}
              loading={loading}
              expiredAt={r.expiredAt}
              onView={onView}
              onPrefetchDetail={onPrefetchDetail}
              onAccept={onAccept}
              onReject={onReject}
            />
          );
        },
      },
    ];
  }, [actionLoadingId, onAccept, onReject, onView, onPrefetchDetail]);

  /** MOBILE columns */
  const columnsMobile: ColumnsType<EnterpriseReport> = useMemo(() => {
    return [
      {
        title: null,
        key: "mobileCard",
        render: (_: unknown, r: EnterpriseReport) => {
          const loading = actionLoadingId === r.id;
          const status = (r as any)?.status ?? "PENDING";

          // dùng hook trong component con để auto ẩn nút khi hết hạn
          return (
            <div className="p-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-extrabold text-slate-900 tabular-nums">
                        #{r.id}
                      </div>
                      <StatusPillLive status={status} expiredAt={r.expiredAt} />
                    </div>

                    <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                      {r.address}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold text-slate-800">Hết hạn:</span>
                  <span className="min-w-0">
                    <ExpiryCell expiredAt={r.expiredAt} />
                  </span>
                </div>

                <div className="mt-3">
                  <ActionButtons
                    r={r}
                    loading={loading}
                    expiredAt={r.expiredAt}
                    onView={onView}
                    onPrefetchDetail={onPrefetchDetail}
                    onAccept={onAccept}
                    onReject={onReject}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
    ];
  }, [actionLoadingId, onAccept, onReject, onView, onPrefetchDetail]);

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="block md:hidden">
        <Table
          rowKey={(r) => r.id}
          columns={columnsMobile}
          dataSource={data}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          size="middle"
          tableLayout="fixed"
          showHeader={false}
          className="
            [&_.ant-table]:bg-transparent
            [&_.ant-table-tbody>tr>td]:!border-0
            [&_.ant-table-tbody>tr]:!bg-transparent
          "
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <Table
          rowKey={(r) => r.id}
          columns={columnsDesktop}
          dataSource={data}
          pagination={false}
          size="middle"
          tableLayout="fixed"
          className="
            [&_.ant-table]:bg-transparent
            [&_.ant-table-thead>tr>th]:text-center
            [&_.ant-table-cell]:align-middle
          "
          rowClassName={() =>
            "transition-colors duration-200 hover:!bg-emerald-50/30"
          }
        />
      </div>
    </div>
  );
});

export default WaitingReportsTable;
