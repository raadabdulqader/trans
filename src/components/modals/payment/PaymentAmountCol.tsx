import React from 'react';
import { DollarSign, SplitSquareVertical, RefreshCw } from 'lucide-react';
import { Currency } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { PaymentMode } from '../QuickPaymentModal';

interface PaymentAmountColProps {
  isMixed: boolean;
  fin: { remainingAmount: number; remainingAmountUSD?: number };
  billCurr: Currency;
  totalRemainingInRefCurr: number;
  payMode: PaymentMode;
  onModeSwitch: (mode: PaymentMode) => void;
  amountIQD: number;
  setAmountIQD: (val: number) => void;
  amountUSD: number;
  setAmountUSD: (val: number) => void;
  customRate: number;
  onRateChange: (raw: string) => void;
  activeRate: number;
  effectiveCreditInRefCurr: number;
  isOverRemaining: boolean;
}

export const PaymentAmountCol: React.FC<PaymentAmountColProps> = ({
  isMixed,
  fin,
  billCurr,
  totalRemainingInRefCurr,
  payMode,
  onModeSwitch,
  amountIQD,
  setAmountIQD,
  amountUSD,
  setAmountUSD,
  customRate,
  onRateChange,
  activeRate,
  effectiveCreditInRefCurr,
  isOverRemaining,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
      {/* Remaining Debt Status Banner */}
      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
        <span className="text-slate-400 font-semibold">المتبقي على البوليصة حالياً:</span>
        <div className="text-right">
          {isMixed ? (
            <div className="font-mono font-bold text-sm text-amber-400" dir="ltr">
              {formatCurrency(fin.remainingAmount, 'IQD')} + {formatCurrency(fin.remainingAmountUSD || 0, 'USD')}
            </div>
          ) : (
            <span className={`font-mono font-bold text-sm ${fin.remainingAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
              {formatCurrency(fin.remainingAmount, billCurr)}
            </span>
          )}
          {((isMixed && (fin.remainingAmountUSD || 0) > 0) || (billCurr === 'USD' && fin.remainingAmount > 0)) && (
            <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
              ≈ {new Intl.NumberFormat('ar-IQ').format(totalRemainingInRefCurr)} د.ع
            </div>
          )}
        </div>
      </div>

      {/* Payment Mode Selector: IQD / USD / Split */}
      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
        <div className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>طريقة وعملة القبض من الزبون:</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onModeSwitch('IQD')}
            className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
              payMode === 'IQD'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🇮🇶 دينار فقط
          </button>
          <button
            type="button"
            onClick={() => onModeSwitch('USD')}
            className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
              payMode === 'USD'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🇺🇸 دولار فقط
          </button>
          <button
            type="button"
            onClick={() => onModeSwitch('split')}
            className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] flex items-center justify-center gap-1 ${
              payMode === 'split'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3 h-3" />
            <span>دينار + دولار معاً</span>
          </button>
        </div>
      </div>

      {/* Payment Input Fields */}
      <div className="space-y-2.5">
        {(payMode === 'IQD' || payMode === 'split') && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold text-xs">
                المقبوض نقداً بالدينار (د.ع) <span className="text-rose-400">*</span>
              </label>
              {amountIQD > 0 && (
                <span className="text-[11px] font-mono font-bold text-emerald-400" dir="ltr">
                  {formatCurrency(amountIQD, 'IQD')}
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="any"
              required={payMode === 'IQD'}
              value={amountIQD === 0 ? '' : amountIQD}
              onChange={(e) => {
                const val = e.target.value;
                setAmountIQD(val === '' ? 0 : Number(val));
              }}
              placeholder="0 د.ع"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}

        {(payMode === 'USD' || payMode === 'split') && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold text-xs">
                المقبوض نقداً بالدولار ($) <span className="text-rose-400">*</span>
              </label>
              {amountUSD > 0 && (
                <span className="text-[11px] font-mono font-bold text-cyan-400" dir="ltr">
                  {formatCurrency(amountUSD, 'USD')}
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="any"
              required={payMode === 'USD'}
              value={amountUSD === 0 ? '' : amountUSD}
              onChange={(e) => {
                const val = e.target.value;
                setAmountUSD(val === '' ? 0 : Number(val));
              }}
              placeholder="$0"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Exchange Rate Input for Conversion */}
        {(payMode !== 'IQD' || billCurr === 'USD' || isMixed) && (
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>سعر الصرف المعتمد (1$ أو 100$):</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customRate === 0 ? '' : customRate}
                  onChange={(e) => onRateChange(e.target.value)}
                  placeholder="1500 أو 150000"
                  className="w-24 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 font-mono text-cyan-300 focus:outline-none"
                />
              </span>
              <span className="text-slate-200 font-semibold">
                المعادل الكلي: <strong className="font-mono text-emerald-400 text-sm" dir="ltr">{formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}</strong>
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              1$ = {activeRate.toLocaleString('ar-IQ')} د.ع (100$ = {Math.round(activeRate * 100).toLocaleString('ar-IQ')} د.ع)
            </div>
          </div>
        )}

        {isOverRemaining && (
          <p className="text-[11px] text-rose-400 mt-1.5 font-semibold">
            ⚠️ الصافي المحتسب ({formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}) أكبر من المتبقي المستحق ({formatCurrency(totalRemainingInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')})
          </p>
        )}
      </div>
    </div>
  );
};
