'use client';

import * as React from "react";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, Check, X, RotateCcw } from "lucide-react";

export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: string | DateRange;
  onSelect?: (value: any) => void;
  className?: string;
  minDate?: string;
  maxDate?: string;
  showPresets?: boolean;
  showYearDropdown?: boolean;
}

const ARABIC_MONTHS = [
  "كانون الثاني (1)",
  "شباط (2)",
  "آذار (3)",
  "نيسان (4)",
  "أيار (5)",
  "حزيران (6)",
  "تموز (7)",
  "آب (8)",
  "أيلول (9)",
  "تشرين الأول (10)",
  "تشرين الثاني (11)",
  "كانون الأول (12)",
];

const ARABIC_WEEKDAYS = [
  { key: "sat", label: "سبت", full: "السبت" },
  { key: "sun", label: "أحد", full: "الأحد" },
  { key: "mon", label: "إثنين", full: "الإثنين" },
  { key: "tue", label: "ثلاثاء", full: "الثلاثاء" },
  { key: "wed", label: "أربعاء", full: "الأربعاء" },
  { key: "thu", label: "خميس", full: "الخميس" },
  { key: "fri", label: "جمعة", full: "الجمعة" },
];

/**
 * Format date object into YYYY-MM-DD string
 */
export const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Parse YYYY-MM-DD string into safe Date object
 */
export const parseDateString = (str: string | undefined): Date | null => {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
};

/**
 * Arabic friendly formatted date
 * e.g. "الإثنين، 26 تشرين الأول 2026"
 */
export const formatArabicDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "اختر التاريخ...";
  const d = parseDateString(dateStr);
  if (!d) return dateStr;

  const weekday = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][d.getDay()];
  const day = d.getDate();
  const monthName = ARABIC_MONTHS[d.getMonth()]?.split(" ")[0] || "";
  const year = d.getFullYear();

  return `${weekday}، ${day} ${monthName} ${year}`;
};

/**
 * Shadcn-UI Standard Calendar Component
 * Based on https://ui.shadcn.com/docs/components/base/calendar
 */
export const Calendar: React.FC<CalendarProps> = ({
  mode = "single",
  selected,
  onSelect,
  className = "",
  minDate,
  maxDate,
  showPresets = true,
  showYearDropdown = true,
}) => {
  // Determine initial view month & year based on selection or today
  const initialDate = React.useMemo(() => {
    if (typeof selected === "string" && selected) {
      const parsed = parseDateString(selected);
      if (parsed) return parsed;
    } else if (selected && typeof selected === "object" && "from" in selected && selected.from) {
      const parsed = parseDateString(selected.from);
      if (parsed) return parsed;
    }
    return new Date();
  }, [selected]);

  const [currentYear, setCurrentYear] = React.useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState<number>(initialDate.getMonth()); // 0-11
  const [rangeHover, setRangeHover] = React.useState<string | null>(null);

  // Sync state if selected changes externally
  React.useEffect(() => {
    if (typeof selected === "string" && selected) {
      const parsed = parseDateString(selected);
      if (parsed) {
        setCurrentYear(parsed.getFullYear());
        setCurrentMonth(parsed.getMonth());
      }
    }
  }, [selected]);

  const todayStr = toDateString(new Date());

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    if (mode === "single" && onSelect) {
      onSelect(toDateString(now));
    }
  };

  // Generate days matrix for current month (Saturday through Friday)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 6 is Saturday
  // Convert standard JS (0=Sun..6=Sat) to Arabic start (0=Sat, 1=Sun, 2=Mon... 6=Fri)
  const startingCol = (firstDayOfWeek + 1) % 7;

  // Previous month padding days
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  const prevDays = [];
  for (let i = startingCol - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, d);
    prevDays.push({
      dateStr: toDateString(prevMonthDate),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    currentMonthDays.push({
      dateStr: toDateString(dateObj),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to complete grid (multiples of 7)
  const totalSlotsSoFar = prevDays.length + currentMonthDays.length;
  const nextMonthSlots = (7 - (totalSlotsSoFar % 7)) % 7;
  const nextDays = [];
  for (let d = 1; d <= nextMonthSlots; d++) {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, d);
    nextDays.push({
      dateStr: toDateString(nextMonthDate),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  const allGridDays = [...prevDays, ...currentMonthDays, ...nextDays];

  // Helper to check selection
  const isSelected = (dateStr: string) => {
    if (mode === "single") {
      return typeof selected === "string" && selected === dateStr;
    } else if (mode === "range" && selected && typeof selected === "object") {
      const range = selected as DateRange;
      if (range.from === dateStr || range.to === dateStr) return true;
      if (range.from && range.to && dateStr > range.from && dateStr < range.to) return true;
      return false;
    }
    return false;
  };

  const isRangeStart = (dateStr: string) => {
    if (mode !== "range" || !selected || typeof selected !== "object") return false;
    return (selected as DateRange).from === dateStr;
  };

  const isRangeEnd = (dateStr: string) => {
    if (mode !== "range" || !selected || typeof selected !== "object") return false;
    return (selected as DateRange).to === dateStr;
  };

  const isRangeMiddle = (dateStr: string) => {
    if (mode !== "range" || !selected || typeof selected !== "object") return false;
    const range = selected as DateRange;
    if (range.from && range.to && dateStr > range.from && dateStr < range.to) return true;
    if (range.from && !range.to && rangeHover && dateStr > range.from && dateStr <= rangeHover) return true;
    return false;
  };

  const isDateDisabled = (dateStr: string) => {
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleDayClick = (dateStr: string) => {
    if (isDateDisabled(dateStr)) return;

    if (mode === "single") {
      onSelect?.(dateStr);
    } else if (mode === "range") {
      const currentRange = (typeof selected === "object" ? selected : {}) as DateRange;
      if (!currentRange.from || (currentRange.from && currentRange.to)) {
        // Start new range
        onSelect?.({ from: dateStr, to: undefined });
      } else {
        // Complete range
        if (dateStr < currentRange.from) {
          onSelect?.({ from: dateStr, to: currentRange.from });
        } else {
          onSelect?.({ from: currentRange.from, to: dateStr });
        }
      }
    }
  };

  // Year options (-5 to +5 years)
  const currentActualYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentActualYear - 5 + i);

  return (
    <div
      className={`p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 select-none shadow-xl ${className}`}
      dir="rtl"
    >
      {/* Calendar Header: Month/Year navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          
          {/* Month Selector */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2 py-1 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {ARABIC_MONTHS.map((m, idx) => (
              <option key={idx} value={idx}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          {showYearDropdown ? (
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 rounded-lg px-2 py-1 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-mono font-bold text-xs text-slate-300">{currentYear}</span>
          )}
        </div>

        {/* Prev / Next Chevrons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="الشهر القادم"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {ARABIC_WEEKDAYS.map((w) => (
          <div
            key={w.key}
            className="text-[11px] font-bold text-slate-400 py-1"
            title={w.full}
          >
            {w.label}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {allGridDays.map((item, idx) => {
          const selectedState = isSelected(item.dateStr);
          const isToday = item.dateStr === todayStr;
          const disabled = isDateDisabled(item.dateStr);
          const rangeStart = isRangeStart(item.dateStr);
          const rangeEnd = isRangeEnd(item.dateStr);
          const rangeMiddle = isRangeMiddle(item.dateStr);

          let cellClass = "relative flex items-center justify-center h-8 rounded-xl text-xs font-medium transition cursor-pointer ";

          if (disabled) {
            cellClass += "text-slate-600 bg-transparent cursor-not-allowed opacity-40 ";
          } else if (rangeStart || rangeEnd || (selectedState && mode === "single")) {
            cellClass += "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/80 ";
          } else if (rangeMiddle) {
            cellClass += "bg-emerald-500/15 text-emerald-300 rounded-none ";
          } else if (isToday) {
            cellClass += "bg-slate-800/90 text-emerald-400 font-bold ring-1 ring-emerald-500/40 hover:bg-slate-700 ";
          } else if (!item.isCurrentMonth) {
            cellClass += "text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 ";
          } else {
            cellClass += "text-slate-200 hover:bg-slate-800 hover:text-white ";
          }

          return (
            <button
              key={`${item.dateStr}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(item.dateStr)}
              onMouseEnter={() => mode === "range" && setRangeHover(item.dateStr)}
              className={cellClass.trim()}
              title={formatArabicDate(item.dateStr)}
            >
              <span>{item.dayNumber}</span>
              {isToday && !selectedState && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Action Presets (اليوم، أمس، بداية الشهر، مسح) */}
      {showPresets && (
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold transition flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>اليوم</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const yest = new Date(Date.now() - 86400000);
                setCurrentYear(yest.getFullYear());
                setCurrentMonth(yest.getMonth());
                if (mode === "single" && onSelect) onSelect(toDateString(yest));
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              أمس
            </button>
            <button
              type="button"
              onClick={() => {
                const firstDay = new Date(currentYear, currentMonth, 1);
                if (mode === "single" && onSelect) onSelect(toDateString(firstDay));
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              أول الشهر
            </button>
          </div>

          {selected && (
            <button
              type="button"
              onClick={() => onSelect?.(mode === "range" ? { from: undefined, to: undefined } : "")}
              className="px-1.5 py-0.5 rounded-lg text-slate-400 hover:text-rose-400 transition flex items-center gap-0.5"
              title="مسح التاريخ المحدد"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
