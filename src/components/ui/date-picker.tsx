'use client';

import * as React from "react";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Calendar, formatArabicDate, toDateString, DateRange } from "./calendar";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  size?: 'default' | 'sm';
}

/**
 * Shadcn-UI Standard DatePicker Component
 * Pairs a responsive button trigger with the Shadcn Calendar dropdown popover
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "اختر التاريخ...",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  required = false,
  size = 'default',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isSm = size === 'sm';

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (selectedDate: string) => {
    onChange?.(selectedDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef} dir="rtl">
      {/* Hidden input for HTML form compliance */}
      <input
        type="hidden"
        value={value || ""}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-1.5 ${
          isSm ? "h-8 px-2.5 py-1 rounded-lg text-xs" : "px-3 py-2 rounded-xl text-xs"
        } bg-slate-950 border font-medium transition text-right ${
          disabled
            ? "border-slate-800 text-slate-500 cursor-not-allowed bg-slate-900/50"
            : isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 text-white"
            : "border-slate-700 hover:border-slate-600 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarIcon className={`${isSm ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0 ${value ? "text-emerald-400" : "text-slate-400"}`} />
          {value ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className={`text-slate-100 font-semibold truncate ${isSm ? "text-[11px]" : ""}`}>
                {formatArabicDate(value)}
              </span>
              <span className={`font-mono text-[10px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 ${isSm ? "hidden sm:inline-block" : ""}`}>
                {value}
              </span>
            </div>
          ) : (
            <span className={`text-slate-500 truncate ${isSm ? "text-[11px]" : ""}`}>{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              title="مسح التاريخ"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 right-0 w-[310px] sm:w-[325px] animate-in fade-in zoom-in-95 duration-150 drop-shadow-2xl">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            showPresets={true}
          />
        </div>
      )}
    </div>
  );
};

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Shadcn-UI DateRangePicker
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "اختر الفترة الزمنية...",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const hasRange = value?.from || value?.to;

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef} dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-950 border rounded-xl text-xs font-medium transition text-right ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 text-white"
            : "border-slate-700 hover:border-slate-600 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 ${hasRange ? "text-emerald-400" : "text-slate-400"}`} />
          {value?.from ? (
            <span className="font-mono text-slate-200 text-xs">
              {value.from} {value.to ? `إلى ${value.to}` : "(اختر تاريخ الانتهاء)"}
            </span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasRange && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange?.({ from: undefined, to: undefined });
              }}
              className="p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              title="مسح الفترة"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 right-0 w-[320px] animate-in fade-in zoom-in-95 duration-150 drop-shadow-2xl">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(val) => {
              onChange?.(val);
              if (val?.from && val?.to) {
                setIsOpen(false);
              }
            }}
            showPresets={true}
          />
        </div>
      )}
    </div>
  );
};
