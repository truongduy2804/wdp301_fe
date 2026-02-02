import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackAndReload = () => {
    // Nếu user có history để back
    if (window.history.length > 1) {
      // Back bằng history của browser
      window.history.back();

      // Đợi route đổi xong rồi reload trang đó
      window.setTimeout(() => {
        window.location.reload();
      }, 80);

      return;
    }

    // Nếu user vào thẳng URL 404 (không có history) -> về trang chủ
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-teal-900 to-slate-900">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4aa' fill-opacity='0.12'%3E%3Cpath d='M36 30c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-xl w-full animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 px-8 pt-8 pb-6 space-y-6 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-linear-to-br from-teal-400 to-cyan-500 rounded-full opacity-10 blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 blur-xl" />

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-teal-100 to-cyan-100 shadow-lg">
              <FiSearch className="w-10 h-10 text-teal-600" />
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-black text-slate-900 tracking-tight">
                404
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Không tìm thấy trang
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                URL bạn nhập không tồn tại hoặc đã bị thay đổi.
              </p>

              <div className="mt-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-semibold">Đường dẫn:</span>{" "}
                {location.pathname}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Back + Refresh */}
            <button
              onClick={handleBackAndReload}
              className="group px-5 py-3 text-sm font-semibold text-teal-700 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/50 hover:border-teal-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center">
                <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Quay lại
              </span>
            </button>
          </div>

          <div className="pt-4 text-center border-t border-slate-200/60">
            <p className="text-xs text-slate-500">
              © EcoNet. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
