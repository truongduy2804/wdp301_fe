// filepath: src/pages/Admin/Redemptions/index.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  Calendar,
  User,
  Gift as GiftIcon,
  Coins,
  Loader2,
  Filter,
} from "lucide-react";
import dayjs from "dayjs";
import {
  cx,
  Card,
  Badge,
  EmptyState,
  Dropdown,
} from "@/components/ui/page/componentUI";
import { fetchRedemptions } from "@/api/admin/gift";
import type { Redemption } from "@/api/types/gift.types";

// ============================================================================
// Main Component
// ============================================================================

export default function AdminRedemptions() {
  // State
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");

  // Load redemptions on mount
  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRedemptions();
      setRedemptions(data);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Không thể tải lịch sử đổi quà";
      setError(errorMsg);
      console.error("Failed to load redemptions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter redemptions
  const filteredRedemptions = useMemo(() => {
    let result = [...redemptions];

    // Search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (r) =>
          r.user.fullName.toLowerCase().includes(query) ||
          r.user.email.toLowerCase().includes(query) ||
          r.gift.name.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[dateFilter];
      const cutoff = dayjs().subtract(days, "day");
      result = result.filter((r) => dayjs(r.createdAt).isAfter(cutoff));
    }

    return result;
  }, [redemptions, searchQuery, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalRedemptions: redemptions.length,
      totalPoints: redemptions.reduce((sum, r) => sum + Math.abs(r.amount), 0),
      uniqueUsers: new Set(redemptions.map((r) => r.userId)).size,
    };
  }, [redemptions]);

  // Render
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRedemptions}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-8 space-y-4">
        {/* Header Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5">
                  <History className="h-5 w-5 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Lịch sử đổi quà
                  </h1>
                  <p className="text-sm text-slate-600">
                    Theo dõi lịch sử người dùng đổi điểm lấy quà
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
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
                  placeholder="Tìm theo người dùng, quà tặng..."
                  className="w-64 bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Date Filter */}
              <Dropdown<typeof dateFilter>
                icon={Calendar}
                label="Thời gian"
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "7d", label: "7 ngày qua" },
                  { value: "30d", label: "30 ngày qua" },
                  { value: "90d", label: "90 ngày qua" },
                ]}
                minWidth={160}
              />
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <History className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tổng lượt đổi</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalRedemptions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3">
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tổng điểm đã đổi</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Số người dùng</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.uniqueUsers}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Redemptions List */}
        <Card className="p-4 sm:p-5">
          {filteredRedemptions.length === 0 ? (
            <EmptyState
              title="Chưa có lịch sử đổi quà"
              desc={
                searchQuery || dateFilter !== "all"
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc"
                  : "Chưa có người dùng nào đổi quà"
              }
            />
          ) : (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-slate-600 border-b border-slate-200">
                <div className="col-span-3">Người dùng</div>
                <div className="col-span-3">Quà tặng</div>
                <div className="col-span-2 text-center">Điểm</div>
                <div className="col-span-2 text-center">Thời gian</div>
                <div className="col-span-2 text-center">Trạng thái</div>
              </div>

              {/* Table Rows */}
              {filteredRedemptions.map((redemption) => (
                <RedemptionRow key={redemption.id} redemption={redemption} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Redemption Row Component
// ============================================================================

interface RedemptionRowProps {
  redemption: Redemption;
}

function RedemptionRow({ redemption }: RedemptionRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
      {/* User Info */}
      <div className="col-span-1 md:col-span-3">
        <div className="flex items-center gap-3">
          {redemption.user.avatar ? (
            <img
              src={redemption.user.avatar}
              alt={redemption.user.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">
              {redemption.user.fullName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {redemption.user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Gift Info */}
      <div className="col-span-1 md:col-span-3">
        <div className="flex items-center gap-3">
          {redemption.gift.imageUrl ? (
            <img
              src={redemption.gift.imageUrl}
              alt={redemption.gift.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <GiftIcon className="h-5 w-5 text-amber-600" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">
              {redemption.gift.name}
            </p>
            <p className="text-xs text-slate-500">
              ID: {redemption.gift.id}
            </p>
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
        <div className="flex items-center gap-1.5 text-amber-600">
          <Coins className="h-4 w-4" />
          <span className="font-bold">{Math.abs(redemption.amount)}</span>
        </div>
      </div>

      {/* Time */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">
            {dayjs(redemption.createdAt).format("DD/MM/YYYY")}
          </p>
          <p className="text-xs text-slate-500">
            {dayjs(redemption.createdAt).format("HH:mm")}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
        <Badge tone="emerald">Hoàn tất</Badge>
      </div>
    </div>
  );
}
