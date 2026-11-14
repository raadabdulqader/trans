import React from 'react';
import { 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  Paperclip, 
  DollarSign, 
  ChevronsUpDown 
} from 'lucide-react';
import { formatCurrency, TreasuryFinancialSummary } from '../../utils/storage';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';

export interface TreasuryMetricsCardsProps {
  isMetricsOpen: boolean;
  onToggleMetrics: (open: boolean) => void;
  summary: TreasuryFinancialSummary;
  onOpenExchangeRate?: () => void;
  naqaaInflow: number;
  naqaaOutflow: number;
  naqaaNet: number;
  sawtInflow: number;
  sawtOutflow: number;
  sawtNet: number;
  sharedInflow: number;
  sharedOutflow: number;
  totalArchivedCount: number;
}

export const TreasuryMetricsCards: React.FC<TreasuryMetricsCardsProps> = ({
  isMetricsOpen,
  onToggleMetrics,
  summary,
  onOpenExchangeRate,
  naqaaInflow,
  naqaaOutflow,
  naqaaNet,
  sawtInflow,
  sawtOutflow,
  sawtNet,
  sharedInflow,
  sharedOutflow,
  totalArchivedCount,
}) => {
  return (
    <Collapsible
      open={isMetricsOpen}
      onOpenChange={onToggleMetrics}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl transition-all"
    >
      {/* Executive Header with CollapsibleTrigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                صندوق الشركة والخزينة المالية
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                صندوق ثنائي العملة (د.ع + $)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              حساب مركزي مشترك يغذي عمليات شركة نقاء البصرة وشركة صوت الجنوب بعملتي الدينار والدولار
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick Dual Balance Preview Badges */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">دينار:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm" dir="ltr">
              {formatCurrency(summary.currentBalanceIQD, 'IQD')}
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-medium">دولار:</span>
            <span className="font-mono font-bold text-cyan-400 text-xs sm:text-sm" dir="ltr">
              {formatCurrency(summary.currentBalanceUSD, 'USD')}
            </span>
          </div>

          {/* Daily Exchange Rate button */}
          {onOpenExchangeRate && (
            <button
              type="button"
              onClick={onOpenExchangeRate}
              title="تعديل سعر الصرف اليومي للـ 100 دولار"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]" dir="ltr">
                100$ = {((summary.exchangeRate || 1500) * 100).toLocaleString('ar-IQ')} د.ع
              </span>
            </button>
          )}

          {/* Inflow / Outflow Pills when collapsed */}
          {!isMetricsOpen && (
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                وارد د.ع: {formatCurrency(summary.totalInflowIQD, 'IQD')}
              </span>
              <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                صادر د.ع: {formatCurrency(summary.totalOutflowIQD, 'IQD')}
              </span>
            </div>
          )}

          {/* Collapsible Trigger Button */}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 hover:border-emerald-500/40 transition cursor-pointer shadow-sm group"
              title={isMetricsOpen ? 'طي المؤشرات وتوزيع الحصص' : 'عرض المؤشرات وتوزيع الحصص'}
            >
              <span>{isMetricsOpen ? 'طي المؤشرات والتوزيع' : 'إظهار مؤشرات وتوزيع الصندوق'}</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" />
            </button>
          </CollapsibleTrigger>
        </div>
      </div>

      {/* Collapsible Content */}
      <CollapsibleContent className="space-y-4 pt-4 mt-3 border-t border-slate-800/80">
        
        {/* Dual Company Contribution Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Naqaa Basra */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base">
                🌿
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>شركة نقاء البصرة</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-normal">بوالص وحسابات</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>وارد: <strong className="text-emerald-400 font-mono">{formatCurrency(naqaaInflow)}</strong></span>
                  <span>•</span>
                  <span>صرف: <strong className="text-rose-400 font-mono">{formatCurrency(naqaaOutflow)}</strong></span>
                </div>
              </div>
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-slate-400">صافي المساهمة (معادل)</div>
              <div className={`text-xs font-bold ${naqaaNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                {formatCurrency(naqaaNet)}
              </div>
            </div>
          </div>

          {/* Sawt Al-Janoub */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-base">
                ⚓
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>شركة صوت الجنوب</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-normal">بوالص وحسابات</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>وارد: <strong className="text-emerald-400 font-mono">{formatCurrency(sawtInflow)}</strong></span>
                  <span>•</span>
                  <span>صرف: <strong className="text-rose-400 font-mono">{formatCurrency(sawtOutflow)}</strong></span>
                </div>
              </div>
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-slate-400">صافي المساهمة (معادل)</div>
              <div className={`text-xs font-bold ${sawtNet >= 0 ? 'text-cyan-400' : 'text-rose-400'}`} dir="ltr">
                {formatCurrency(sawtNet)}
              </div>
            </div>
          </div>

          {/* Shared Capital / Admin */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-base">
                🏛️
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>صندوق الشركة المشترك</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-normal">رأس المال العام</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>إيداع: <strong className="text-emerald-400 font-mono">{formatCurrency(sharedInflow)}</strong></span>
                  <span>•</span>
                  <span>سحب: <strong className="text-rose-400 font-mono">{formatCurrency(sharedOutflow)}</strong></span>
                </div>
              </div>
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-slate-400">رأس المال الكلي (معادل)</div>
              <div className="text-xs font-bold text-emerald-400" dir="ltr">
                {formatCurrency(summary.totalEquivalentIQD)}
              </div>
            </div>
          </div>
        </div>
        
        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Treasury Main Balance */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4" />
                <span>رصيد صندوق الشركة الفعلي</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                ثنائي العملة
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">رصيد الدينار:</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono" dir="ltr">
                  {formatCurrency(summary.currentBalanceIQD, 'IQD')}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-1">
                <span className="text-xs text-slate-400 font-medium">رصيد الدولار:</span>
                <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono" dir="ltr">
                  {formatCurrency(summary.currentBalanceUSD, 'USD')}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">إجمالي السيولة المعادل:</span>
              <strong className="text-emerald-400 font-mono font-bold" dir="ltr">
                {formatCurrency(summary.totalEquivalentIQD, 'IQD')}
              </strong>
            </div>
          </div>

          {/* Total Inflow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span>إجمالي الواردات والمقبوضات</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">وارد (+)</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono" dir="ltr">
                {formatCurrency(summary.totalInflowIQD, 'IQD')}
              </div>
              {summary.totalInflowUSD > 0 && (
                <div className="text-xs font-bold text-cyan-400 font-mono" dir="ltr">
                  + {formatCurrency(summary.totalInflowUSD, 'USD')}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
              <span>إيداع مباشر: {formatCurrency(summary.directDepositsIQD, 'IQD')}</span>
              <span>دفعات زبائن: {formatCurrency(summary.customerCollectionsIQD, 'IQD')}</span>
            </div>
          </div>

          {/* Total Outflow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>إجمالي المصروفات والسحوبات</span>
              </span>
              <span className="text-[10px] text-rose-400 font-bold font-mono">صادر (-)</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-black text-rose-400 font-mono" dir="ltr">
                {formatCurrency(summary.totalOutflowIQD, 'IQD')}
              </div>
              {summary.totalOutflowUSD > 0 && (
                <div className="text-xs font-bold text-rose-300 font-mono" dir="ltr">
                  - {formatCurrency(summary.totalOutflowUSD, 'USD')}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
              <span>سحوبات ومصاريف: {formatCurrency(summary.directWithdrawalsIQD, 'IQD')}</span>
              <span>سلف مخلصين: {formatCurrency(summary.brokerAdvancesIQD, 'IQD')}</span>
            </div>
          </div>

          {/* Archived Vouchers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span>الوصولات المؤرشفة إلكترونياً</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                الأرشيف
              </span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {totalArchivedCount} <span className="text-xs text-slate-400 font-normal">وصل مؤرشف</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">معاينة فورية للوصولات بنقرة واحدة دون الحاجة للتحميل</p>
          </div>

        </div>

      </CollapsibleContent>
    </Collapsible>
  );
};
