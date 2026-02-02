// src/components/Admin/EnterprisesMap/FilterSidebar.tsx
import React, { useState } from "react";
import { Filter, CheckCircle2, AlertCircle, Ban, Clock, Ghost, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterSidebarProps {
    currentStatus: string;
    onStatusChange: (status: string) => void;
}

const statusOptions = [
    { value: "", label: "Tất cả", icon: Filter, color: "text-slate-600", bg: "bg-slate-50" },
    { value: "ACTIVE", label: "Đang hoạt động", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { value: "OFFLINE", label: "Ngoại tuyến", icon: Ghost, color: "text-slate-400", bg: "bg-slate-100" },
    { value: "BANNED", label: "Đã bị khoá", icon: Ban, color: "text-red-500", bg: "bg-red-50" },
    { value: "EXPIRED", label: "Hết hạn", icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-50" },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ currentStatus, onStatusChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="relative h-full flex items-start">
            <motion.div
                animate={{
                    width: isCollapsed ? 0 : 220,
                    opacity: isCollapsed ? 0 : 1,
                    marginRight: isCollapsed ? 0 : 12
                }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden h-fit max-h-[260px]"
            >
                <div className="p-3 w-[220px] flex flex-col max-h-full">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-emerald-600" />
                            <h3 className="font-bold text-slate-800 text-xs">Bộ lọc trạng thái</h3>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(opt.value)}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-xs ${currentStatus === opt.value
                                    ? `${opt.bg} ${opt.color} ring-1 ring-inset ring-current font-semibold`
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <opt.icon className="w-4 h-4" />
                                <span>{opt.label}</span>
                            </button>
                        ))}

                        <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-500">
                            <p>Chọn trạng thái để hiển thị các doanh nghiệp tương ứng trên bản đồ.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Toggle Button when collapsed */}
            <AnimatePresence>
                {isCollapsed && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsCollapsed(false)}
                        className="p-3 bg-white shadow-lg border border-slate-100 rounded-2xl text-emerald-600 hover:text-emerald-700 transition-all hover:shadow-xl active:scale-95 group flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="text-xs font-bold text-slate-800 pr-1 group-hover:inline hidden transition-all">Bộ lọc trạng thái</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterSidebar;
