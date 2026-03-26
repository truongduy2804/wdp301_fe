import { AlertCircle, CalendarDays, Clock3 } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Dropdown, cx } from "@/components/ui/page/componentUI";
import {
  DAY_LABELS,
  DAY_ORDER,
  SHIFT_MAP,
  SHIFT_OPTIONS,
  type DayKey,
  type ShiftValue,
  type WorkingHourFormItem,
  type WorkingHoursFormValue,
} from "@/utils/collectorWorkingHours";

function getShiftValue(item: WorkingHourFormItem): ShiftValue {
  const found = SHIFT_OPTIONS.find(
    (shift) =>
      shift.start === item.start &&
      shift.end === item.end &&
      item.active === true,
  );

  return found?.value ?? "FULL_DAY";
}

function WorkingDayCard({
  day,
  value,
  disabled,
  onToggle,
  onChangeShift,
}: {
  day: DayKey;
  value: WorkingHourFormItem;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  onChangeShift: (value: ShiftValue) => void;
}) {
  const isOff = !value.active;
  const shift = getShiftValue(value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {DAY_LABELS[day]}
          </div>
          <div className="text-xs text-slate-500">
            {isOff ? "Đang tắt ngày làm việc" : "Chọn theo ca cố định"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => !disabled && onToggle(!value.active)}
          className={cx(
            "relative h-6 w-11 rounded-full transition",
            value.active ? "bg-blue-500" : "bg-slate-300",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span
            className={cx(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
              value.active ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
      </div>

      <Dropdown<ShiftValue>
        icon={Clock3}
        label="Ca"
        value={shift}
        options={SHIFT_OPTIONS.map((shiftOption) => ({
          value: shiftOption.value,
          label: shiftOption.label,
        }))}
        onChange={onChangeShift}
        minWidth={220}
        className={cx((disabled || isOff) && "pointer-events-none opacity-50")}
      />
    </div>
  );
}

type Props = {
  value: WorkingHoursFormValue;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  onChange: (next: WorkingHoursFormValue) => void;
};

export default function WorkingHoursEditor({
  value,
  disabled,
  loading,
  error,
  title = "Lịch làm việc",
  description = "Chọn theo ca cố định cho từng ngày",
  onChange,
}: Props) {
  const updateDay = (day: DayKey, next: Partial<WorkingHourFormItem>) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        ...next,
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
          <CalendarDays className="h-4 w-4 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
          <LoadingSpinner color="blue" size="8" />
          <p className="text-sm font-medium text-slate-600">
            Đang tải lịch làm việc hiện tại...
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {DAY_ORDER.map((day) => (
            <WorkingDayCard
              key={day}
              day={day}
              value={value[day]}
              disabled={disabled}
              onToggle={(checked) => {
                if (!checked) {
                  updateDay(day, {
                    active: false,
                    start: undefined,
                    end: undefined,
                  });
                  return;
                }

                if (day === "Saturday") {
                  updateDay(day, SHIFT_MAP.MORNING);
                  return;
                }

                updateDay(day, SHIFT_MAP.FULL_DAY);
              }}
              onChangeShift={(next) => {
                if (!value[day].active) return;
                updateDay(day, SHIFT_MAP[next]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
