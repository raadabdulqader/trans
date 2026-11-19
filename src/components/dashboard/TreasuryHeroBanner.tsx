import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatCurrency, normalizeExchangeRate } from '../../utils/storage';

interface TreasuryHeroBannerProps {
  treasurySummary: {
    currentBalanceIQD: number;
    currentBalanceUSD: number;
    totalEquivalentIQD: number;
  };
  activeRate: number;
  rateInput: string;
  setRateInput: (val: string) => void;
  onUpdateExchangeRate?: (newRate: number, silent?: boolean) => void;
  onOpenExchangeRate?: () => void;
  onOpenTreasury?: () => void;
  exchangeRate: number;
}

export const TreasuryHeroBanner: React.FC<TreasuryHeroBannerProps> = ({
  treasurySummary,
  activeRate,
  rateInput,
  setRateInput,
  onUpdateExchangeRate,
  onOpenExchangeRate,
  onOpenTreasury,
  exchangeRate,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/60 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white">صندوق الشركة المشترك (رأس المال الموحد)</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                السيولة الحية (IQD & USD)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              رأس مال موحد مشترك بين <strong>شركة نقاء البصرة</strong> و <strong>شركة صوت الجنوب</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-right">
            <span className="text-[11px] text-emerald-300/80 block font-bold">🇮🇶 رصيد الصندوق (دينار عراقي):</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight" dir="ltr">
              {formatCurrency(treasurySummary.currentBalanceIQD, 'IQD')}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl px-4 py-2.5 text-right">
            <span className="text-[11px] text-cyan-300/80 block font-bold">🇺🇸 رصيد الصندوق (دولار أمريكي):</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight" dir="ltr">
              {formatCurrency(treasurySummary.currentBalanceUSD, 'USD')}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5" dir="ltr">
              ≈ {formatCurrency(Math.round(treasurySummary.currentBalanceUSD * activeRate), 'IQD')}
            </div>
          </div>

          {onOpenTreasury && (
            <button
              onClick={onOpenTreasury}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>فتح الصندوق والسحب والإيداع</span>
              <span>&larr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Exchange Rate Control Bar inside Dashboard */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 font-bold text-cyan-300">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>تحويل العملة المعتمد في لوحة التحكم (1$ أو 100$):</span>
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-cyan-500/40 rounded-xl px-2.5 py-1">
            <input
              type="number"
              min="1"
              step="any"
              value={rateInput}
              onChange={(e) => {
                const val = e.target.value;
                setRateInput(val);
                const num = Number(val);
                if (num >= 100 && onUpdateExchangeRate) {
                  onUpdateExchangeRate(normalizeExchangeRate(num, 1500), true);
                }
              }}
              onBlur={() => {
                const num = Number(rateInput);
                if (num >= 100 && onUpdateExchangeRate) {
                  const norm = normalizeExchangeRate(num, 1500);
                  setRateInput(String(norm));
                  onUpdateExchangeRate(norm, false);
                } else {
                  setRateInput(String(normalizeExchangeRate(exchangeRate, 1500)));
                }
              }}
              className="w-24 bg-transparent text-cyan-300 font-mono font-black text-sm focus:outline-none text-center"
            />
            <span className="text-[11px] text-slate-400 font-bold">د.ع</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl" dir="ltr">
            1$ = {activeRate.toLocaleString('ar-IQ')} د.ع | 100$ = {Math.round(activeRate * 100).toLocaleString('ar-IQ')} د.ع
          </span>
          {onOpenExchangeRate && (
            <button
              type="button"
              onClick={onOpenExchangeRate}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition cursor-pointer"
            >
              خيارات سريعة
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <span className="text-slate-400 text-[11px]">إجمالي السيولة المقومة بالدينار (IQD + USD):</span>
          <strong className="font-mono font-black text-sm text-amber-300" dir="ltr">
            {formatCurrency(Math.round(treasurySummary.totalEquivalentIQD), 'IQD')}
          </strong>
        </div>
      </div>
    </div>
  );
};
