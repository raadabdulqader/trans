import React from 'react';
import { Customer, CompanyId } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { AnalyzedBill, BillsSummary } from '../../../utils/reportCalculations';

interface BillsProfitabilitySummaryProps {
  allAnalyzedBills: AnalyzedBill[];
  filteredBillsSummary: BillsSummary;
  customers: Customer[];
  billCompanyFilter: 'all' | CompanyId;
  setBillCompanyFilter: (val: 'all' | CompanyId) => void;
  billCustomerFilter: string;
  setBillCustomerFilter: (val: string) => void;
  billStatusFilter: string;
  setBillStatusFilter: (val: string) => void;
}

export const BillsProfitabilitySummary: React.FC<BillsProfitabilitySummaryProps> = ({
  allAnalyzedBills,
  filteredBillsSummary,
  customers,
  billCompanyFilter,
  setBillCompanyFilter,
  billCustomerFilter,
  setBillCustomerFilter,
  billStatusFilter,
  setBillStatusFilter,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            أولاً: خلاصة مجموع البوالص الكلي ({filteredBillsSummary.count} بوليصة فعالة)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            إجمالي قيمة المقاولات الكمركية، المقبوضات، الديون المتبقية على الزبائن، سلف وتكاليف التخليص، وصافي الأرباح
          </p>
        </div>

        {/* Filters for Bill Table */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <select
            value={billCompanyFilter}
            onChange={(e) => setBillCompanyFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الشركات ({allAnalyzedBills.length})</option>
            <option value="naqaa_basra">شركة نقاء البصرة</option>
            <option value="sawt_aljanoub">شركة صوت الجنوب</option>
          </select>

          <select
            value={billCustomerFilter}
            onChange={(e) => setBillCustomerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الزبائن</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={billStatusFilter}
            onChange={(e) => setBillStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">منجزة ({filteredBillsSummary.completedCount})</option>
            <option value="pending">قيد التنفيذ ({filteredBillsSummary.pendingCount})</option>
            <option value="issue">معلقة ({filteredBillsSummary.issueCount})</option>
          </select>
        </div>
      </div>

      {/* 5 Accounting Summary Columns for All Bills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Contracts */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>1. مجموع عقود البوالص</span>
            <span className="font-mono text-white">{filteredBillsSummary.count} بوليصة</span>
          </div>
          <div className="text-base font-black text-white font-mono" dir="ltr">
            {formatCurrency(filteredBillsSummary.contractIQD, 'IQD')}
          </div>
          {filteredBillsSummary.contractUSD > 0 && (
            <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
              + {formatCurrency(filteredBillsSummary.contractUSD, 'USD')}
            </div>
          )}
          <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
            <span>المعادل بالدينار:</span>
            <strong className="text-slate-200" dir="ltr">{formatCurrency(filteredBillsSummary.contractEqIQD, 'IQD')}</strong>
          </div>
        </div>

        {/* 2. Total Collected */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>2. المقبوض من الزبائن</span>
            <span className="font-mono text-emerald-400">
              {filteredBillsSummary.contractEqIQD > 0
                ? `${Math.round((filteredBillsSummary.collectedEqIQD / filteredBillsSummary.contractEqIQD) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="text-base font-black text-emerald-400 font-mono" dir="ltr">
            {formatCurrency(filteredBillsSummary.collectedIQD, 'IQD')}
          </div>
          {filteredBillsSummary.collectedUSD > 0 && (
            <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
              + {formatCurrency(filteredBillsSummary.collectedUSD, 'USD')}
            </div>
          )}
          <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
            <span>المعادل بالدينار:</span>
            <strong className="text-emerald-300" dir="ltr">{formatCurrency(filteredBillsSummary.collectedEqIQD, 'IQD')}</strong>
          </div>
        </div>

        {/* 3. Remaining Customer Debt */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>3. الديون المتبقية بالسوق</span>
            <span className="text-amber-400">ذمم الزبائن</span>
          </div>
          <div className="text-base font-black text-amber-400 font-mono" dir="ltr">
            {formatCurrency(filteredBillsSummary.remainingIQD, 'IQD')}
          </div>
          {filteredBillsSummary.remainingUSD > 0 && (
            <div className="text-sm font-bold text-amber-300 font-mono" dir="ltr">
              + {formatCurrency(filteredBillsSummary.remainingUSD, 'USD')}
            </div>
          )}
          <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
            <span>المعادل بالدينار:</span>
            <strong className="text-amber-300" dir="ltr">{formatCurrency(filteredBillsSummary.remainingEqIQD, 'IQD')}</strong>
          </div>
        </div>

        {/* 4. Total Bill Expenses & Broker Advances */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>4. تكاليف وسلف البوالص</span>
            <span className="text-rose-400">مصاريف التخليص</span>
          </div>
          <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
            -{formatCurrency(filteredBillsSummary.totalCostIQD, 'IQD')}
          </div>
          {filteredBillsSummary.totalCostUSD > 0 && (
            <div className="text-sm font-bold text-rose-300 font-mono" dir="ltr">
              - {formatCurrency(filteredBillsSummary.totalCostUSD, 'USD')}
            </div>
          )}
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
            <span>مصفى بوصولات: {formatCurrency(filteredBillsSummary.settledEqIQD, 'IQD')}</span>
            <span className="text-amber-300">بذمة مخلص: {formatCurrency(filteredBillsSummary.openAdvEqIQD, 'IQD')}</span>
          </div>
        </div>

        {/* 5. Net Bill Profit */}
        <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span>5. صافي ربح مجموع البوالص</span>
            <span>العقد − التكلفة</span>
          </div>
          <div className={`text-base font-black font-mono ${filteredBillsSummary.netProfitIQD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
            {filteredBillsSummary.netProfitIQD >= 0 ? '+' : ''}{formatCurrency(filteredBillsSummary.netProfitIQD, 'IQD')}
          </div>
          {(filteredBillsSummary.contractUSD > 0 || filteredBillsSummary.totalCostUSD > 0) && (
            <div className={`text-sm font-bold font-mono ${filteredBillsSummary.netProfitUSD >= 0 ? 'text-cyan-400' : 'text-rose-300'}`} dir="ltr">
              {filteredBillsSummary.netProfitUSD >= 0 ? '+ ' : ''}{formatCurrency(filteredBillsSummary.netProfitUSD, 'USD')}
            </div>
          )}
          <div className="text-[11px] text-emerald-300/90 pt-1.5 border-t border-emerald-500/20 font-mono flex items-center justify-between">
            <span>المعادل الكلي:</span>
            <strong dir="ltr">{formatCurrency(filteredBillsSummary.netProfitEqIQD, 'IQD')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
