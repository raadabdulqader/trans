import React from 'react';
import { DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import { Currency, Transaction, TreasuryTransaction } from '../../../types/customs';
import { normalizeExchangeRate } from '../../../utils/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { SingleCurrencyFinancialSection } from './financial/SingleCurrencyFinancialSection';
import { MixedCurrencyFinancialSection } from './financial/MixedCurrencyFinancialSection';
import { BillDirectExpensesSection } from './financial/BillDirectExpensesSection';

export interface TransactionFinancialTabProps {
  isMixedCurrency: boolean;
  setIsMixedCurrency: (val: boolean) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  localRate: number;
  setLocalRate: (rate: number) => void;
  activeRate: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
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
  equivalentInitialInBillCurr: number;
  initialData?: Transaction | null;
  directExpensesOnBill: TreasuryTransaction[];
  directExpensesIQDOnBill: number;
  directExpensesUSDOnBill: number;
  onOpenAddExpense?: (transaction: Transaction) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const TransactionFinancialTab: React.FC<TransactionFinancialTabProps> = ({
  isMixedCurrency,
  setIsMixedCurrency,
  currency,
  setCurrency,
  localRate,
  setLocalRate,
  activeRate,
  onExchangeRateChange,
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
  equivalentInitialInBillCurr,
  initialData,
  directExpensesOnBill,
  directExpensesIQDOnBill,
  directExpensesUSDOnBill,
  onOpenAddExpense,
  onPrev,
  onNext,
}) => {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-200 text-xs">
      {/* Currency Selector & Rate Pill Bar */}
      <div className="bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-750 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold flex items-center gap-1.5 shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>عملة الإنفاق:</span>
            </span>
            <div className="w-[220px] sm:w-[250px]">
              <Select
                value={isMixedCurrency ? 'MIXED' : currency}
                onValueChange={(val) => {
                  if (val === 'MIXED') {
                    setIsMixedCurrency(true);
                    setCurrency('IQD');
                  } else {
                    setIsMixedCurrency(false);
                    setCurrency(val as Currency);
                  }
                }}
                dir="rtl"
              >
                <SelectTrigger className="h-8 text-xs font-bold border-slate-700 bg-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl" className="min-w-[240px]">
                  <SelectItem value="IQD">
                    <span className="font-bold text-emerald-400">🇮🇶 دينار عراقي فقط (IQD)</span>
                  </SelectItem>
                  <SelectItem value="USD">
                    <span className="font-bold text-cyan-400">🇺🇸 دولار أمريكي فقط ($)</span>
                  </SelectItem>
                  <SelectItem value="MIXED">
                    <span className="font-bold text-amber-400">🔄 مركب (دينار + دولار معاً)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-[11px]">سعر الصرف (1$):</span>
            <input
              type="number"
              min="1"
              value={localRate === 0 ? '' : localRate}
              onChange={(e) => {
                const val = e.target.value;
                const num = val === '' ? 0 : Number(val);
                setLocalRate(num);
                if (num >= 100 && onExchangeRateChange) {
                  onExchangeRateChange(normalizeExchangeRate(num, 1500), true);
                }
              }}
              className="w-16 h-6.5 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-emerald-400 font-black focus:border-emerald-500 focus:outline-none text-center font-mono text-xs"
            />
            <span className="text-slate-400 font-mono text-[11px]">({activeRate.toLocaleString('ar-IQ')} د.ع)</span>
          </div>
        </div>
      </div>

      {/* Single Currency Inputs */}
      {!isMixedCurrency ? (
        <SingleCurrencyFinancialSection
          currency={currency}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          activeRate={activeRate}
          remaining={remaining}
          initialPaid={initialPaid}
          setInitialPaid={setInitialPaid}
          initialPaidUSD={initialPaidUSD}
          setInitialPaidUSD={setInitialPaidUSD}
          equivalentInitialInBillCurr={equivalentInitialInBillCurr}
        />
      ) : (
        <MixedCurrencyFinancialSection
          activeRate={activeRate}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          initialPaid={initialPaid}
          setInitialPaid={setInitialPaid}
          totalAmountUSD={totalAmountUSD}
          setTotalAmountUSD={setTotalAmountUSD}
          initialPaidUSD={initialPaidUSD}
          setInitialPaidUSD={setInitialPaidUSD}
          remaining={remaining}
          remainingUSD={remainingUSD}
        />
      )}

      {/* Direct Operational Expenses on Bill */}
      <BillDirectExpensesSection
        directExpensesOnBill={directExpensesOnBill}
        directExpensesIQDOnBill={directExpensesIQDOnBill}
        directExpensesUSDOnBill={directExpensesUSDOnBill}
        initialData={initialData}
        onOpenAddExpense={onOpenAddExpense}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onPrev}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى البيانات</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
        >
          <span>المتابعة إلى الحاويات والنقل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
