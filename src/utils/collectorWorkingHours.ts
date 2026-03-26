import type {
  CollectorWorkingDay,
  CollectorWorkingHours,
} from "@/redux/api/enterprise/collectors/types";

export type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ApiDayKey = DayKey;

export type WorkingHourFormItem = CollectorWorkingDay & {
  active: boolean;
};

export type WorkingHoursFormValue = Record<DayKey, WorkingHourFormItem>;

export type ShiftValue = "MORNING" | "AFTERNOON" | "FULL_DAY" | "EVENING";

export const DAY_ORDER: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAY_LABELS: Record<DayKey, string> = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

export const SHIFT_OPTIONS: {
  value: ShiftValue;
  label: string;
  start: string;
  end: string;
  active: true;
}[] = [
    {
      value: "FULL_DAY",
      label: "08:00 - 17:00",
      start: "08:00",
      end: "17:00",
      active: true,
    },
    {
      value: "MORNING",
      label: "08:00 - 12:00",
      start: "08:00",
      end: "12:00",
      active: true,
    },
    {
      value: "AFTERNOON",
      label: "13:00 - 17:00",
      start: "13:00",
      end: "17:00",
      active: true,
    },
    {
      value: "EVENING",
      label: "18:00 - 22:00",
      start: "18:00",
      end: "22:00",
      active: true,
    },
  ];

export const SHIFT_MAP: Record<ShiftValue, WorkingHourFormItem> = {
  MORNING: { start: "08:00", end: "12:00", active: true },
  AFTERNOON: { start: "13:00", end: "17:00", active: true },
  FULL_DAY: { start: "08:00", end: "17:00", active: true },
  EVENING: { start: "18:00", end: "22:00", active: true },
};

const DAY_TO_API_KEY: Record<DayKey, ApiDayKey> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

const DAY_KEY_LOOKUP: Record<string, DayKey> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

const DEFAULT_ACTIVE_SHIFT = SHIFT_MAP.FULL_DAY;

function buildWorkingHours(
  factory: (day: DayKey) => WorkingHourFormItem,
): WorkingHoursFormValue {
  return DAY_ORDER.reduce((acc, day) => {
    acc[day] = factory(day);
    return acc;
  }, {} as WorkingHoursFormValue);
}

export function createEmptyWorkingHours(): WorkingHoursFormValue {
  return buildWorkingHours(() => ({ active: false }));
}

export function createDefaultWorkingHours(): WorkingHoursFormValue {
  return buildWorkingHours(() => ({ ...DEFAULT_ACTIVE_SHIFT }));
}

export function cloneWorkingHoursValue(
  source: WorkingHoursFormValue,
): WorkingHoursFormValue {
  return buildWorkingHours((day) => ({ ...source[day] }));
}

function normalizeWorkingDay(
  raw: unknown,
  fallback: WorkingHourFormItem,
): WorkingHourFormItem {
  const item =
    raw && typeof raw === "object" ? (raw as CollectorWorkingDay) : undefined;

  const rawStart = typeof item?.start === "string" ? item.start.trim() : "";
  const rawEnd = typeof item?.end === "string" ? item.end.trim() : "";
  const active =
    typeof item?.active === "boolean"
      ? item.active
      : Boolean(rawStart || rawEnd);

  if (!active) {
    return { active: false };
  }

  return {
    active: true,
    start: rawStart || fallback.start || DEFAULT_ACTIVE_SHIFT.start,
    end: rawEnd || fallback.end || DEFAULT_ACTIVE_SHIFT.end,
  };
}

export function toFormWorkingHours(
  input?: Record<string, CollectorWorkingDay | undefined> | null,
  fallback: WorkingHoursFormValue = createEmptyWorkingHours(),
): WorkingHoursFormValue {
  const next = cloneWorkingHoursValue(fallback);

  if (!input || typeof input !== "object") {
    return next;
  }

  let hasRecognizedKey = false;

  Object.entries(input).forEach(([rawKey, value]) => {
    const day = DAY_KEY_LOOKUP[rawKey];
    if (!day) return;

    hasRecognizedKey = true;
    const seed = next[day].active ? next[day] : DEFAULT_ACTIVE_SHIFT;
    next[day] = normalizeWorkingDay(value, seed);
  });

  return hasRecognizedKey ? next : cloneWorkingHoursValue(fallback);
}

export function normalizeWorkingHoursForSubmit(
  data: WorkingHoursFormValue,
): CollectorWorkingHours {
  return DAY_ORDER.reduce((acc, day) => {
    const item = data[day];

    if (!item.active) {
      acc[day] = { active: false };
      return acc;
    }

    acc[day] = {
      active: true,
      start: item.start || DEFAULT_ACTIVE_SHIFT.start,
      end: item.end || DEFAULT_ACTIVE_SHIFT.end,
    };
    return acc;
  }, {} as CollectorWorkingHours);
}

export function normalizeCollectorWorkingHours(
  raw?: unknown,
): CollectorWorkingHours | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const source = raw as Record<string, CollectorWorkingDay | undefined>;
  const hasRecognizedKey = Object.keys(source).some((key) =>
    Object.prototype.hasOwnProperty.call(DAY_KEY_LOOKUP, key),
  );

  if (!hasRecognizedKey) {
    return undefined;
  }

  return normalizeWorkingHoursForSubmit(
    toFormWorkingHours(source, createEmptyWorkingHours()),
  );
}

export function toApiWorkingHoursPayload(
  data: CollectorWorkingHours | WorkingHoursFormValue,
): Record<ApiDayKey, CollectorWorkingDay> {
  return DAY_ORDER.reduce((acc, day) => {
    const item = data[day];
    const apiDay = DAY_TO_API_KEY[day];

    if (!item?.active) {
      acc[apiDay] = { active: false };
      return acc;
    }

    acc[apiDay] = {
      active: true,
      start: item.start || DEFAULT_ACTIVE_SHIFT.start,
      end: item.end || DEFAULT_ACTIVE_SHIFT.end,
    };
    return acc;
  }, {} as Record<ApiDayKey, CollectorWorkingDay>);
}
