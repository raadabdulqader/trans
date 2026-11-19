import React from 'react';
import { formatCurrency } from '../../utils/storage';

interface DashboardMetricsCardsProps {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  issueCount: number;
  cancelledCount: number;
  totalRevenueIQD: number;
  totalRevenueUSD: number;
  totalCollectedIQD: number;
  totalCollectedUSD: number;
  totalRemainingIQD: number;
  totalRemainingUSD: number;
  netOpenAdvancesIQD: number;
  netOpenAdvancesUSD: number;
  activeRate: number;
}

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  totalCount,
  completedCount,
  pendingCount,
  issueCount,
  cancelledCount,
  totalRevenueIQD,
  totalRevenueUSD,
  totalCollectedIQD,
  totalCollectedUSD,
  totalRemainingIQD,
  totalRemainingUSD,
  netOpenAdvancesIQD,
  netOpenAdvancesUSD,
  activeRate,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{totalCount}</div>
            <div className="text-xs font-semibold text-blue-400">
              إجمالي البوالص {cancelledCount > 0 ? `(منها ${cancelledCount} ملغاة)` : ''}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            📋
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{completedCount}</div>
            <div className="text-xs font-semibold text-emerald-400">معاملات منجزة وخالصة</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            ✅
          </div>
        </div>

        {/* Pending */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{pendingCount}</div>
            <div className="text-xs font-semibold text-amber-400">قيد التنفيذ والمتابعة</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
            ⏳
          </div>
        </div>

        {/* Issues / Cancelled */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{issueCount + cancelledCount}</div>
            <div className="text-xs font-semibold text-rose-400">معاملات معلقة / ملغاة دفترياً</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl">
            ⚠️
          </div>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>💰</span> إجمالي الفواتير النشطة
          </div>
          <div className="text-lg font-black text-white font-mono" dir="ltr">
            {formatCurrency(totalRevenueIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalRevenueUSD, 'USD')}
          </div>
          {totalRevenueUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalRevenueIQD + Math.round(totalRevenueUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Collected */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>💵</span> المبالغ المحصلة من الزبائن
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono" dir="ltr">
            {formatCurrency(totalCollectedIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalCollectedUSD, 'USD')}
          </div>
          {totalCollectedUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalCollectedIQD + Math.round(totalCollectedUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Remaining */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>📤</span> الديون المتبقية بذمة الزبائن
          </div>
          <div className="text-lg font-black text-amber-400 font-mono" dir="ltr">
            {formatCurrency(totalRemainingIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-amber-300 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalRemainingUSD, 'USD')}
          </div>
          {totalRemainingUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalRemainingIQD + Math.round(totalRemainingUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Advances */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>🏦</span> السلف المفتوحة بذمة المخلصين
          </div>
          <div className="text-lg font-black text-rose-400 font-mono" dir="ltr">
            {formatCurrency(netOpenAdvancesIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-rose-300 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(netOpenAdvancesUSD, 'USD')}
          </div>
          {netOpenAdvancesUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(netOpenAdvancesIQD + Math.round(netOpenAdvancesUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
