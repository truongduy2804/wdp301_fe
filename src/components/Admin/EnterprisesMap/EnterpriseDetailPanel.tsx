// src/components/Admin/EnterprisesMap/EnterpriseDetailPanel.tsx
import React, { useEffect, useState } from "react";
import {
  X,
  Building2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  MapPin,
  Calendar,
  Trash2,
} from "lucide-react";
import type { EnterpriseDetailMap } from "@/api/admin/enterprise-map";
import { fetchEnterpriseDetailMap } from "@/api/admin/enterprise-map";
import { motion, AnimatePresence } from "framer-motion";
import { translateStatus } from "@/utils/statusTranslation";

interface EnterpriseDetailPanelProps {
  enterpriseId: number | null;
  onClose: () => void;
}

const EnterpriseDetailPanel: React.FC<EnterpriseDetailPanelProps> = ({
  enterpriseId,
  onClose,
}) => {
  const [enterprise, setEnterprise] = useState<EnterpriseDetailMap | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (enterpriseId) {
      const loadDetail = async () => {
        setIsLoading(true);
        try {
          const data = await fetchEnterpriseDetailMap(enterpriseId);
          setEnterprise(data);
        } catch (err) {
          console.error("Failed to load enterprise detail:", err);
          setEnterprise(null);
        } finally {
          setIsLoading(false);
        }
      };
      loadDetail();
    } else {
      setEnterprise(null);
    }
  }, [enterpriseId]);

  return (
    <AnimatePresence>
      {enterpriseId && (
        <>
          {/* Overlay for mobile/tablet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[1200] lg:hidden"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] z-[1300] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Chi tiết doanh nghiệp
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-32 bg-slate-100 rounded-2xl w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="h-20 bg-slate-100 rounded-xl" />
                    <div className="h-20 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ) : enterprise ? (
                <div className="space-y-6">
                  {/* Hero Section */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {enterprise.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            enterprise.status === "ACTIVE"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-600 text-white"
                          }`}
                        >
                          {translateStatus(enterprise.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        SĐT liên hệ
                      </p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {enterprise.contactPhone || enterprise.phone || "---"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Công suất (Kg)
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {enterprise.capacityKg || "---"}
                      </p>
                    </div>
                    <div className="bg-slate-100/50 border border-slate-100 p-4 rounded-xl col-span-2">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Trạng thái hoạt động
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${enterprise.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                        />
                        <p
                          className={`text-sm font-bold ${enterprise.status === "ACTIVE" ? "text-emerald-700" : "text-slate-600"}`}
                        >
                          {translateStatus(enterprise.status || "OFFLINE")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address & Contact Info */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-slate-700">
                        <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            Email liên hệ
                          </p>
                          <p className="text-sm font-medium leading-relaxed">
                            {enterprise.contactEmail ||
                              enterprise.email ||
                              "---"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-slate-700">
                        <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            Địa chỉ
                          </p>
                          <p className="text-sm font-medium leading-relaxed">
                            {enterprise.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collectors */}
                  {Array.isArray(enterprise.collectors) &&
                    enterprise.collectors.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[2px]">
                          Nhân viên thu gom ({enterprise.collectors.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {enterprise.collectors.map((collector, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {collector.avatar ? (
                                  <img
                                    src={collector.avatar}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {collector.fullName}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {collector.phone}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-emerald-50">
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Không tìm thấy dữ liệu doanh nghiệp.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnterpriseDetailPanel;
