import { Link } from "react-router-dom";

export default function EnterpriseDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">
          Enterprise Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Nhận yêu cầu thu gom, điều phối collector, báo cáo tái chế.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
            to="/enterprise/requests"
          >
            Requests
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/enterprise/dispatch"
          >
            Dispatch
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/enterprise/assignments"
          >
            Assignments
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/enterprise/reports"
          >
            Reports
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-900">Quick status</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>
            • Pending requests: <b>18</b>
          </li>
          <li>
            • Assigned today: <b>12</b>
          </li>
          <li>
            • Collected today: <b>9</b>
          </li>
        </ul>
      </div>
    </div>
  );
}
