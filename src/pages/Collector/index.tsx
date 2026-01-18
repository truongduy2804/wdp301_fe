import { Link } from "react-router-dom";

export default function CollectorDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">
          Collector Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Xem việc được giao, cập nhật trạng thái và xác nhận hoàn tất bằng ảnh.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
            to="/collector/jobs"
          >
            Jobs
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/collector/on-the-way"
          >
            On the way
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/collector/completed"
          >
            Completed
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/collector/issues"
          >
            Issues
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Today</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">5 jobs</p>
          <p className="text-sm text-slate-600 mt-1">
            2 done • 1 on the way • 2 assigned
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">This week</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">21 jobs</p>
          <p className="text-sm text-slate-600 mt-1">Completion rate: 92%</p>
        </div>
      </div>
    </div>
  );
}
