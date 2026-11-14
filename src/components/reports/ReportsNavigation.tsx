import React from 'react';
import { 
  BarChart3, 
  CreditCard, 
  HardHat, 
  Building2, 
  Printer, 
  FileText, 
  Search, 
  Coins, 
  Scale,
  Users
} from 'lucide-react';
import { DatePicker } from '../ui/date-picker';

export type MainReportSection =
  | 'combined_statement'
  | 'company_report'
  | 'bills_profitability'
  | 'customers_ledger'
  | 'brokers_expenses';

interface ReportsNavigationProps {
  activeSection: MainReportSection;
  onSelectSection: (section: MainReportSection) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeRate: number;
  totalBillsCount: number;
  customersCount: number;
  brokersCount: number;
  adminExpensesCount: number;
  onPrint?: () => void;
}

export const ReportsNavigation: React.FC<ReportsNavigationProps> = ({
  activeSection,
  onSelectSection,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchQuery,
  setSearchQuery,
  activeRate,
  totalBillsCount,
  customersCount,
  brokersCount,
  adminExpensesCount,
  onPrint = () => window.print(),
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 no-print">
      {/* Title + Global Filters (Date Range, Search, Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>المنظومة المحاسبية للتقارير المالية، أرباح البوالص، وميزانية الشركتين</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تقارير محاسبية دقيقة مصممة لإدارة مكاتب التخليص الكمركي • سعر الصرف المعتمد:{' '}
            <strong className="text-emerald-400 font-mono">1$ = {activeRate.toLocaleString('ar-IQ')} د.ع</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم بوليصة، زبون، مخلص..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-8 pl-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400">من:</span>
            <div className="w-36">
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="بداية الفترة" />
            </div>
            <span className="text-slate-400">إلى:</span>
            <div className="w-36">
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="نهاية الفترة" />
            </div>
            {(dateFrom || dateTo || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSearchQuery('');
                }}
                className="text-[11px] text-rose-400 hover:underline px-1.5 font-bold"
              >
                مسح الفلتر
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير المعتمد</span>
          </button>
        </div>
      </div>

      {/* 5 Main Tab Switchers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectSection('bills_profitability')}
          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-1.5 ${
            activeSection === 'bills_profitability'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">1. أرباح ومصاريف البوالص</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>كل بوليصة + مجموع الكلي</span>
            <span className="font-mono font-bold text-emerald-300">({totalBillsCount})</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('combined_statement')}
          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-1.5 ${
            activeSection === 'combined_statement'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">2. الميزانية الموحدة</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>مقارنة نقاء البصرة وصوت الجنوب</span>
            <span className="font-bold text-amber-300">شركتين</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('company_report')}
          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-1.5 ${
            activeSection === 'company_report'
              ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">3. كشف الشركة المنفردة</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>قائمة دخل تفصيلية لكل شركة</span>
            <span className="font-bold text-cyan-300">نقاء / صوت</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('customers_ledger')}
          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-1.5 ${
            activeSection === 'customers_ledger'
              ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">4. كشف ذمم الزبائن</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>ديون وتحصيلات الشركات</span>
            <span className="font-mono font-bold text-indigo-300">({customersCount})</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('brokers_expenses')}
          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-1.5 ${
            activeSection === 'brokers_expenses'
              ? 'bg-rose-500/15 border-rose-500 text-white shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">5. عهد المخلصين والمصاريف</span>
            <HardHat className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>سلف + رواتب وإيجارات</span>
            <span className="font-mono font-bold text-rose-300">({brokersCount + adminExpensesCount})</span>
          </div>
        </button>
      </div>
    </div>
  );
};
