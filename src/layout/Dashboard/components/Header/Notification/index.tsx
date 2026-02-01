import NotificationPanel from "./notificationPanel";

export default function EnterpriseNotificationsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Thông báo
          </h1>
          <p className="text-sm text-slate-600 font-semibold">
            Xem tất cả, lọc “Chưa đọc / Đã đọc”, và tải thêm.
          </p>
        </div>

        <NotificationPanel variant="page" />
      </div>
    </div>
  );
}
