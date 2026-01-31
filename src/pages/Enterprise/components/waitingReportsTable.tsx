import React, { useMemo, useSyncExternalStore } from "react";
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

function toMs(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function formatCountdownAbs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** ✅ clamp: hết hạn thì dừng ở 00:00 (không âm) */
function formatCountdownClamp(ms: number): string {
  return formatCountdownAbs(Math.max(0, ms));
}

function expiryText(ms: number) {
  return `${dayjs(ms).format("h:mm A")} | ${dayjs(ms).format("DD/MM/YYYY")}`;
}

const LIVE_WINDOW_MS = 60 * 60 * 1000;

/** 1 interval duy nhất cho bảng (chỉ chạy khi có subscriber) */
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

const ExpiryLive = React.memo(function ExpiryLive(props: {
  expMs: number;
  sendMs: number;
}) {
  const now = useSharedNowMs();
  const msLeftRaw = props.expMs - now;
  const expired = msLeftRaw <= 0;

  const right = expiryText(props.expMs);
  const ttl = Math.max(0, props.expMs - props.sendMs);

  return (
    <Tooltip
      destroyOnHidden
      title={
        <div style={{ display: "grid", gap: 6 }}>
          <div>
            <b>Hết hạn lúc:</b> {right}
          </div>
          <div>
            <b>{expired ? "Đã hết hạn:" : "Còn lại:"}</b>{" "}
            {formatCountdownClamp(msLeftRaw)}
          </div>
          <div>
            <b>TTL:</b> {formatCountdownAbs(ttl)}
          </div>
        </div>
      }
    >
      <span
        className={[
          "font-semibold tabular-nums",
          expired ? "text-slate-500" : "text-slate-900",
        ].join(" ")}
      >
        {formatCountdownClamp(msLeftRaw)}
      </span>
    </Tooltip>
  );
});

const ExpiryCell = React.memo(function ExpiryCell(props: {
  expiredAt?: string | null;
  sentAt?: string | null;
}) {
  const expMs = toMs(props.expiredAt);
  const sendMs = toMs(props.sentAt);
  if (!expMs || !sendMs) return <span className="text-slate-500">—</span>;

  const msLeftNow = expMs - Date.now();

  // xa hơn 60 phút thì hiển thị dạng timestamp
  if (msLeftNow > LIVE_WINDOW_MS) {
    const right = expiryText(expMs);
    return (
      <Tooltip destroyOnHidden title={`Hết hạn lúc ${right}`}>
        <span className="text-slate-600">{right}</span>
      </Tooltip>
    );
  }

  return <ExpiryLive expMs={expMs} sendMs={sendMs} />;
});

const ActionButtons = React.memo(function ActionButtons(props: {
  r: EnterpriseReport;
  loading: boolean;
  expired: boolean;
  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;
  onAccept: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}) {
  const { r, loading, expired, onView, onPrefetchDetail, onAccept, onReject } =
    props;

  if (expired) {
    return (
      <span className="inline-flex items-center gap-2 text-slate-400">
        <Lock className="h-4 w-4" />
        <span className="text-sm font-medium">Hết hạn</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 flex-nowrap whitespace-nowrap">
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

      <button
        disabled={loading}
        onClick={() =>
          confirmAcceptReport({
            reportId: r.id,
            disabled: loading,
            onOk: () => onAccept(r.id),
          })
        }
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
        {loading ? (
          <LoadingSpinner color="white" size="4" inline />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        )}
        Duyệt
      </button>

      <button
        disabled={loading}
        onClick={() =>
          confirmRejectReport({
            reportId: r.id,
            disabled: loading,
            onOk: () => onReject(r.id),
          })
        }
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
        {loading ? (
          <LoadingSpinner color="white" size="4" inline />
        ) : (
          <XCircle className="h-4 w-4 shrink-0" />
        )}
        Từ chối
      </button>
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
  /** ✅ DESKTOP columns */
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
        align: "center",
        render: (v: string) => (
          <Tooltip destroyOnHidden title={v}>
            <span className="inline-block max-w-[420px] truncate align-middle">
              {v}
            </span>
          </Tooltip>
        ),
      },
      {
        title: <div className="text-center font-semibold">Trạng thái</div>,
        key: "status",
        align: "center",
        width: 170,
        render: (_: unknown, r: EnterpriseReport) => {
          const status = (r as any)?.status ?? "PENDING";
          return (
            <div className="inline-flex justify-center">
              <TagPill kind="reportStatus" value={status} />
            </div>
          );
        },
      },
      {
        title: (
          <div className="text-center font-semibold">Thời gian hết hạn</div>
        ),
        key: "expiry",
        align: "center",
        width: 260,
        render: (_: unknown, r: EnterpriseReport) => (
          <ExpiryCell expiredAt={r.expiredAt} sentAt={r.sentAt} />
        ),
      },
      {
        title: <div className="text-center font-semibold">Thao tác</div>,
        key: "actions",
        align: "center",
        width: 320,
        shouldCellUpdate: (r, prev) =>
          r.id === actionLoadingId || prev.id === actionLoadingId,
        render: (_: unknown, r: EnterpriseReport) => {
          const expMs = toMs(r.expiredAt);
          const expired = expMs ? expMs - Date.now() <= 0 : false;
          const loading = actionLoadingId === r.id;

          return (
            <ActionButtons
              r={r}
              loading={loading}
              expired={expired}
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

  /** ✅ MOBILE columns: 1 cột dạng “card” */
  const columnsMobile: ColumnsType<EnterpriseReport> = useMemo(() => {
    return [
      {
        title: null,
        key: "mobileCard",
        render: (_: unknown, r: EnterpriseReport) => {
          const expMs = toMs(r.expiredAt);
          const expired = expMs ? expMs - Date.now() <= 0 : false;
          const loading = actionLoadingId === r.id;

          const status = (r as any)?.status ?? "PENDING";

          return (
            <div className="p-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-extrabold text-slate-900 tabular-nums">
                        #{r.id}
                      </div>
                      <TagPill kind="reportStatus" value={status} />
                    </div>

                    <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                      {r.address}
                    </div>
                  </div>
                </div>

                {/* Expiry */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold text-slate-800">Hết hạn:</span>
                  <span className="min-w-0">
                    <ExpiryCell expiredAt={r.expiredAt} sentAt={r.sentAt} />
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-3">
                  {expired ? (
                    <div className="text-sm text-slate-400 inline-flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Hết hạn
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onMouseEnter={() => onPrefetchDetail?.(r.id)}
                        onClick={() => onView(r.id)}
                        className="
                          flex-1 min-w-[110px]
                          inline-flex items-center justify-center gap-1 rounded-xl
                          border border-slate-200 bg-white px-3 py-2
                          text-sm font-semibold text-slate-700
                          hover:border-emerald-200 hover:bg-emerald-50/60
                          transition
                        "
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                        Xem
                      </button>

                      <button
                        disabled={loading}
                        onClick={() =>
                          confirmAcceptReport({
                            reportId: r.id,
                            disabled: loading,
                            onOk: () => onAccept(r.id),
                          })
                        }
                        className="
                          flex-1 min-w-[110px]
                          inline-flex items-center justify-center gap-1 rounded-xl
                          bg-emerald-600 px-3 py-2
                          text-sm font-semibold text-white
                          hover:bg-emerald-700 active:bg-emerald-800
                          disabled:opacity-70
                          transition
                        "
                      >
                        {loading ? (
                          <LoadingSpinner color="white" size="4" inline />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                        Duyệt
                      </button>

                      <button
                        disabled={loading}
                        onClick={() =>
                          confirmRejectReport({
                            reportId: r.id,
                            disabled: loading,
                            onOk: () => onReject(r.id),
                          })
                        }
                        className="
                          w-full
                          inline-flex items-center justify-center gap-1 rounded-xl
                          bg-rose-600 px-3 py-2
                          text-sm font-semibold text-white
                          hover:bg-rose-700 active:bg-rose-800
                          disabled:opacity-70
                          transition
                        "
                      >
                        {loading ? (
                          <LoadingSpinner color="white" size="4" inline />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0" />
                        )}
                        Từ chối
                      </button>
                    </div>
                  )}
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
      {/* ✅ MOBILE */}
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

      {/* ✅ DESKTOP */}
      <div className="hidden md:block">
        <Table
          rowKey={(r) => r.id}
          columns={columnsDesktop}
          dataSource={data}
          pagination={false}
          size="middle"
          tableLayout="fixed"
          className="[&_.ant-table]:bg-transparent [&_.ant-table-thead>tr>th]:text-center"
          rowClassName={() =>
            "transition-colors duration-200 hover:!bg-emerald-50/30"
          }
        />
      </div>
    </div>
  );
});

export default WaitingReportsTable;
