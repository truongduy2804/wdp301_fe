import { Link } from "react-router-dom";

export default function CitizenDashboard() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h1 className="text-xl font-semibold text-slate-900">
          Citizen Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Tạo báo cáo rác, theo dõi thu gom, nhận điểm thưởng và gửi phản hồi.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
            to="/citizen/report"
          >
            New report
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/citizen/my-reports"
          >
            My reports
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/citizen/rewards"
          >
            Rewards
          </Link>
          <Link
            className="px-3 py-2 rounded-xl bg-white border border-slate-200"
            to="/citizen/complaints"
          >
            Feedback
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-900">Your activity</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Reports</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">12</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Points</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">1,540</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Rank (Area)</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">#7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
