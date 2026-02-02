import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Phone, User2 } from "lucide-react";

import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";
import TagPill from "../components/tagPill";

type Props = {
  data: EnterpriseReport[];
  onView: (id: number) => void;
  onPrefetchDetail?: (id: number) => void;
};

function formatInlineDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.format("HH:mm")} | ${d.format("DD/MM/YYYY")}`;
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
        width: 90,
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
        width: 220,
        render: (_: unknown, r: EnterpriseReport) => {
          const name = (r as any)?.citizen?.fullName ?? "—";
          return (
            <div className="inline-flex items-center gap-2 justify-center min-w-0 w-full">
              <User2 className="h-4 w-4 text-slate-500 shrink-0" />
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
        width: 160,
        render: (_: unknown, r: EnterpriseReport) => {
          const phone = (r as any)?.citizen?.phone ?? "—";
          return (
            <div className="inline-flex items-center gap-2 justify-center">
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
        ellipsis: { showTitle: false },
        render: (v: string) => (
          <Tooltip destroyOnHidden title={v}>
            <span className="block w-full min-w-0 truncate">{v}</span>
          </Tooltip>
        ),
      },

      {
        title: <div className="text-center font-semibold">Thời gian duyệt</div>,
        key: "time",
        align: "center",
        width: 220,
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
        width: 140,
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
        width: 140,
        render: (_: unknown, r: EnterpriseReport) => (
          <div className="inline-flex items-center justify-center">
            <button
              onMouseEnter={() => onPrefetchDetail?.(r.id)}
              onClick={() => onView(r.id)}
              className="
                inline-flex items-center gap-2 rounded-xl
                border border-slate-200 bg-white px-2 py-1.5
                text-sm font-semibold text-slate-700
                whitespace-nowrap
                transition-all duration-200 ease-out
                hover:-translate-y-[1px] hover:shadow-sm
                hover:border-emerald-200 hover:bg-emerald-50/60
              "
            >
              <Eye className="h-4 w-4 shrink-0" />
              Xem
            </button>
          </div>
        ),
      },
    ];
  }, [onView, onPrefetchDetail]);

  return (
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
  );
}
