'use client';

import React from 'react';
import { Transaction, TreasuryTransaction } from '../../../../types/customs';
import { formatCurrency } from '../../../../utils/storage';

export interface BillDirectExpensesSectionProps {
  directExpensesOnBill: TreasuryTransaction[];
  directExpensesIQDOnBill: number;
  directExpensesUSDOnBill: number;
  initialData?: Transaction | null;
  onOpenAddExpense?: (transaction: Transaction) => void;
}

export const BillDirectExpensesSection: React.FC<BillDirectExpensesSectionProps> = ({
  directExpensesOnBill,
  directExpensesIQDOnBill,
  directExpensesUSDOnBill,
  initialData,
  onOpenAddExpense,
}) => {
  return (
    <div className="p-2.5 sm:p-3 bg-slate-900 rounded-xl border border-purple-500/30 shadow-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shrink-0 text-xs">
            💸
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">المصاريف الكمركية والتشغيلية المخصومة من الصندوق</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
              {directExpensesOnBill.length} سند صرف
            </span>
          </div>
        </div>

        {initialData && onOpenAddExpense && (
          <button
            type="button"
            onClick={() => onOpenAddExpense(initialData)}
            className="h-7.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>+ صرف مصروف جديد 💸</span>
          </button>
        )}
      </div>

      {directExpensesOnBill.length > 0 ? (
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">إجمالي المصاريف المصروفة من الصندوق:</span>
            <div className="font-mono font-bold text-purple-300 text-xs flex items-center gap-2" dir="ltr">
              {directExpensesIQDOnBill > 0 && (
                <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {formatCurrency(directExpensesIQDOnBill, 'IQD')}
                </span>
              )}
              {directExpensesIQDOnBill > 0 && directExpensesUSDOnBill > 0 && <span className="text-slate-500">+</span>}
              {directExpensesUSDOnBill > 0 && (
                <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {formatCurrency(directExpensesUSDOnBill, 'USD')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800/80">
            {directExpensesOnBill.map((exp) => (
              <div
                key={exp.id}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5 font-bold"
              >
                <span className="font-mono text-purple-400 font-bold">{exp.voucherNo}</span>
                <span className="text-slate-200">{exp.category}</span>
                <span className="font-mono font-bold text-rose-400" dir="ltr">
                  -{formatCurrency(exp.amount, exp.currency || 'IQD')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
          {initialData ? (
            <span>لا توجد مصاريف كمركية مصروفة على هذه البوليصة بعد. يمكنك تسجيل وصرف أي رسوم عبر زر "+ صرف مصروف جديد 💸" أعلاه.</span>
          ) : (
            <span>فور حفظ البوليصة، يمكنك إضافة وصرف أي مصاريف كمركية وموانئ ونثريات بالدينار أو بالدولار مع خصمها آلياً من الصندوق.</span>
          )}
        </div>
      )}
    </div>
  );
};
