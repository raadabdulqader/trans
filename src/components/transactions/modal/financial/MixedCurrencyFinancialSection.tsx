'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { formatCurrency } from '../../../../utils/storage';

export interface MixedCurrencyFinancialSectionProps {
  activeRate: number;
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  initialPaid: number;
  setInitialPaid: (amount: number) => void;
  totalAmountUSD: number;
  setTotalAmountUSD: (amount: number) => void;
  initialPaidUSD: number;
  setInitialPaidUSD: (amount: number) => void;
  remaining: number;
  remainingUSD: number;
}

export const MixedCurrencyFinancialSection: React.FC<MixedCurrencyFinancialSectionProps> = ({
  activeRate,
  totalAmount,
  setTotalAmount,
  initialPaid,
  setInitialPaid,
  totalAmountUSD,
  setTotalAmountUSD,
  initialPaidUSD,
  setInitialPaidUSD,
  remaining,
  remainingUSD,
}) => {
  return (
    <div className="space-y-2 p-2.5 sm:p-3 bg-slate-900 rounded-xl border border-amber-500/30 shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 flex-wrap gap-2">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>إنفاق البوليصة بالعملتين (دينار + دولار معاً):</span>
        </span>
        <span className="text-[11px] text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          1$ = {activeRate.toLocaleString('ar-IQ')} د.ع
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Part 1: IQD Agreement */}
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>🇮🇶</span>
              <span>دينار عراقي (د.ع)</span>
            </span>
            <span className="text-[11px] text-slate-300">
              المتبقي: <strong className={`font-mono font-bold ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">{formatCurrency(remaining, 'IQD')}</strong>
            </span>
          </div>
          <div className="space-y-1">
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-0.5">
                المبلغ الكلي بالدينار <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={totalAmount === 0 ? '' : totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                placeholder="5,000,000 د.ع"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-0.5">
                المقدم المقبوض بالدينار
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={initialPaid === 0 ? '' : initialPaid}
                onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                placeholder="0 د.ع"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Part 2: USD Agreement */}
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <span>🇺🇸</span>
              <span>دولار أمريكي ($)</span>
            </span>
            <span className="text-[11px] text-slate-300">
              المتبقي: <strong className={`font-mono font-bold ${remainingUSD === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">{formatCurrency(remainingUSD, 'USD')}</strong>
            </span>
          </div>
          <div className="space-y-1">
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-0.5">
                المبلغ الكلي بالدولار <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={totalAmountUSD === 0 ? '' : totalAmountUSD}
                onChange={(e) => setTotalAmountUSD(Number(e.target.value) || 0)}
                placeholder="$2,000"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-[11px] font-bold mb-0.5">
                المقدم المقبوض بالدولار
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={initialPaidUSD === 0 ? '' : initialPaidUSD}
                onChange={(e) => setInitialPaidUSD(Number(e.target.value) || 0)}
                placeholder="$0"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-cyan-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mixed Contract Live Summary Box */}
      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">المبلغ الكلي:</span>
          <span className="font-mono font-bold text-white" dir="ltr">
            {formatCurrency(totalAmount || 0, 'IQD')} + {formatCurrency(totalAmountUSD || 0, 'USD')}
          </span>
          <span className="text-slate-500 text-[10px]">
            (≈ {new Intl.NumberFormat('ar-IQ').format((totalAmount || 0) + ((totalAmountUSD || 0) * activeRate))} د.ع)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold">المتبقي:</span>
          <span className="font-mono font-bold text-amber-400" dir="ltr">
            {formatCurrency(remaining, 'IQD')} + {formatCurrency(remainingUSD, 'USD')}
          </span>
        </div>
      </div>
    </div>
  );
};
