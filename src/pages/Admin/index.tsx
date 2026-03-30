import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">
          Bảng điều khiển quản trị
        </h1>
        <p className="text-slate-600 mt-1">
          Quản trị hệ thống, người dùng, phân quyền, giám sát và xử lý khiếu
          nại.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
            to="/admin/users"
          >
            Quản lí người dùng
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/admin/roles"
          >
            Vai trò
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/admin/monitoring"
          >
            Giám sát
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/admin/complaints"
          >
            Khiếu nại
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { k: "Người dùng", v: "1,248" },
          { k: "Báo cáo đang hoạt động", v: "342" },
          { k: "Khiếu nại chưa giải quyết", v: "7" },
        ].map((x) => (
          <div
            key={x.k}
            className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100"
          >
            <p className="text-sm text-slate-500">{x.k}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
