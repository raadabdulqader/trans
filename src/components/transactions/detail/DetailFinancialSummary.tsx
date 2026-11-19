import React from 'react';
import { Transaction } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface DetailFinancialSummaryProps {
  transaction: Transaction;
  fin: {
    totalAmount: number;
    totalAmountUSD?: number;
    totalCollected: number;
    totalCollectedUSD?: number;
    remainingAmount: number;
    remainingAmountUSD?: number;
    openAdvancesIQD?: number;
    openAdvancesUSD?: number;
    totalDirectExpensesIQD?: number;
    totalDirectExpensesUSD?: number;
    totalDirectExpenses?: number;
    netEstimatedProfit?: number;
    totalCarrierCost?: number;
  };
  exchangeRate: number;
  directExpensesCount: number;
}

export const DetailFinancialSummary: React.FC<DetailFinancialSummaryProps> = ({
  transaction,
  fin,
  exchangeRate,
  directExpensesCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {/* 1. Total Bill Amount */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
        <div className="text-[10px] text-slate-400 font-medium">المبلغ الكلي للبوليصة:</div>
        <div className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5" dir="ltr">
          {transaction.isMixedCurrency ? (
            <div className="flex flex-col text-[11px] leading-tight">
              <span>{formatCurrency(fin.totalAmount || 0, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.totalAmountUSD || 0, 'USD')}</span>
            </div>
          ) : (
            formatCurrency(fin.totalAmount, transaction.currency || 'IQD')
          )}
        </div>
        {transaction.currency === 'USD' && !transaction.isMixedCurrency && (
          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
            ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalAmount * exchangeRate))} د.ع
          </div>
        )}
        {transaction.isMixedCurrency && (
          <div className="text-[9px] text-slate-400 font-mono mt-0.5" dir="ltr">
            ≈ {new Intl.NumberFormat('ar-IQ').format((fin.totalAmount || 0) + ((fin.totalAmountUSD || 0) * exchangeRate))} د.ع
          </div>
        )}
        {(fin.totalCarrierCost || 0) > 0 && (
          <div className="mt-1 text-[9px] text-amber-300 font-mono" dir="rtl">
            أجور نقل متضمنة: <span className="font-bold">{formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}</span>
          </div>
        )}
      </div>

      {/* 2. Paid / Collected */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
        <div className="text-[10px] text-slate-400 font-medium">المسدد من الزبون:</div>
        <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono mt-0.5" dir="ltr">
          {transaction.isMixedCurrency ? (
            <div className="flex flex-col text-[11px] leading-tight">
              <span>{formatCurrency(fin.totalCollected, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.totalCollectedUSD || 0, 'USD')}</span>
            </div>
          ) : (
            formatCurrency(fin.totalCollected, transaction.currency || 'IQD')
          )}
        </div>
        {transaction.currency === 'USD' && fin.totalCollected > 0 && !transaction.isMixedCurrency && (
          <div className="text-[9px] text-emerald-300/80 font-mono mt-0.5">
            ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalCollected * exchangeRate))} د.ع
          </div>
        )}
      </div>

      {/* 3. Remaining on Customer */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
        <div className="text-[10px] text-slate-400 font-medium">المتبقي على الزبون:</div>
        <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono mt-0.5" dir="ltr">
          {transaction.isMixedCurrency ? (
            (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0) ? (
              <div className="flex flex-col text-[11px] leading-tight">
                <span>{formatCurrency(fin.remainingAmount, 'IQD')}</span>
                <span className="text-cyan-400">+{formatCurrency(fin.remainingAmountUSD || 0, 'USD')}</span>
              </div>
            ) : (
              <span className="text-emerald-400 font-semibold text-xs">0 (خالص)</span>
            )
          ) : (
            formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')
          )}
        </div>
        {transaction.currency === 'USD' && fin.remainingAmount > 0 && !transaction.isMixedCurrency && (
          <div className="text-[9px] text-amber-300/80 font-mono mt-0.5">
            ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.remainingAmount * exchangeRate))} د.ع
          </div>
        )}
      </div>

      {/* 4. Broker Advances */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
        <div className="text-[10px] text-slate-400 font-medium">سلف المخلص:</div>
        <div className="text-xs sm:text-sm font-bold text-rose-400 font-mono mt-0.5" dir="ltr">
          {(fin.openAdvancesIQD || 0) > 0 && (fin.openAdvancesUSD || 0) > 0 ? (
            <div className="flex flex-col text-[11px] leading-tight">
              <span>{formatCurrency(fin.openAdvancesIQD || 0, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.openAdvancesUSD || 0, 'USD')}</span>
            </div>
          ) : (fin.openAdvancesUSD || 0) > 0 ? (
            formatCurrency(fin.openAdvancesUSD || 0, 'USD')
          ) : (fin.openAdvancesIQD || 0) > 0 ? (
            formatCurrency(fin.openAdvancesIQD || 0, 'IQD')
          ) : (
            formatCurrency(0, transaction.currency || 'IQD')
          )}
        </div>
      </div>

      {/* 5. Direct Expenses & Net Profit */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 col-span-2 sm:col-span-2">
        <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
          <span>مصاريف البوليصة:</span>
          <span className="text-[9px] text-slate-400 font-mono">({directExpensesCount} سند)</span>
        </div>
        <div className="text-xs sm:text-sm font-bold text-purple-300 font-mono mt-0.5" dir="ltr">
          {(fin.totalDirectExpensesIQD || 0) > 0 && (fin.totalDirectExpensesUSD || 0) > 0 ? (
            <div className="flex flex-col text-[11px] leading-tight">
              <span>{formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')}</span>
            </div>
          ) : (fin.totalDirectExpensesUSD || 0) > 0 ? (
            formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')
          ) : (fin.totalDirectExpensesIQD || 0) > 0 ? (
            formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')
          ) : (
            <span className="text-slate-500 text-xs font-sans">0 د.ع</span>
          )}
        </div>
        {(fin.totalDirectExpenses || 0) > 0 && (
          <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="rtl">
            صافي الربح: <strong className="text-emerald-400">{formatCurrency(fin.netEstimatedProfit || 0, transaction.currency || 'IQD')}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
