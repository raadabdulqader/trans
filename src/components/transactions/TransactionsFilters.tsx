import React from 'react';
import { Plus } from 'lucide-react';
import { AppUser, CompanyId, Customer } from '../../types/customs';

interface TransactionsFiltersProps {
  currentUser: AppUser;
  companyFilter: 'all' | CompanyId;
  setCompanyFilter: (val: 'all' | CompanyId) => void;
  statusFilter: 'all' | 'pending' | 'completed' | 'issue' | 'cancelled';
  setStatusFilter: (val: 'all' | 'pending' | 'completed' | 'issue' | 'cancelled') => void;
  customerFilter: string;
  setCustomerFilter: (val: string) => void;
  customers: Customer[];
  filteredCount: number;
  onAddTransaction: () => void;
}

export const TransactionsFilters: React.FC<TransactionsFiltersProps> = ({
  currentUser,
  companyFilter,
  setCompanyFilter,
  statusFilter,
  setStatusFilter,
  customerFilter,
  setCustomerFilter,
  customers,
  filteredCount,
  onAddTransaction,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
      <div className="flex flex-wrap items-center gap-3">
        {currentUser.permissions.editTx && (
          <button
            onClick={onAddTransaction}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>بوليصة / فاتورة جديدة</span>
          </button>
        )}

        <div className="flex items-center gap-2">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">⏳ قيد التنفيذ</option>
            <option value="completed">✅ منجزة</option>
            <option value="issue">⚠️ معلقة</option>
            <option value="cancelled">❌ ملغاة دفترياً</option>
          </select>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition max-w-[200px]"
          >
            <option value="all">جميع الزبائن</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-400 font-medium">
        إجمالي النتائج: <strong className="text-emerald-400">{filteredCount}</strong> بوليصة
      </div>
    </div>
  );
};
