// filepath: src/pages/Admin/Gifts/index.tsx

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Gift as GiftIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Package,
  Coins,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import {
  cx,
  Card,
  Button,
  Badge,
  Modal,
  EmptyState,
} from "@/components/ui/page/componentUI";
import ConfirmModal from "@/pages/Enterprise/components/confirmModal";
import Pagination from "@/components/Pagination";
import {
  fetchGifts,
  createGift,
  updateGift,
  toggleGiftActive,
  deleteGift,
} from "@/api/admin/gift";
import type {
  Gift,
  GiftType,
  CreateGiftDto,
  UpdateGiftDto,
} from "@/api/types/gift.types";

const GIFT_TYPE_OPTIONS: Array<{ value: GiftType; label: string }> = [
  { value: "FOOD", label: "Ăn uống" },
  { value: "SHOPPING", label: "Mua sắm" },
  { value: "OTHER", label: "Khác" },
];

function getGiftTypeLabel(type: GiftType): string {
  return GIFT_TYPE_OPTIONS.find((option) => option.value === type)?.label || type;
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminGifts() {
  const PAGE_SIZE = 9;

  // State
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load gifts on mount
  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGifts();
      setGifts(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Không thể tải danh sách quà tặng";
      setError(errorMsg);
      console.error("Failed to load gifts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter gifts
  const filteredGifts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return gifts;
    return gifts.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
    );
  }, [gifts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGifts.length / PAGE_SIZE));

  const paginatedGifts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredGifts.slice(start, start + PAGE_SIZE);
  }, [filteredGifts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers
  const handleCreate = () => {
    setEditingGift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gift: Gift) => {
    setEditingGift(gift);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (giftId: number) => {
    try {
      const updated = await toggleGiftActive(giftId);
      setGifts((prev) =>
        prev.map((g) => (g.id === giftId ? updated : g))
      );
      toast.success(
        updated.isActive ? "Đã mở quà tặng" : "Đã khóa quà tặng",
        { autoClose: 1400 }
      );
    } catch (err) {
      console.error("Failed to toggle gift:", err);
      toast.error("Không thể thay đổi trạng thái quà tặng");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteGift(deleteTarget.id);
      setGifts((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Xóa quà tặng thành công", { autoClose: 1400 });
    } catch (err) {
      console.error("Failed to delete gift:", err);
      toast.error("Không thể xóa quà tặng");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGift(null);
  };

  const handleSaveSuccess = () => {
    loadGifts();
    handleModalClose();
  };

  // Render
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadGifts}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <GiftIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Quản lý quà tặng
                  </h1>
                  <p className="text-sm text-slate-600">
                    Quản lý quà tặng đổi điểm thưởng cho người dùng
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
                  "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
                  "focus-within:ring-2 focus-within:ring-emerald-200"
                )}
              >
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm quà tặng..."
                  className="w-48 bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Tạo quà tặng
              </Button>
            </div>
          </div>

          {/* Gift List */}
          {filteredGifts.length === 0 ? (
            <EmptyState
              title="Chưa có quà tặng"
              desc="Tạo quà tặng đầu tiên để người dùng có thể đổi điểm"
              right={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  Tạo quà tặng
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedGifts.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                totalItems={filteredGifts.length}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <GiftFormModal
          gift={editingGift}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={<div className="w-full text-center text-xl font-semibold">Xác nhận xóa quà tặng</div>}
        content={
          <div className="w-full py-2 text-center text-lg font-normal text-slate-900 leading-7">
            Bạn có chắc muốn xóa quà tặng {deleteTarget?.name}?
          </div>
        }
        okText="Xóa"
        cancelText="Hủy"
        tone="rose"
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        onOk={handleConfirmDelete}
      />
    </div>
  );
}

// ============================================================================
// Gift Card Component
// ============================================================================

interface GiftCardProps {
  gift: Gift;
  onEdit: (gift: Gift) => void;
  onToggleActive: (giftId: number) => void;
  onDelete: (gift: Gift) => void;
}

function GiftCard({ gift, onEdit, onToggleActive, onDelete }: GiftCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleActive(gift.id);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={cx(
        "relative rounded-2xl border bg-white p-4 shadow-sm transition-all",
        gift.isActive
          ? "border-slate-200 hover:border-emerald-300"
          : "border-slate-200 bg-slate-50"
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {gift.isActive ? (
          <Badge tone="emerald">Đang mở</Badge>
        ) : (
          <Badge tone="rose" className="!bg-red-500 !text-white shadow-md">
            Đã khóa
          </Badge>
        )}
      </div>

      {/* Image */}
      <div className="mb-3 h-40 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className={cx(
              "h-full w-full object-cover transition-all",
              !gift.isActive && "grayscale brightness-50 opacity-60"
            )}
          />
        ) : (
          <ImageIcon className={cx(
            "h-12 w-12 transition-all",
            gift.isActive ? "text-slate-300" : "text-slate-400 grayscale opacity-40"
          )} />
        )}
      </div>

      {/* Info */}
      <h3 className={cx(
        "font-semibold text-slate-900 mb-1 pr-20 transition-opacity",
        !gift.isActive && "opacity-50"
      )}>{gift.name}</h3>
      <div className="mb-2">
        <Badge tone="slate">{getGiftTypeLabel(gift.type)}</Badge>
      </div>
      {gift.description && (
        <p className={cx(
          "text-sm text-slate-600 mb-3 line-clamp-2 transition-opacity",
          !gift.isActive && "opacity-50"
        )}>
          {gift.description}
        </p>
      )}

      {/* Stats */}
      <div className={cx(
        "flex items-center gap-4 mb-4 text-sm transition-opacity",
        !gift.isActive && "opacity-50"
      )}>
        <div className="flex items-center gap-1.5 text-amber-600">
          <Coins className="h-4 w-4" />
          <span className="font-semibold">{gift.requiredPoints}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Package className="h-4 w-4" />
          <span>Tồn: {gift.stock}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(gift)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Sửa
        </button>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={cx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
            gift.isActive
              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
              : "bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-md hover:shadow-lg transform hover:scale-105"
          )}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
          {gift.isActive ? "Khóa" : "Mở"}
        </button>
        <button
          onClick={() => onDelete(gift)}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center"
          aria-label={`Xóa quà tặng ${gift.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Gift Form Modal
// ============================================================================

interface GiftFormModalProps {
  gift: Gift | null;
  onClose: () => void;
  onSuccess: () => void;
}

function GiftFormModal({ gift, onClose, onSuccess }: GiftFormModalProps) {
  const isEditing = !!gift;

  // Form state
  const [name, setName] = useState(gift?.name || "");
  const [type, setType] = useState<GiftType>(gift?.type || "SHOPPING");
  const [description, setDescription] = useState(gift?.description || "");
  const [requiredPoints, setRequiredPoints] = useState(
    gift?.requiredPoints?.toString() || ""
  );
  const [stock, setStock] = useState(gift?.stock?.toString() || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    gift?.imageUrl || null
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh tối đa 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Vui lòng nhập tên quà tặng");
      return;
    }
    if (!requiredPoints || Number(requiredPoints) < 1) {
      setError("Điểm yêu cầu phải lớn hơn 0");
      return;
    }
    if (!stock || Number(stock) < 0) {
      setError("Số lượng tồn kho không hợp lệ");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditing) {
        // Update existing gift
        const dto: UpdateGiftDto = {
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          requiredPoints: Number(requiredPoints),
          stock: Number(stock),
        };
        if (imageFile) {
          dto.image = imageFile;
        }
        await updateGift(gift.id, dto);
        toast.success("Cập nhật quà tặng thành công", { autoClose: 1400 });
      } else {
        // Create new gift
        const dto: CreateGiftDto = {
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          requiredPoints: Number(requiredPoints),
          stock: Number(stock),
        };
        if (imageFile) {
          dto.image = imageFile;
        }
        await createGift(dto);
        toast.success("Tạo quà tặng thành công", { autoClose: 1400 });
      }

      onSuccess();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMsg);
      console.error("Failed to save gift:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={isEditing ? "Chỉnh sửa quà tặng" : "Tạo quà tặng mới"}
      onClose={onClose}
      widthClass="max-w-3xl"
    >
      <div className="p-6">

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên quà tặng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voucher VinMart 50k"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loại quà tặng <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GiftType)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            >
              {GIFT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về quà tặng..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
            />
          </div>

          {/* Points and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Điểm yêu cầu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(e.target.value)}
                placeholder="500"
                min="1"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số lượng tồn <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="100"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hình ảnh
            </label>
            {imagePreview && (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Định dạng: JPG, PNG. Tối đa 5MB
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
