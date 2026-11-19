'use client';

import React from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Currency } from '../../../types/customs';
import { formatCurrency, CarrierFinancialSummary } from '../../../utils/storage';
import { CurrencySelect } from '../../ui/currency-select';

export interface CarrierPaymentFinancialColProps {
  fin: CarrierFinancialSummary;
  currency: Currency;
  onCurrencyChange: (newCurr: Currency) => void;
  amount: number;
  onAmountChange: (amt: number) => void;
  customRate: number;
  onCustomRateChange: (rate: number) => void;
  activeRate: number;
}

export const CarrierPaymentFinancialCol: React.FC<CarrierPaymentFinancialColProps> = ({
  fin,
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  customRate,
  onCustomRateChange,
  activeRate,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
      {/* Carrier Remaining Debt Summary */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold">إجمالي مستحقات الناقل:</span>
          <span className="font-mono font-bold text-slate-200" dir="ltr">
            {formatCurrency(fin.totalCostIQD, 'IQD')}
            {fin.totalCostUSD > 0 ? ` + ${formatCurrency(fin.totalCostUSD, 'USD')}` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold">المسدد سابقاً من الصندوق:</span>
          <span className="font-mono font-bold text-emerald-400" dir="ltr">
            {formatCurrency(fin.paidIQD, 'IQD')}
            {fin.paidUSD > 0 ? ` + ${formatCurrency(fin.paidUSD, 'USD')}` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
          <span className="text-amber-300 font-bold">المتبقي لشركة النقل بذمتنا:</span>
          <div className="font-mono font-black text-sm text-amber-400" dir="ltr">
            {fin.remainingIQD > 0 && <span>{formatCurrency(fin.remainingIQD, 'IQD')}</span>}
            {fin.remainingIQD > 0 && fin.remainingUSD > 0 && <span> + </span>}
            {fin.remainingUSD > 0 && <span className="text-cyan-400">{formatCurrency(fin.remainingUSD, 'USD')}</span>}
            {fin.remainingIQD === 0 && fin.remainingUSD === 0 && (
              <span className="text-emerald-400">0 د.ع (مصفى بالكامل)</span>
            )}
          </div>
        </div>
      </div>

      {/* Currency Selector via Shadcn Select with RTL */}
      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
        <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5 shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>عملة التسديد:</span>
        </span>
        <div className="flex-1 max-w-[220px]">
          <CurrencySelect
            value={currency}
            onValueChange={onCurrencyChange}
            size="sm"
          />
        </div>
      </div>

      {/* Payment Amount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-slate-300 font-semibold text-xs">
            مبلغ الدفعة المسددة للناقل ({currency === 'USD' ? '$' : 'د.ع'}) *
          </label>
          {amount > 0 && (
            <span className="text-[11px] font-mono font-bold text-amber-400" dir="ltr">
              {formatCurrency(amount, currency)}
            </span>
          )}
        </div>
        <input
          type="number"
          min="1"
          step="any"
          required
          value={amount === 0 ? '' : amount}
          onChange={(e) => onAmountChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
        />
      </div>

      {/* Exchange Rate Box */}
      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>سعر الصرف (1$ أو 100$):</span>
            <input
              type="number"
              min="1"
              step="any"
              value={customRate === 0 ? '' : customRate}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Number(e.target.value);
                onCustomRateChange(val);
              }}
              className="w-24 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 font-mono text-cyan-300 focus:outline-none"
            />
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            1$ = {activeRate.toLocaleString('ar-IQ')} د.ع
          </span>
        </div>
      </div>
    </div>
  );
};
