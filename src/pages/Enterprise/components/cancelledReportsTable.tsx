import React, { useMemo } from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, FileText, MapPin, User2 } from "lucide-react";

import type { CancelledEnterpriseReport } from "@/redux/api/enterprise/reports/types";

import {
  getCancellationActorClasses,
  getCancellationActorLabel,
} from "./cancelledReportUtils";

type Props = {
  data: CancelledEnterpriseReport[];
  onView: (id: number) => void;
};

function MetaPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function shortenText(value?: string | null, max = 52) {
  const text = value?.trim() || "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function ViewButton({
  id,
  onView,
  fullWidth = false,
}: {
  id: number;
  onView: (id: number) => void;
  fullWidth?: boolean;
}) {
  return (
    <button
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

export default function CancelledReportsTable({ data, onView }: Props) {
  const columns: ColumnsType<CancelledEnterpriseReport> = useMemo(() => {
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
        title: <div className="text-center font-semibold">Người tạo đơn</div>,
        key: "citizen",
        align: "center",
        width: 180,
        render: (_: unknown, report: CancelledEnterpriseReport) => {
          const name = report.citizen?.fullName ?? "—";
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
        title: <div className="text-center font-semibold">Địa chỉ</div>,
        dataIndex: "address",
        key: "address",
        align: "left",
        width: 228,
        ellipsis: { showTitle: false },
        render: (value?: string | null) => {
          const display = value?.trim() || "—";
          return (
            <Tooltip destroyOnHidden title={display}>
              <span className="block min-w-0 truncate text-slate-700">
                {display}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Mô tả</div>,
        dataIndex: "description",
        key: "description",
        align: "left",
        width: 188,
        ellipsis: { showTitle: false },
        render: (value?: string | null) => {
          const display = value?.trim() || "—";
          return (
            <Tooltip destroyOnHidden title={display}>
              <span className="block min-w-0 truncate text-slate-700">
                {shortenText(display, 48)}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: <div className="text-center font-semibold">Đơn hủy bởi</div>,
        key: "cancelMeta",
        align: "center",
        width: 154,
        render: (_: unknown, report: CancelledEnterpriseReport) => (
          <div className="flex items-center justify-center">
            <MetaPill
              label={getCancellationActorLabel(report.cancelBy)}
              className={getCancellationActorClasses(report.cancelBy)}
            />
          </div>
        ),
      },
      {
        title: <div className="text-center font-semibold">Trạng thái</div>,
        key: "status",
        align: "center",
        width: 118,
        render: () => (
          <div className="flex justify-center">
            <MetaPill
              label="Đã hủy"
              className="border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 shadow-sm"
            />
          </div>
        ),
      },
      {
        title: <div className="text-center font-semibold">Thao tác</div>,
        key: "actions",
        align: "center",
        width: 112,
        render: (_: unknown, report: CancelledEnterpriseReport) => (
          <div className="inline-flex items-center justify-center">
            <ViewButton id={report.id} onView={onView} />
          </div>
        ),
      },
    ];
  }, [onView]);

  return (
    <div className="w-full">
      <div className="hidden lg:block">
        <Table
          rowKey={(report) => report.id}
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
          const name = report.citizen?.fullName ?? "—";
          const address = report.address?.trim() || "—";
          const description = report.description?.trim() || "—";

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
                  <div className="mt-1 text-base font-bold text-slate-900">
                    #{report.id}
                  </div>
                </div>
                <MetaPill
                  label="Đã hủy"
                  className="border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 shadow-sm"
                />
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <User2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Người tạo đơn</div>
                    <Tooltip destroyOnHidden title={name}>
                      <div className="truncate font-semibold text-slate-800">
                        {name}
                      </div>
                    </Tooltip>
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

                <div className="flex items-start gap-2 text-slate-700">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Mô tả</div>
                    <Tooltip destroyOnHidden title={description}>
                      <div className="break-words text-slate-700">
                        {shortenText(description, 96)}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Đơn hủy bởi</div>
                  <div className="mt-1">
                    <MetaPill
                      label={getCancellationActorLabel(report.cancelBy)}
                      className={getCancellationActorClasses(report.cancelBy)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ViewButton id={report.id} onView={onView} fullWidth />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
