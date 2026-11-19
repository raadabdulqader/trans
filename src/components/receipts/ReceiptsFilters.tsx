import React from 'react';
import { Plus, Ban } from 'lucide-react';
import { AppUser, CompanyId, Transaction } from '../../types/customs';
import { CurrencyFilterSelect } from '../ui/currency-select';

interface ReceiptsFiltersProps {
  currentUser: AppUser;
  statusFilter: 'all' | 'active' | 'cancelled';
  setStatusFilter: (val: 'all' | 'active' | 'cancelled') => void;
  currencyFilter: 'all' | 'IQD' | 'USD';
  setCurrencyFilter: (val: 'all' | 'IQD' | 'USD') => void;
  companyFilter: 'all' | CompanyId;
  setCompanyFilter: (val: 'all' | CompanyId) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  billFilter: string;
  setBillFilter: (val: string) => void;
  transactions: Transaction[];
  totalReceiptsCount: number;
  activeCount: number;
  cancelledCount: number;
  filteredCount: number;
  onAddReceipt: () => void;
}

export const ReceiptsFilters: React.FC<ReceiptsFiltersProps> = ({
  currentUser,
  statusFilter,
  setStatusFilter,
  currencyFilter,
  setCurrencyFilter,
  companyFilter,
  setCompanyFilter,
  typeFilter,
  setTypeFilter,
  billFilter,
  setBillFilter,
  transactions,
  totalReceiptsCount,
  activeCount,
  cancelledCount,
  filteredCount,
  onAddReceipt,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
      <div className="flex flex-wrap items-center gap-3">
        {(currentUser.role === 'admin' || currentUser.permissions.createReceipts !== false) && (
          <button
            onClick={onAddReceipt}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سند / وصل جديد</span>
          </button>
        )}

        {/* Status Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({totalReceiptsCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            النشطة ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              statusFilter === 'cancelled'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ban className="w-3 h-3 text-rose-400" />
            الملغاة دفترياً ({cancelledCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Filter via Shadcn Select with RTL */}
          <CurrencyFilterSelect
            value={currencyFilter}
            onValueChange={setCurrencyFilter}
            triggerClassName="h-9 min-w-[170px]"
          />

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">🏢 جميع الشركات</option>
            <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
            <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">جميع أنواع الوصولات</option>
            <option value="deposit">دفعة أولى (مقدم)</option>
            <option value="payment">دفعة من الزبون</option>
            <option value="advance">سلفة للمخلص</option>
            <option value="settlement">تسوية سلفة</option>
          </select>

          <select
            value={billFilter}
            onChange={(e) => setBillFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition max-w-[200px]"
          >
            <option value="all">جميع البوالص</option>
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.billNo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-400 font-medium">
        المعروض: <strong className="text-emerald-400">{filteredCount}</strong>
      </div>
    </div>
  );
};
