import React from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { Currency, TreasuryMovementType } from '../../../types/customs';
import { formatCurrency, normalizeExchangeRate } from '../../../utils/storage';
import { DatePicker } from '../../ui/date-picker';

interface TreasuryFinancialFormProps {
  amount: number;
  setAmount: (val: number) => void;
  currency: Currency;
  type: TreasuryMovementType;
  category: string;
  setCategory: (val: string) => void;
  categories: string[];
  date: string;
  setDate: (val: string) => void;
  voucherNo: string;
  setVoucherNo: (val: string) => void;
  isSwap: boolean;
  localRate: number;
  setLocalRate: (val: number) => void;
  activeRate: number;
  targetSwapCurrency: Currency;
  targetSwapAmount: number;
  setCustomSwapAmount: (val: number | null) => void;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
}

export const TreasuryFinancialForm: React.FC<TreasuryFinancialFormProps> = ({
  amount,
  setAmount,
  currency,
  type,
  category,
  setCategory,
  categories,
  date,
  setDate,
  voucherNo,
  setVoucherNo,
  isSwap,
  localRate,
  setLocalRate,
  activeRate,
  targetSwapCurrency,
  targetSwapAmount,
  setCustomSwapAmount,
  onExchangeRateChange,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-bold text-slate-200">
        <span className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>البيانات المالية وتصنيف الحركة</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">القسم المالي</span>
      </div>

      {/* Amount Hero Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
            <span>مبلغ السند المطلوب</span>
            <span className="text-rose-400 font-bold">*</span>
          </label>
          {amount > 0 && (
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20" dir="ltr">
              {formatCurrency(amount, currency)}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            required
            value={amount === 0 ? '' : amount}
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val === '' ? 0 : Number(val));
            }}
            placeholder="أدخل المبلغ هنا..."
            className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-black text-sm tracking-wide focus:outline-none transition ${
              type === 'deposit' 
                ? 'text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                : 'text-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
            }`}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            {currency === 'USD' ? 'USD $' : 'IQD د.ع'}
          </span>
        </div>
      </div>

      {/* Category & Date Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تصنيف الحركة *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-medium focus:border-emerald-500 focus:outline-none text-xs"
          >
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ الحركة *</label>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            placeholder="اختر تاريخ الحركة..."
          />
        </div>
      </div>

      {/* Voucher Number (Auto-Generated / Editable) */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم السند الدفتري *</label>
        <input
          type="text"
          required
          value={voucherNo}
          onChange={(e) => setVoucherNo(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none text-xs"
        />
      </div>

      {/* FX Swap / Exchange Rate Details */}
      {(isSwap || currency === 'USD') && (
        <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-200 text-[11px] space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>سعر الصرف (1$):</span>
              <input
                type="number"
                min="1"
                step="any"
                value={localRate === 0 ? '' : localRate}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = val === '' ? 0 : Number(val);
                  setLocalRate(num);
                  setCustomSwapAmount(null);
                  if (num >= 100 && onExchangeRateChange) {
                    onExchangeRateChange(normalizeExchangeRate(num, 1500), true);
                  }
                }}
                className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none text-center"
              />
              <span className="text-[10px] text-slate-400 font-mono">د.ع</span>
            </div>

            {!isSwap && (
              <div className="text-slate-300 font-mono text-[11px]">
                المعادل بالدينار: <strong className="text-emerald-400 font-bold" dir="ltr">{new Intl.NumberFormat('ar-IQ').format(Math.round(amount * activeRate))} د.ع</strong>
              </div>
            )}
          </div>

          {isSwap && (
            <div className="flex items-center justify-between border-t border-cyan-500/20 pt-1.5 text-[11px]">
              <span className="font-bold text-cyan-300">المقابل في الصندوق ({targetSwapCurrency === 'IQD' ? 'د.ع' : '$'}):</span>
              <input
                type="number"
                min="0"
                step="any"
                value={targetSwapAmount === 0 ? '' : targetSwapAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomSwapAmount(val === '' ? 0 : Number(val));
                }}
                className="w-32 bg-slate-950 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none text-center"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
