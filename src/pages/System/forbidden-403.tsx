import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/store/hooks"; // hoặc hooks của bạn
import { logout } from "@/redux/feature/authSlice";
import { FiLock, FiArrowLeft, FiLogIn } from "react-icons/fi";
import endPoint from "@/router/endPoint";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBackAndReload = () => {
    if (window.history.length > 1) {
      window.history.back();
      window.setTimeout(() => window.location.reload(), 80);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleRelogin = () => {
    dispatch(logout());
    navigate(endPoint.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-teal-900 to-slate-900">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000" />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2300d4aa' stroke-width='1'%3E%3Cpath d='M10 10h80v80H10z'/%3E%3Cpath d='M20 10v80M30 10v80M40 10v80M50 10v80M60 10v80M70 10v80M80 10v80'/%3E%3Cpath d='M10 20h80M10 30h80M10 40h80M10 50h80M10 60h80M10 70h80M10 80h80'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-xl w-full animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 px-8 pt-8 pb-6 space-y-6 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-linear-to-br from-rose-400 to-orange-500 rounded-full opacity-10 blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 blur-xl" />

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-rose-100 to-orange-100 shadow-lg">
              <FiLock className="w-10 h-10 text-rose-600" />
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-semibold text-slate-900 tracking-tight">
                403
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                Forbidden — Bạn không có quyền truy cập
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trang này không thuộc phạm vi quyền hạn của tài khoản hiện tại.
                Vui lòng liên hệ quản trị viên nếu cần thêm quyền truy cập.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleBackAndReload}
              className="group px-5 py-3 text-sm font-semibold text-teal-700 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/50 hover:border-teal-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center">
                <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Quay lại
              </span>
            </button>

            <button
              onClick={handleRelogin}
              className="group px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center">
                <FiLogIn className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Đăng nhập lại
              </span>
            </button>
          </div>

          <div className="pt-4 text-center border-t border-slate-200/60">
            <p className="text-xs text-slate-500">
              © Greenpoint. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
