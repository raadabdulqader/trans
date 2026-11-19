import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Currency, Receipt } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { DatePicker } from '../../ui/date-picker';

interface ReceiptFinancialColProps {
  type: Receipt['type'];
  fin: { remainingAmount: number } | null;
  billCurrency: Currency;
  currency: Currency;
  amount: number;
  setAmount: (amt: number) => void;
  setIsAutoRemaining: (val: boolean) => void;
  isBillFullyPaid: boolean;
  isPaymentOverRemaining: boolean;
  date: string;
  setDate: (d: string) => void;
  customRate: number;
  handleRateChange: (val: string) => void;
  activeRate: number;
  previewBreakdown: { grossInBillCurrency: number; netCreditInBillCurrency: number };
  isAutoRemaining: boolean;
  computeRemainingInCurrency: (targetCurr: Currency, rateToUse: number, remainingInBillCurr: number) => number;
  notes: string;
  setNotes: (n: string) => void;
}

export const ReceiptFinancialCol: React.FC<ReceiptFinancialColProps> = ({
  type,
  fin,
  billCurrency,
  currency,
  amount,
  setAmount,
  setIsAutoRemaining,
  isBillFullyPaid,
  isPaymentOverRemaining,
  date,
  setDate,
  customRate,
  handleRateChange,
  activeRate,
  previewBreakdown,
  isAutoRemaining,
  computeRemainingInCurrency,
  notes,
  setNotes,
}) => {
  return (
    <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
      <div className="pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
        <span>المبلغ والتوثيق المالي</span>
        {type === 'payment' && fin && (
          <span className="text-[10px] text-slate-400">
            المتبقي للبوليصة: <strong className={fin.remainingAmount === 0 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'} dir="ltr">{formatCurrency(fin.remainingAmount, billCurrency)}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-300 font-semibold text-[11px]">
              المبلغ {currency === 'USD' ? '($)' : '(د.ع)'} *
            </label>
            {amount > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-400" dir="ltr">
                {currency === 'USD' ? `$${amount.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(amount)} د.ع`}
              </span>
            )}
          </div>
          <input
            type="number"
            min="1"
            step="any"
            required
            disabled={isBillFullyPaid}
            value={amount === 0 ? '' : amount}
            onChange={(e) => {
              const val = e.target.value;
              setIsAutoRemaining(false);
              setAmount(val === '' ? 0 : Number(val));
            }}
            className={`w-full bg-slate-950 border rounded-xl px-3 py-1.5 font-mono font-bold focus:outline-none text-xs ${
              isPaymentOverRemaining
                ? 'border-rose-500 text-rose-400'
                : 'border-slate-700 text-emerald-400 focus:border-emerald-500'
            }`}
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">التاريخ *</label>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            placeholder="اختر تاريخ السند..."
          />
        </div>
      </div>

      {/* Cross-Currency Conversion Bar when Receipt Currency != Bill Currency */}
      {fin && currency !== billCurrency && (
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[11px] flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>تحويل عملة (1$ أو 100$):</span>
            <input
              type="number"
              min="1"
              step="any"
              value={customRate === 0 ? '' : customRate}
              onChange={(e) => handleRateChange(e.target.value)}
              placeholder="1500 أو 150000"
              className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-mono">
              (1$ = {activeRate.toLocaleString('ar-IQ')} د.ع)
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span>
              يعادل من البوليصة:{' '}
              <strong className="font-mono text-emerald-400" dir="ltr">
                {formatCurrency(previewBreakdown.grossInBillCurrency, billCurrency)}
              </strong>
            </span>
            {type === 'payment' && !isAutoRemaining && fin.remainingAmount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsAutoRemaining(true);
                  setAmount(computeRemainingInCurrency(currency, activeRate, fin.remainingAmount));
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold transition"
                title="حساب مبلغ تسديد كامل المتبقي وفق سعر الصرف المحدد"
              >
                كامل المتبقي
              </button>
            )}
          </div>
        </div>
      )}

      {isPaymentOverRemaining && fin && (
        <p className="text-[10px] text-rose-400 font-semibold">
          ⚠️ الصافي المحتسب للبوليصة ({formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurrency)}) يتجاوز المتبقي ({formatCurrency(fin.remainingAmount, billCurrency)})
        </p>
      )}

      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">ملاحظات السند</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: دفعة بموجب إشعار بنكي، سلفة رسوم فحص، تصفية وصولات..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none text-xs"
        />
      </div>
    </div>
  );
};
