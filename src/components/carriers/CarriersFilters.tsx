import React from 'react';
import { Search } from 'lucide-react';

export interface CarriersFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  statusFilter: 'all' | 'has_debt' | 'settled';
  setStatusFilter: (status: 'all' | 'has_debt' | 'settled') => void;
  carrierSummariesCount: number;
}

export const CarriersFilters: React.FC<CarriersFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  carrierSummariesCount,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم شركة النقل، اسم السائق، رقم السيارة، رقم البوليصة، أو الوجهة..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          كافة الشركات ({carrierSummariesCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('has_debt')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'has_debt'
              ? 'bg-rose-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          بذمتنا لها رصيد متبقي
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('settled')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'settled'
              ? 'bg-emerald-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          مصفاة بالكامل
        </button>
      </div>
    </div>
  );
};
