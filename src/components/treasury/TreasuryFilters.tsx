import React from 'react';
import { 
  Plus, 
  Minus, 
  Printer, 
  Paperclip, 
  Ban, 
  Search 
} from 'lucide-react';
import { AppUser, CompanyId } from '../../types/customs';
import { DatePicker } from '../ui/date-picker';
import { CurrencyFilterSelect } from '../ui/currency-select';

export interface TreasuryFiltersProps {
  currentUser: AppUser;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onPrintStatement: () => void;
  filteredCount: number;
  totalCount: number;
  directTreasuryCount: number;
  totalArchivedCount: number;
  cancelledRecordsCount: number;
  filterTab: 'all' | 'direct' | 'bill_payments' | 'broker_advances' | 'archived' | 'cancelled';
  setFilterTab: (tab: 'all' | 'direct' | 'bill_payments' | 'broker_advances' | 'archived' | 'cancelled') => void;
  companyFilter: 'all' | CompanyId | 'shared';
  setCompanyFilter: (comp: 'all' | CompanyId | 'shared') => void;
  currencyFilter: 'all' | 'IQD' | 'USD';
  setCurrencyFilter: (curr: 'all' | 'IQD' | 'USD') => void;
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const TreasuryFilters: React.FC<TreasuryFiltersProps> = ({
  currentUser,
  onOpenDeposit,
  onOpenWithdrawal,
  onPrintStatement,
  filteredCount,
  totalCount,
  directTreasuryCount,
  totalArchivedCount,
  cancelledRecordsCount,
  filterTab,
  setFilterTab,
  companyFilter,
  setCompanyFilter,
  currencyFilter,
  setCurrencyFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="space-y-4">
      {/* Action Buttons & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          {(currentUser.role === 'admin' || currentUser.permissions.createExpenses !== false) && (
            <>
              <button
                onClick={onOpenDeposit}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>📥 إيداع نقدي في الصندوق</span>
              </button>

              <button
                onClick={onOpenWithdrawal}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 transition"
              >
                <Minus className="w-4 h-4" />
                <span>📤 سحب نقدي من الصندوق</span>
              </button>
            </>
          )}

          {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
            <button
              onClick={onPrintStatement}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ طباعة كشف حركة الصندوق</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          إجمالي القيود المعروضة: <strong className="text-white font-mono">{filteredCount}</strong> قيد من أصل <strong className="text-emerald-400 font-mono">{totalCount}</strong>
        </div>
      </div>

      {/* Unified Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'all' ? 'bg-slate-800 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📋 جميع القيود بالصندوق</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 rounded-full">{totalCount}</span>
            </button>

            <button
              onClick={() => setFilterTab('direct')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'direct' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏛️ قيود الصندوق المباشرة</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-900/50 rounded-full">{directTreasuryCount}</span>
            </button>

            <button
              onClick={() => setFilterTab('bill_payments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'bill_payments' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💳 دفعات الزبائن (البوالص)</span>
            </button>

            <button
              onClick={() => setFilterTab('broker_advances')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'broker_advances' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👷 سلف وتسويات المخلصين</span>
            </button>

            <button
              onClick={() => setFilterTab('archived')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'archived' ? 'bg-purple-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>المؤرشف فقط ({totalArchivedCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('cancelled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterTab === 'cancelled' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>الملغاة دفترياً ({cancelledRecordsCount})</span>
            </button>
          </div>

          {/* Company filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">الشركة:</span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">🏢 جميع الشركات (الصندوق الموحد)</option>
              <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
              <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
              <option value="shared">🏛️ القيود المشتركة / الإدارية</option>
            </select>
          </div>

          {/* Currency filter via Shadcn Select with RTL */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">العملة:</span>
            <CurrencyFilterSelect
              value={currencyFilter}
              onValueChange={setCurrencyFilter}
              triggerClassName="h-8 min-w-[170px]"
            />
          </div>

          {/* Date range filters with Shadcn DatePicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <span className="text-slate-400">من:</span>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder="من تاريخ..."
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <span className="text-slate-400">إلى:</span>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                placeholder="إلى تاريخ..."
              />
            </div>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-[11px] text-slate-400 hover:text-rose-400 underline py-1"
              >
                مسح التواريخ
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث برقم السند، الطرف، البيان..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>

        </div>
      </div>
    </div>
  );
};
