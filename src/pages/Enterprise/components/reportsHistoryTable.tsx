import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, MapPin, Phone, User2 } from "lucide-react";

import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";
import TagPill from "./tagPill";

type Props = {
  data: EnterpriseReport[];
  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;
};

function formatInlineDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.format("HH:mm")} • ${d.format("DD/MM/YYYY")}`;
}

function shortenText(value?: string | null, max = 52) {
  const text = value?.trim() || "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function ViewButton({
  id,
  onView,
  onPrefetchDetail,
  fullWidth = false,
}: {
  id: number;
  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onMouseEnter={() => onPrefetchDetail?.(id)}
      onClick={() => onView(id)}
      type="button"
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700",
        "transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-sm",
        "hover:border-emerald-200 hover:bg-emerald-50/60",
        fullWidth ? "w-full" : "whitespace-nowrap px-2.5 py-1.5",
      ].join(" ")}
    >
      <Eye className="h-4 w-4 shrink-0" />
      Xem
    </button>
  );
}

export default function ReportsHistoryTable({
  data,
  onView,
  onPrefetchDetail,
}: Props) {
  const columns: ColumnsType<EnterpriseReport> = useMemo(() => {
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
        title: <div className="text-center font-semibold">Họ tên</div>,
        key: "fullName",
        align: "center",
        width: 180,
        render: (_: unknown, r: EnterpriseReport) => {
          const name = (r as any)?.citizen?.fullName ?? "—";
          return (
            <div className="inline-flex min-w-0 w-full items-center justify-center gap-2">
              <User2 className="h-4 w-4 shrink-0 text-slate-500" />
              <Tooltip destroyOnHidden title={name}>
                <span className="min-w-0 truncate font-semibold text-slate-800">
                  {name}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">SĐT</div>,
        key: "phone",
        align: "center",
        width: 146,
        render: (_: unknown, r: EnterpriseReport) => {
          const phone = (r as any)?.citizen?.phone ?? "—";
          return (
            <div className="inline-flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              {phone !== "—" ? (
                <a
                  className="font-semibold text-slate-700 hover:underline tabular-nums"
                  href={`tel:${phone}`}
                >
                  {phone}
                </a>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Địa chỉ</div>,
        dataIndex: "address",
        key: "address",
        align: "left",
        width: 240,
        ellipsis: { showTitle: false },
        render: (value?: string | null) => {
          const display = value?.trim() || "—";
          return (
            <Tooltip destroyOnHidden title={display}>
              <span className="block w-full min-w-0 truncate text-slate-700">
                {display}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Thời gian duyệt</div>,
        key: "time",
        align: "center",
        width: 168,
        render: (_: unknown, r: EnterpriseReport) => {
          const iso = (r as any)?.sentAt ?? (r as any)?.createdAt ?? null;
          return (
            <span className="text-slate-700 tabular-nums">
              {formatInlineDateTime(iso)}
            </span>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Trạng thái</div>,
        key: "status",
        align: "center",
        width: 132,
        render: (_: unknown, r: EnterpriseReport) => {
          const status = String((r as any)?.status ?? "PENDING").toUpperCase();
          return (
            <div className="flex justify-center">
              <TagPill kind="reportStatus" value={status} />
            </div>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Thao tác</div>,
        key: "actions",
        align: "center",
        width: 112,
        render: (_: unknown, r: EnterpriseReport) => (
          <div className="inline-flex items-center justify-center">
            <ViewButton
              id={r.id}
              onView={onView}
              onPrefetchDetail={onPrefetchDetail}
            />
          </div>
        ),
      },
    ];
  }, [onView, onPrefetchDetail]);

  return (
    <div className="w-full">
      <div className="hidden lg:block">
        <Table
          rowKey={(r) => r.id}
          columns={columns}
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

      <div className="space-y-3 lg:hidden">
        {data.map((report) => {
          const name = (report as any)?.citizen?.fullName ?? "—";
          const phone = (report as any)?.citizen?.phone ?? "—";
          const status = String(
            (report as any)?.status ?? "PENDING",
          ).toUpperCase();
          const iso =
            (report as any)?.sentAt ?? (report as any)?.createdAt ?? null;
          const address = report.address?.trim() || "—";

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Mã đơn
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    #{report.id}
                  </div>
                </div>
                <TagPill kind="reportStatus" value={status} />
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <User2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Họ tên</div>
                    <Tooltip destroyOnHidden title={name}>
                      <div className="truncate font-semibold text-slate-800">
                        {name}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Số điện thoại</div>
                    {phone !== "—" ? (
                      <a
                        className="font-semibold text-slate-700 hover:underline tabular-nums"
                        href={`tel:${phone}`}
                      >
                        {phone}
                      </a>
                    ) : (
                      <div className="text-slate-500">—</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Địa chỉ</div>
                    <Tooltip destroyOnHidden title={address}>
                      <div className="break-words text-slate-700">
                        {shortenText(address, 88)}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Thời gian duyệt</div>
                  <div className="mt-1 text-slate-700 tabular-nums">
                    {formatInlineDateTime(iso)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ViewButton
                  id={report.id}
                  onView={onView}
                  onPrefetchDetail={onPrefetchDetail}
                  fullWidth
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
