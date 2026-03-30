import React, { memo, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Mail, Phone, UserCircle2 } from "lucide-react";
import type {
  Collector,
  CollectorStatus,
} from "@/redux/api/enterprise/collectors/types";
import TagPill from "../components/tagPill";

type Props = {
  data: Collector[];
  busy?: boolean;
  onView: (id: number) => void;
  onEdit: (row: Collector) => void;
  onDelete: (row: Collector) => void;
};

function Avatar({ src, name }: { src: string | null; name: string | null }) {
  const [broken, setBroken] = useState(false);

  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).slice(0, 2);
    return parts
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("");
  }, [name]);

  if (!src || broken) {
    return (
      <div className="h-10 w-10 rounded-full border border-slate-300 bg-slate-200 grid place-items-center shrink-0 overflow-hidden">
        <UserCircle2 className="h-8 w-8 text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? "avatar"}
      className="h-10 w-10 rounded-2xl border border-slate-200 object-cover bg-slate-100 shrink-0"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

function CollectorsTable({ data, busy, onView, onEdit, onDelete }: Props) {
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-slate-700 [&>th]:font-semibold">
            <th className="text-center w-[90px]">ID</th>
            <th className="text-center min-w-[280px]">Nhân sự</th>
            <th className="text-center min-w-[220px]">Email</th>
            <th className="text-center w-[170px]">SĐT</th>
            <th className="text-center w-[160px]">Trạng thái</th>
            <th className="text-center w-[260px]">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr
              key={r.id}
              className="transition-colors duration-200 hover:bg-emerald-50/30"
            >
              <td className="px-4 py-3 text-center font-semibold tabular-nums text-slate-900">
                #{r.id}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={r.avatar ?? null} name={r.fullName ?? null} />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {r.fullName ?? "—"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 truncate">
                      {(r as any).employeeCode
                        ? `M\u00e3: ${(r as any).employeeCode}`
                        : (r as any).enterpriseName
                          ? `DN: ${(r as any).enterpriseName}`
                          : " "}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-slate-700">
                <div className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{r.email ?? "—"}</span>
                </div>
              </td>

              <td className="px-4 py-3 text-slate-700">
                <div className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="tabular-nums">{r.phone ?? "—"}</span>
                </div>
              </td>

              <td className="px-4 py-3 text-center">
                <TagPill
                  kind="collectorStatus"
                  value={(r.status ?? "OFFLINE") as CollectorStatus}
                />
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2 flex-nowrap whitespace-nowrap">
                  <button
                    onClick={() => onView(r.id)}
                    className="
                      inline-flex items-center gap-1 rounded-xl
                      border border-slate-200 bg-white px-2 py-1.5
                      text-sm font-semibold text-slate-700
                      transition-all duration-200 ease-out
                      hover:-translate-y-[1px] hover:shadow-sm
                      hover:border-emerald-200 hover:bg-emerald-50/60
                    "
                  >
                    <Eye className="h-4 w-4" />
                    Xem
                  </button>

                  <button
                    disabled={busy}
                    onClick={() => onEdit(r)}
                    className="
                      inline-flex items-center gap-1 rounded-xl
                      bg-emerald-600 px-2 py-1.5
                      text-sm font-semibold text-white
                      transition-all duration-200 ease-out
                      hover:-translate-y-[1px] hover:shadow-sm
                      hover:bg-emerald-700 active:bg-emerald-800
                      disabled:opacity-70
                    "
                  >
                    <Pencil className="h-4 w-4" />
                    Sửa
                  </button>

                  <button
                    disabled={busy}
                    onClick={() => onDelete(r)}
                    className="
                      inline-flex items-center gap-1 rounded-xl
                      bg-rose-600 px-2 py-1.5
                      text-sm font-semibold text-white
                      transition-all duration-200 ease-out
                      hover:-translate-y-[1px] hover:shadow-sm
                      hover:bg-rose-700 active:bg-rose-800
                      disabled:opacity-70
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                    Xoá
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(CollectorsTable);
