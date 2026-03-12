// src/components/ui/EnterpriseUI.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";

import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

/* ===================== Helpers ===================== */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

/* ===================== Card ===================== */
export function Card({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        hover &&
          "transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  sub,
  right,
  className,
}: {
  title: React.ReactNode;
  sub?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
          {title}
        </div>
        {sub ? <div className="text-sm text-slate-600">{sub}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/* ===================== Button ===================== */
export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
      : variant === "outline"
        ? "border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm"
        : variant === "danger"
          ? "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 shadow-sm"
          : "bg-transparent text-slate-700 hover:bg-slate-100";
  return (
    <button className={cx(base, styles, className)} {...rest}>
      {children}
    </button>
  );
}

/* ===================== Badge ===================== */
export function Badge({
  children,
  tone = "emerald",
  className,
}: {
  children: React.ReactNode;
  tone?: "emerald" | "slate" | "amber" | "rose" | "blue";
  className?: string;
}) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    slate: "bg-slate-50 text-slate-800 border-slate-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ===================== StatCard (từ StatsPage) ===================== */
export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { label: string; positive?: boolean };
  className?: string;
}) {
  return (
    <Card className={cx("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 truncate">
            {value}
          </p>
          {sub ? <p className="mt-1 text-sm text-slate-600">{sub}</p> : null}
        </div>

        <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
          <Icon className="h-5 w-5 text-emerald-700" />
        </div>
      </div>

      {trend ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span
            className={cx(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
              trend.positive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200",
            )}
          >
            {trend.label}
          </span>
          <span className="text-xs text-slate-500">so với kỳ trước</span>
        </div>
      ) : null}
    </Card>
  );
}

/* ===================== Dropdown (SmoothSelect nâng cấp) ===================== */
type Option<T extends string> = { value: T; label: string };

export function Dropdown<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  className,
  minWidth = 220,
  align = "left",
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
  minWidth?: number;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cx("relative", className)} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "group w-full inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2",
          "shadow-sm transition-colors",
          "hover:border-emerald-300 hover:bg-emerald-50/40",
          open && "border-emerald-300",
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-emerald-700" /> : null}
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="ml-1 text-sm font-semibold text-slate-900 truncate">
          {selected}
        </span>
        <ChevronDown
          className={cx(
            "ml-auto h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            className={cx(
              "absolute mt-2 z-50 w-full",
              align === "left" ? "left-0" : "right-0",
            )}
          >
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="p-2 max-h-80 overflow-auto">
                {options.map((o) => {
                  const active = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={cx(
                        "w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-left",
                        "transition-colors",
                        active
                          ? "bg-emerald-50 text-emerald-800"
                          : "hover:bg-slate-50 text-slate-700",
                      )}
                    >
                      <span className="text-sm font-semibold">{o.label}</span>
                      {active ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Alias nếu bạn muốn gọi tên đúng như StatsPage:
export const SmoothSelect = Dropdown;

/* ===================== DateRangePill (AntD RangePicker đồng bộ UI) ===================== */
export function DateRangePill({
  value,
  onChange,
  className,
}: {
  value: [Dayjs | null, Dayjs | null];
  onChange: (v: [Dayjs | null, Dayjs | null]) => void;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
        "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
        className,
      )}
    >
      <RangePicker
        value={value}
        onChange={(v) =>
          onChange([
            (v?.[0] ?? null) as Dayjs | null,
            (v?.[1] ?? null) as Dayjs | null,
          ])
        }
        format="DD/MM/YYYY"
        allowClear
        className={cx(
          "bg-transparent border-0 shadow-none p-0",
          "[&_.ant-picker-input>input]:font-semibold",
          "[&_.ant-picker-input>input]:text-slate-900",
          "[&_.ant-picker-input>input]:text-sm",
          "[&_.ant-picker-suffix]:text-slate-400",
        )}
        classNames={{
          popup: {
            root: cx(
              "[&_.ant-picker-panel-container]:rounded-2xl",
              "[&_.ant-picker-panel-container]:shadow-xl",
              "[&_.ant-picker-panel-container]:border",
              "[&_.ant-picker-panel-container]:border-slate-200",
              "[&_.ant-picker-header]:px-3",
              "[&_.ant-picker-body]:p-3",
            ),
          },
        }}
      />
    </div>
  );
}

/* ===================== Modal ===================== */
export function Modal({
  open,
  title,
  sub,
  onClose,
  children,
  footer,
  widthClass = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  sub?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-10 flex items-start justify-center">
        <div
          className={cx(
            "w-full rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden",
            widthClass,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {title}
              </div>
              {sub ? <div className="text-sm text-slate-600">{sub}</div> : null}
            </div>
            <button
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="p-4 sm:p-5">{children}</div>

          {footer ? (
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ===================== EmptyState ===================== */
export function EmptyState({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="p-8 text-center">
      <div className="text-base font-bold text-slate-900">{title}</div>
      {desc ? <div className="mt-1 text-sm text-slate-600">{desc}</div> : null}
      {right ? <div className="mt-4 flex justify-center">{right}</div> : null}
    </div>
  );
}
