// src/components/Admin/EnterprisesMap/FilterSidebar.tsx
import React from "react";
import { Filter, CheckCircle2, AlertCircle, Ban, Clock, Ghost } from "lucide-react";

interface FilterSidebarProps {
    currentStatus: string;
    onStatusChange: (status: string) => void;
}

const statusOptions = [
    { value: "ACTIVE", label: "Đang hoạt động", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { value: "PENDING", label: "Đang chờ duyệt", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { value: "BANNED", label: "Đã bị khoá", icon: Ban, color: "text-red-500", bg: "bg-red-50" },
    { value: "EXPIRED", label: "Hết hạn", icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-50" },
    { value: "OFFLINE", label: "Ngoại tuyến", icon: Ghost, color: "text-slate-400", bg: "bg-slate-100" },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ currentStatus, onStatusChange }) => {
    return (
        <div className="w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-4 h-full flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Filter className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Bộ lọc trạng thái</h3>
            </div>

            <div className="flex flex-col gap-2">
                {statusOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onStatusChange(opt.value)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${currentStatus === opt.value
                                ? `${opt.bg} ${opt.color} ring-1 ring-inset ring-current font-semibold`
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <opt.icon className="w-5 h-5" />
                        <span className="text-sm">{opt.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <p>Chọn trạng thái để hiển thị các doanh nghiệp tương ứng trên bản đồ.</p>
            </div>
        </div>
    );
};

export default FilterSidebar;
