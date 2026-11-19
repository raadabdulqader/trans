'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { CompanyId } from '../../types/customs';

export interface AccountsFiltersBarProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  companyFilter: 'all' | CompanyId | 'shared';
  setCompanyFilter: (f: 'all' | CompanyId | 'shared') => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  filteredCount: number;
}

export const AccountsFiltersBar: React.FC<AccountsFiltersBarProps> = ({
  searchTerm,
  setSearchTerm,
  companyFilter,
  setCompanyFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filteredCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالجهة، الموظف، البيان، أو رقم السند..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Company Filter */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>الشركة:</span>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">🏢 جميع الشركات</option>
            <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
            <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
            <option value="shared">🏛️ مصاريف مشتركة / عامة</option>
          </select>
        </div>

        {/* Date range filters */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>من:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>إلى:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          />
        </div>

        {(searchTerm || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-[11px] cursor-pointer"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-400">
        عدد القيود: <strong className="text-white">{filteredCount}</strong> قيد
      </div>
    </div>
  );
};
