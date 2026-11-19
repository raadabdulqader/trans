'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { Currency } from '../../../../types/customs';
import { formatCurrency } from '../../../../utils/storage';

export interface SingleCurrencyFinancialSectionProps {
  currency: Currency;
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  activeRate: number;
  remaining: number;
  initialPaid: number;
  setInitialPaid: (amount: number) => void;
  initialPaidUSD: number;
  setInitialPaidUSD: (amount: number) => void;
  equivalentInitialInBillCurr: number;
}

export const SingleCurrencyFinancialSection: React.FC<SingleCurrencyFinancialSectionProps> = ({
  currency,
  totalAmount,
  setTotalAmount,
  activeRate,
  remaining,
  initialPaid,
  setInitialPaid,
  initialPaidUSD,
  setInitialPaidUSD,
  equivalentInitialInBillCurr,
}) => {
  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-750 shadow-xs space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
        <div>
          <label className="block text-slate-200 font-bold mb-1 text-xs">
            المبلغ الكلي للبوليصة ({currency === 'USD' ? 'دولار $' : 'دينار د.ع'}) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              required
              value={totalAmount === 0 ? '' : totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-slate-100 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold font-mono text-xs text-slate-400 pointer-events-none">
              {currency === 'USD' ? '$' : 'د.ع'}
            </span>
          </div>
          {currency === 'USD' && totalAmount > 0 && (
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 font-semibold">
              المعادل: ≈ <strong className="text-emerald-400 font-bold">{new Intl.NumberFormat('ar-IQ').format(Math.round(totalAmount * activeRate))} د.ع</strong>
            </div>
          )}
        </div>

        {/* Financial KPI Card (Remaining) */}
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-bold text-xs block">المتبقي الصافي بذمة الزبون:</span>
            <span className="text-[10px] text-slate-500">بعد خصم الدفعات المسددة</span>
          </div>
          <span className={`font-mono font-black text-sm sm:text-base ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
            {formatCurrency(remaining, currency)}
          </span>
        </div>
      </div>

      {/* Dual-currency initial payment fields */}
      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-800/80">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>استلام الدفعة الأولى (المقدم) من الزبون:</span>
          </span>
          {(initialPaid > 0 || (initialPaidUSD || 0) > 0) && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" dir="ltr">
              المعادل المخصوم: {formatCurrency(equivalentInitialInBillCurr, currency)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-bold mb-0.5 text-[11px]">
              المقبوض نقداً بالدينار (د.ع)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={initialPaid === 0 ? '' : initialPaid}
                onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                placeholder="0 د.ع"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-emerald-400 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold font-mono text-xs text-slate-500 pointer-events-none">
                د.ع
              </span>
            </div>
            {currency === 'USD' && initialPaid > 0 && (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                يعادل: ≈ <strong className="text-emerald-400 font-bold">${(Math.round((initialPaid / activeRate) * 100) / 100).toLocaleString()}</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-0.5 text-[11px]">
              المقبوض نقداً بالدولار ($)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={initialPaidUSD === 0 ? '' : initialPaidUSD}
                onChange={(e) => setInitialPaidUSD(Number(e.target.value) || 0)}
                placeholder="$0"
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-cyan-400 font-mono text-xs font-bold focus:border-cyan-500 focus:outline-none"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold font-mono text-xs text-slate-500 pointer-events-none">
                $
              </span>
            </div>
            {currency === 'IQD' && (initialPaidUSD || 0) > 0 && (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                يعادل: ≈ <strong className="text-cyan-400 font-bold">{new Intl.NumberFormat('ar-IQ').format(Math.round((initialPaidUSD || 0) * activeRate))} د.ع</strong>
              </div>
            )}
          </div>
        </div>

        {/* Live Treasury Reflection Preview */}
        {(initialPaid > 0 || (initialPaidUSD || 0) > 0) && (
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-1.5">
            <span className="font-semibold text-slate-400">انعكاس الصندوق:</span>
            <div className="font-mono font-bold flex items-center gap-2">
              {initialPaid > 0 && (
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  +{new Intl.NumberFormat('ar-IQ').format(initialPaid)} د.ع
                </span>
              )}
              {initialPaid > 0 && (initialPaidUSD || 0) > 0 && <span className="text-slate-600">|</span>}
              {(initialPaidUSD || 0) > 0 && (
                <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                  +${(initialPaidUSD || 0).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
