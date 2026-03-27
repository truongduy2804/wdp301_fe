// src/pages/Admin/SystemMonitor.tsx
import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Settings2,
  Server,
} from "lucide-react";

import {
  Card,
} from "@/components/ui/page/componentUI";
import {
  fetchAdminSystemConfig,
  updateAdminSystemConfig,
} from "@/api/admin/dashboard";
import type {
  AdminSystemConfig,
  UpdateAdminSystemConfigPayload,
} from "@/api/types/admin.types";
import { formatDateTime, formatNumber } from "@/utils/format";

export default function AdminSystemMonitor() {
  const [systemConfig, setSystemConfig] = useState<AdminSystemConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [configDraft, setConfigDraft] = useState<UpdateAdminSystemConfigPayload>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | null>(null);

  const configFieldMeta: Array<{
    key: keyof UpdateAdminSystemConfigPayload;
    label: string;
    step?: string;
  }> = [
    { key: "citizenBasePoint", label: "Điểm cơ bản công dân", step: "1" },
    { key: "organicMultiplier", label: "Hệ số rác hữu cơ", step: "0.1" },
    { key: "recyclableMultiplier", label: "Hệ số rác tái chế", step: "0.1" },
    { key: "hazardousMultiplier", label: "Hệ số rác nguy hại", step: "0.1" },
    { key: "accuracyMatchMultiplier", label: "Hệ số khớp chính xác", step: "0.1" },
    { key: "accuracyModerateMultiplier", label: "Hệ số khớp vừa phải", step: "0.1" },
    { key: "accuracyHeavyMultiplier", label: "Hệ số sai lệch", step: "0.1" },
    { key: "collectorMatchTrustScore", label: "Điểm tin cậy nhân viên", step: "1" },
    { key: "penaltyWeightMismatch", label: "Phạt sai cân nặng", step: "1" },
    { key: "penaltyUnauthorizedFee", label: "Phạt phí sai", step: "1" },
    { key: "penaltyNoShow", label: "Phạt không có mặt", step: "1" },
    { key: "penaltyDefault", label: "Phạt mặc định", step: "1" },
    { key: "citizenCompensation", label: "Bồi thường công dân", step: "1" },
  ];

  useEffect(() => {
    const loadSystemConfig = async () => {
      try {
        setConfigLoading(true);
        const config = await fetchAdminSystemConfig();
        setSystemConfig(config);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể tải cấu hình hệ thống.";
        setConfigMessage(message);
      } finally {
        setConfigLoading(false);
      }
    };

    loadSystemConfig();
  }, []);

  const startEditingConfig = () => {
    if (!systemConfig) return;
    setConfigDraft({
      citizenBasePoint: systemConfig.citizenBasePoint,
      organicMultiplier: systemConfig.organicMultiplier,
      recyclableMultiplier: systemConfig.recyclableMultiplier,
      hazardousMultiplier: systemConfig.hazardousMultiplier,
      accuracyMatchMultiplier: systemConfig.accuracyMatchMultiplier,
      accuracyModerateMultiplier: systemConfig.accuracyModerateMultiplier,
      accuracyHeavyMultiplier: systemConfig.accuracyHeavyMultiplier,
      collectorMatchTrustScore: systemConfig.collectorMatchTrustScore,
      penaltyWeightMismatch: systemConfig.penaltyWeightMismatch,
      penaltyUnauthorizedFee: systemConfig.penaltyUnauthorizedFee,
      penaltyNoShow: systemConfig.penaltyNoShow,
      penaltyDefault: systemConfig.penaltyDefault,
      citizenCompensation: systemConfig.citizenCompensation,
    });
    setConfigMessage(null);
    setIsEditingConfig(true);
  };

  const handleConfigValueChange = (
    key: keyof UpdateAdminSystemConfigPayload,
    rawValue: string,
  ) => {
    const value = rawValue === "" ? undefined : Number(rawValue);
    setConfigDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSystemConfig = async () => {
    if (!systemConfig) return;

    const changedPayload: UpdateAdminSystemConfigPayload = {};
    for (const meta of configFieldMeta) {
      const key = meta.key;
      const newValue = configDraft[key];
      if (newValue === undefined) continue;
      if (newValue !== systemConfig[key]) {
        changedPayload[key] = newValue;
      }
    }

    if (Object.keys(changedPayload).length === 0) {
      setConfigMessage("Không có thay đổi để lưu.");
      setIsEditingConfig(false);
      return;
    }

    try {
      setConfigSaving(true);
      setConfigMessage(null);
      const updated = await updateAdminSystemConfig(changedPayload);
      setSystemConfig(updated);
      setConfigMessage("Cập nhật cấu hình thành công.");
      setIsEditingConfig(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể cập nhật cấu hình hệ thống.";
      setConfigMessage(message);
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Server className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Cấu hình hệ thống
                  </h1>
                  <p className="text-sm text-slate-600">
                    Quản lý hệ số điểm và các tham số hệ thống.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cấu hình tính điểm hệ thống</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Cập nhật: {systemConfig ? formatDateTime(systemConfig.updatedAt) : "-"}
              </span>
              {!isEditingConfig ? (
                <button
                  type="button"
                  onClick={startEditingConfig}
                  disabled={!systemConfig || configLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Cập nhật cấu hình
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingConfig(false);
                      setConfigMessage(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    disabled={configSaving}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={saveSystemConfig}
                    className="rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={configSaving}
                  >
                    {configSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {configLoading ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 w-fit">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang tải cấu hình...
            </div>
          ) : systemConfig ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {configFieldMeta.map((field) => (
                <div key={field.key} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">{field.label}</p>
                  {isEditingConfig ? (
                    <input
                      type="number"
                      step={field.step ?? "1"}
                      value={configDraft[field.key] ?? ""}
                      onChange={(e) => handleConfigValueChange(field.key, e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-900">
                      {formatNumber((systemConfig[field.key] as number | undefined) ?? 0)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có dữ liệu cấu hình hệ thống.</p>
          )}

          {configMessage && (
            <p className="mt-3 text-sm font-medium text-emerald-700">{configMessage}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
