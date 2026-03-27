import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  RefreshCw,
  Search,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui/page/componentUI";
import { formatDateTime, formatNumber } from "@/utils/format";
import {
  createSubscriptionPlan,
  fetchSubscriptionPlanById,
  fetchSubscriptionPlans,
  removeSubscriptionPlan,
  updateSubscriptionPlan,
} from "@/api/admin/subscriptionPlans";
import type {
  CreateSubscriptionPlanDto,
  SubscriptionPlan,
  UpdateSubscriptionPlanDto,
} from "@/api/types/subscriptionPlan.types";

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q),
    );
  }, [plans, searchQuery]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriptionPlans();
      setPlans(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải danh sách gói subscription";
      setError(message);
      console.error("Error loading subscription plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setOpenForm(true);
  };

  const openEdit = async (plan: SubscriptionPlan) => {
    try {
      setActionLoading(true);
      const detail = await fetchSubscriptionPlanById(plan.id);
      setEditingPlan(detail);
      setOpenForm(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết gói";
      toast.error(message, { autoClose: 1700 });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await removeSubscriptionPlan(deleteTarget.id);
      toast.success("Xử lý xóa gói thành công!", { autoClose: 1400 });
      setDeleteTarget(null);
      await loadPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xóa gói";
      toast.error(message, { autoClose: 1700 });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card className="p-3 sm:p-4 overflow-visible">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-2.5">
                  <CreditCard className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Quản lí gói Đăng kí
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Tạo mới, cập nhật, xóa hoặc ngưng hoạt động gói đăng ký.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
              <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors focus-within:ring-2 focus-within:ring-emerald-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên gói..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 max-w-[52vw] bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Button
                variant="ghost"
                onClick={loadPlans}
                disabled={loading}
                className="!h-9 !rounded-xl !px-3 !bg-white !border !border-slate-200 !text-slate-800 !font-medium hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800 active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed transition-all duration-200 ease-out shadow-sm hover:shadow"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-700" : "text-slate-600"}`} />
                  {loading ? "Đang tải..." : "Tải lại"}
                </span>
              </Button>

              <Button onClick={openCreate} className="!h-9 !rounded-xl !px-3">
                <Plus className="h-4 w-4" />
                Tạo gói
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 overflow-hidden">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              <span className="ml-3 text-slate-600 font-semibold">Đang tải...</span>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-slate-600 font-medium">Không có gói subscription nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên gói</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Mô tả</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Giá</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Thời hạn</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày tạo</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{plan.name}</td>
                      <td className="px-4 py-3 text-slate-700">{plan.description || "-"}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{formatNumber(Number(plan.price || 0))} đ</td>
                      <td className="px-4 py-3 text-slate-900">{plan.durationMonths} tháng</td>
                      <td className="px-4 py-3">
                        {plan.isActive ? (
                          <Badge tone="emerald">Đang hoạt động</Badge>
                        ) : (
                          <Badge tone="rose">Ngưng hoạt động</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDateTime(plan.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(plan)}
                            disabled={actionLoading}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                          <button
                            onClick={() => setDeleteTarget(plan)}
                            disabled={actionLoading}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {openForm && (
        <SubscriptionPlanFormModal
          plan={editingPlan}
          onClose={() => {
            if (actionLoading) return;
            setOpenForm(false);
            setEditingPlan(null);
          }}
          onSaved={async () => {
            setOpenForm(false);
            setEditingPlan(null);
            await loadPlans();
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[1500] bg-black/45" onClick={() => !actionLoading && setDeleteTarget(null)}>
          <div className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl">
            <div onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa gói</h3>
              <p className="mt-2 text-sm text-slate-600">Bạn có chắc muốn xóa hoặc ngưng hoạt động gói này?</p>
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 break-all">{deleteTarget.name}</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={actionLoading}
                  className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionPlanFormModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const isEdit = !!plan;
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(plan?.name || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [price, setPrice] = useState(String(plan?.price ?? ""));
  const [durationMonths, setDurationMonths] = useState(String(plan?.durationMonths ?? ""));
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    durationMonths?: string;
  }>({});

  const validateForm = () => {
    const nextErrors: {
      name?: string;
      description?: string;
      price?: string;
      durationMonths?: string;
    } = {};

    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    const parsedDuration = Number(durationMonths);

    if (!trimmedName) {
      nextErrors.name = "Tên gói không được để trống";
    } else if (trimmedName.length > 100) {
      nextErrors.name = "Tên gói tối đa 100 ký tự";
    }

    if (description.trim().length > 500) {
      nextErrors.description = "Mô tả tối đa 500 ký tự";
    }

    if (price.trim() === "") {
      nextErrors.price = "Giá không được để trống";
    } else if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = "Giá phải là số lớn hơn hoặc bằng 0";
    }

    if (durationMonths.trim() === "") {
      nextErrors.durationMonths = "Thời hạn không được để trống";
    } else if (
      Number.isNaN(parsedDuration) ||
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 1
    ) {
      nextErrors.durationMonths = "Thời hạn phải là số nguyên từ 1 tháng";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const parsedPrice = Number(price);
    const parsedDuration = Number(durationMonths);

    try {
      setSubmitting(true);

      if (isEdit && plan) {
        const payload: UpdateSubscriptionPlanDto = {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          durationMonths: parsedDuration,
          isActive,
        };
        await updateSubscriptionPlan(plan.id, payload);
        toast.success("Cập nhật gói thành công!", { autoClose: 1400 });
      } else {
        const payload: CreateSubscriptionPlanDto = {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          durationMonths: parsedDuration,
          isActive,
        };
        await createSubscriptionPlan(payload);
        toast.success("Tạo gói thành công!", { autoClose: 1400 });
      }

      await onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi khi lưu gói";
      toast.error(message, { autoClose: 1800 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-black/45" onClick={() => !submitting && onClose()}>
      <div className="fixed left-1/2 top-1/2 w-[94vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl">
        <div onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900">
            {isEdit ? "Cập nhật gói Đăng kí" : "Tạo gói Đăng kí mới"}
          </h3>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Tên gói</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={`h-10 w-full rounded-xl bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:ring-1 ${
                  fieldErrors.name
                    ? "border border-red-300 focus:border-red-500 focus:ring-red-300"
                    : "border border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="Ví dụ: Gói Cơ Bản"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                rows={3}
                className={`w-full rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-1 ${
                  fieldErrors.description
                    ? "border border-red-300 focus:border-red-500 focus:ring-red-300"
                    : "border border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="Mô tả ngắn gói subscription"
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Giá (VND)</label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (fieldErrors.price) {
                      setFieldErrors((prev) => ({ ...prev, price: undefined }));
                    }
                  }}
                  className={`h-10 w-full rounded-xl bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:ring-1 ${
                    fieldErrors.price
                      ? "border border-red-300 focus:border-red-500 focus:ring-red-300"
                      : "border border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {fieldErrors.price && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.price}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Thời hạn (tháng)</label>
                <input
                  type="number"
                  min={1}
                  value={durationMonths}
                  onChange={(e) => {
                    setDurationMonths(e.target.value);
                    if (fieldErrors.durationMonths) {
                      setFieldErrors((prev) => ({ ...prev, durationMonths: undefined }));
                    }
                  }}
                  className={`h-10 w-full rounded-xl bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:ring-1 ${
                    fieldErrors.durationMonths
                      ? "border border-red-300 focus:border-red-500 focus:ring-red-300"
                      : "border border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {fieldErrors.durationMonths && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.durationMonths}</p>
                )}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 pt-1 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Hoạt động
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isEdit ? "Cập nhật" : "Tạo gói"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
