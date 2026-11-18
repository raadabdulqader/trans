'use client';

import * as React from "react";
import { Currency } from "@/types/customs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./select";

export interface CurrencySelectProps {
  value: Currency;
  onValueChange: (value: Currency) => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'xs';
  showSubText?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onValueChange,
  className = "",
  triggerClassName = "",
  disabled = false,
  size = 'md',
  showSubText = false,
}) => {
  const heightClass = size === 'xs' ? 'h-7 text-[11px] px-2 py-0.5' : size === 'sm' ? 'h-8 text-xs px-2.5 py-1' : 'h-9 text-xs px-3 py-1.5';

  return (
    <div className={`relative inline-block w-full ${className}`} dir="rtl">
      <Select
        value={value}
        onValueChange={(val) => onValueChange(val as Currency)}
        disabled={disabled}
        dir="rtl"
      >
        <SelectTrigger className={`${heightClass} font-bold ${triggerClassName}`}>
          <div className="flex items-center gap-1.5 truncate">
            {value === 'IQD' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="text-sm">🇮🇶</span>
                <span>دينار عراقي (IQD)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="text-sm">🇺🇸</span>
                <span>دولار أمريكي (USD)</span>
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent dir="rtl" className="min-w-[190px]">
          <SelectItem value="IQD" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm">🇮🇶</span>
              <div className="flex flex-col text-right">
                <span className="font-bold text-emerald-400">دينار عراقي (IQD)</span>
                {showSubText && <span className="text-[10px] text-slate-400">صندوق الدينار العراقي</span>}
              </div>
            </div>
          </SelectItem>
          <SelectItem value="USD" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm">🇺🇸</span>
              <div className="flex flex-col text-right">
                <span className="font-bold text-cyan-400">دولار أمريكي (USD)</span>
                {showSubText && <span className="text-[10px] text-slate-400">صندوق الدولار الأمريكي</span>}
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export interface CurrencyFilterSelectProps {
  value: 'all' | 'IQD' | 'USD';
  onValueChange: (value: 'all' | 'IQD' | 'USD') => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export const CurrencyFilterSelect: React.FC<CurrencyFilterSelectProps> = ({
  value,
  onValueChange,
  className = "",
  triggerClassName = "",
  disabled = false,
}) => {
  return (
    <div className={`relative inline-block ${className}`} dir="rtl">
      <Select
        value={value}
        onValueChange={(val) => onValueChange(val as 'all' | 'IQD' | 'USD')}
        disabled={disabled}
        dir="rtl"
      >
        <SelectTrigger className={`h-8 text-xs px-2.5 py-1 font-semibold ${triggerClassName}`}>
          <div className="flex items-center gap-1.5 truncate">
            {value === 'all' && (
              <span className="flex items-center gap-1.5 text-slate-200">
                <span>💵</span>
                <span>كافة العملات (د.ع + $)</span>
              </span>
            )}
            {value === 'IQD' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span>🇮🇶</span>
                <span>دينار عراقي (IQD)</span>
              </span>
            )}
            {value === 'USD' && (
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span>🇺🇸</span>
                <span>دولار أمريكي (USD)</span>
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent dir="rtl" className="min-w-[190px]">
          <SelectItem value="all">
            <div className="flex items-center gap-1.5">
              <span>💵</span>
              <span className="font-bold text-slate-200">كافة العملات (د.ع + $)</span>
            </div>
          </SelectItem>
          <SelectItem value="IQD">
            <div className="flex items-center gap-1.5">
              <span>🇮🇶</span>
              <span className="font-bold text-emerald-400">دينار عراقي (IQD)</span>
            </div>
          </SelectItem>
          <SelectItem value="USD">
            <div className="flex items-center gap-1.5">
              <span>🇺🇸</span>
              <span className="font-bold text-cyan-400">دولار أمريكي (USD)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
