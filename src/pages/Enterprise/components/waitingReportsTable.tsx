import React, { useMemo, useRef, useSyncExternalStore } from "react";
import dayjs from "dayjs";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, CheckCircle2, XCircle, Lock, Clock } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";

import TagPill from "./tagPill";
import ConfirmModal from "./confirmModal";
import { useConfirm } from "@/hooks/useConfirm";

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

function shortenText(value?: string | null, max = 56) {
  const text = value?.trim();
  if (!text) return "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
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
const COUNTDOWN_PLACEHOLDER = "--:--";

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
      now = Date.now();
      cb();
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

function useCountdownHydrated(enabled = true) {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setHydrated(false);
      return;
    }

    setHydrated(true);
  }, [enabled]);

  return hydrated;
}

/** ✅ theo dõi hết hạn "đúng thời điểm" */
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
  const hydrated = useCountdownHydrated();
  const right = expiryText(props.expMs);

  if (!hydrated) {
    return (
      <Tooltip destroyOnHidden title={`Hết hạn lúc ${right}`}>
        <span
          className={[
            "inline-flex items-center justify-center",
            "rounded-full border px-3 py-1",
            "tabular-nums font-medium",
            "border-slate-200 bg-slate-50 text-slate-400",
          ].join(" ")}
        >
          {COUNTDOWN_PLACEHOLDER}
        </span>
      </Tooltip>
    );
  }

  const msLeftRaw = props.expMs - now;
  const expired = msLeftRaw <= 0;
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

  // ✅ confirm controller
  confirm: ReturnType<typeof useConfirm>;
}) {
  const {
    r,
    loading,
    expiredAt,
    onView,
    onPrefetchDetail,
    onAccept,
    onReject,
    confirm,
  } = props;

  const { expired } = useExpiredFlag(expiredAt);

  // ✅ chỉ nút vừa bấm mới hiện spinner
  const lastActionRef = useRef<"accept" | "reject" | null>(null);
  const showAcceptSpin = loading && lastActionRef.current === "accept";
  const showRejectSpin = loading && lastActionRef.current === "reject";

  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:inline-flex lg:w-auto lg:flex-nowrap lg:justify-center lg:gap-1.5 lg:whitespace-nowrap">
      {/* View luôn cho phép */}
      <button
        onMouseEnter={() => onPrefetchDetail?.(r.id)}
        onClick={() => onView(r.id)}
        className="
          inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl
          border border-slate-200 bg-white px-3 py-2
          text-sm font-medium text-slate-700
          transition-all duration-200 ease-out
          hover:-translate-y-[1px] hover:shadow-sm
          hover:border-emerald-200 hover:bg-emerald-50/60
          lg:flex-none lg:px-2 lg:py-1.5 lg:text-xs
        "
      >
        <Eye className="h-4 w-4 shrink-0" />
        Xem
      </button>

      {/* ✅ hết hạn thì ẩn Duyệt/Từ chối */}
      {expired ? (
        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 lg:w-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Hết hạn</span>
        </span>
      ) : (
        <>
          <button
            disabled={loading}
            onClick={() => {
              lastActionRef.current = "accept";

              confirm.ask({
                title: `Xác nhận duyệt đơn #${r.id}`,
                content:
                  "Bạn chắc chắn muốn duyệt đơn này? Thao tác không thể hoàn tác.",
                okText: "Duyệt",
                cancelText: "Huỷ",
                tone: "emerald",
                onOk: () => onAccept(r.id),
              });
            }}
            className="
              inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl
              bg-emerald-600 px-3 py-2
              text-sm font-medium text-white
              transition-all duration-200 ease-out
              hover:-translate-y-[1px] hover:shadow-sm
              hover:bg-emerald-700 active:bg-emerald-800
              disabled:opacity-70
              lg:flex-none lg:px-2 lg:py-1.5 lg:text-xs
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

              confirm.ask({
                title: `Xác nhận từ chối đơn #${r.id}`,
                content:
                  "Bạn chắc chắn muốn từ chối đơn này? Thao tác không thể hoàn tác.",
                okText: "Từ chối",
                cancelText: "Huỷ",
                tone: "rose",
                onOk: () => onReject(r.id),
              });
            }}
            className="
              inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl
              bg-rose-600 px-3 py-2
              text-sm font-medium text-white
              transition-all duration-200 ease-out
              hover:-translate-y-[1px] hover:shadow-sm
              hover:bg-rose-700 active:bg-rose-800
              disabled:opacity-70
              lg:flex-none lg:px-2 lg:py-1.5 lg:text-xs
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
  const confirm = useConfirm();

  /** DESKTOP columns */
  const columnsDesktop: ColumnsType<EnterpriseReport> = useMemo(() => {
    return [
      {
        title: <div className="text-center font-semibold">Mã đơn</div>,
        dataIndex: "id",
        key: "id",
        align: "center",
        width: 84,
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
        align: "center",
        width: 210,
        ellipsis: { showTitle: false },
        render: (v: string) => (
          <Tooltip destroyOnHidden title={v}>
            <span className="block w-full min-w-0 truncate text-sm">{v}</span>
          </Tooltip>
        ),
      },
      {
        title: <div className="text-center font-semibold">Mô tả</div>,
        dataIndex: "description",
        key: "description",
        align: "center",
        width: 200,
        ellipsis: { showTitle: false },
        render: (v?: string | null) => {
          const value = v?.trim() || "—";
          const compactValue = shortenText(v, 52);

          return (
            <Tooltip destroyOnHidden title={value}>
              <span className="block w-full min-w-0 truncate text-sm">
                {compactValue}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Trạng thái</div>,
        key: "status",
        align: "center",
        width: 136,
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
        width: 176,
        render: (_: unknown, r: EnterpriseReport) => (
          <ExpiryCell expiredAt={r.expiredAt} />
        ),
      },
      {
        title: <div className="text-center font-semibold">Thao tác</div>,
        key: "actions",
        align: "center",
        width: 210,
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
              confirm={confirm}
            />
          );
        },
      },
    ];
  }, [actionLoadingId, onAccept, onReject, onView, onPrefetchDetail, confirm]);

  /** MOBILE columns */
  const columnsMobile: ColumnsType<EnterpriseReport> = useMemo(() => {
    return [
      {
        title: null,
        key: "mobileCard",
        render: (_: unknown, r: EnterpriseReport) => {
          const loading = actionLoadingId === r.id;
          const status = (r as any)?.status ?? "PENDING";

          return (
            <div className="p-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-extrabold text-slate-900 tabular-nums">
                        #{r.id}
                      </div>
                      <StatusPillLive status={status} expiredAt={r.expiredAt} />
                    </div>

                    <div className="mt-2 text-sm font-medium text-slate-700 break-words">
                      {r.address}
                    </div>

                    <div className="mt-1 text-sm text-slate-500 break-words">
                      {r.description?.trim() || "Không có mô tả"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">
                      Hết hạn:{" "}
                    </span>
                    <span className="min-w-0 break-words">
                      <ExpiryCell expiredAt={r.expiredAt} />
                    </span>
                  </div>
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
                    confirm={confirm}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
    ];
  }, [actionLoadingId, onAccept, onReject, onView, onPrefetchDetail, confirm]);

  return (
    <>
      <div className="w-full">
        {/* MOBILE */}
        <div className="block lg:hidden">
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
        <div className="hidden lg:block">
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

      {/* ✅ Confirm modal (fast, inline, no createRoot) */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.cfg?.title ?? ""}
        content={confirm.cfg?.content ?? ""}
        okText={confirm.cfg?.okText}
        cancelText={confirm.cfg?.cancelText}
        tone={confirm.cfg?.tone}
        loading={confirm.loading}
        onClose={confirm.close}
        onOk={confirm.ok}
      />
    </>
  );
});

export default WaitingReportsTable;
