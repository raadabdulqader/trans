import React from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Transaction, TreasuryTransaction, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface DetailDirectExpensesProps {
  transaction: Transaction;
  directExpenses: TreasuryTransaction[];
  fin: {
    totalDirectExpensesIQD?: number;
    totalDirectExpensesUSD?: number;
  };
  onOpenAddExpense?: (tx: Transaction) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onEditExpense?: (tx: TreasuryTransaction) => void;
  onDeleteExpense?: (tx: TreasuryTransaction) => void;
}

export const DetailDirectExpenses: React.FC<DetailDirectExpensesProps> = ({
  transaction,
  directExpenses,
  fin,
  onOpenAddExpense,
  onViewArchive,
  onEditExpense,
  onDeleteExpense,
}) => {
  return (
    <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="font-bold text-white text-xs flex items-center gap-1.5">
          <span className="text-purple-400">💸</span>
          <span>المصاريف الكمركية والتشغيلية ({directExpenses.length} سند صرف)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenAddExpense && transaction.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onOpenAddExpense(transaction)}
              className="px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              title="صرف رسوم كمركية أو موانئ أو فحص أو نثريات"
            >
              <Plus className="w-3 h-3" />
              <span>صرف مصروف</span>
            </button>
          )}
        </div>
      </div>

      {directExpenses.length === 0 ? (
        <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-400 text-center text-[11px] flex flex-wrap items-center justify-between gap-2">
          <span>لا توجد مصاريف كمركية أو تشغيلية مسجلة من الصندوق حتى الآن.</span>
          {onOpenAddExpense && transaction.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onOpenAddExpense(transaction)}
              className="text-purple-400 hover:text-purple-300 text-[11px] font-bold underline"
            >
              + صرف الآن
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                <th className="py-1.5 px-2">رقم السند</th>
                <th className="py-1.5 px-2">التصنيف</th>
                <th className="py-1.5 px-2">الجهة المستلمة</th>
                <th className="py-1.5 px-2">المبلغ</th>
                <th className="py-1.5 px-2">التاريخ والبيان</th>
                <th className="py-1.5 px-2 text-center">مستند</th>
                <th className="py-1.5 px-2 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {directExpenses.map((exp) => {
                const expCurr = exp.currency || 'IQD';
                return (
                  <tr key={exp.id} className="hover:bg-slate-900/40">
                    <td className="py-1.5 px-2 font-mono font-bold text-purple-300 text-[11px]">
                      {exp.voucherNo}
                    </td>
                    <td className="py-1.5 px-2 font-bold text-slate-200">
                      {exp.category}
                    </td>
                    <td className="py-1.5 px-2 text-slate-300">
                      {exp.partyName || '—'}
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold" dir="ltr">
                      <span className={expCurr === 'USD' ? 'text-cyan-400' : 'text-purple-300'}>
                        - {formatCurrency(exp.amount, expCurr)}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 max-w-[140px]">
                      <div className="font-mono text-[9px] text-slate-500">{exp.date}</div>
                      <div className="truncate text-[10px] text-slate-300">{exp.description || '—'}</div>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {exp.attachment && onViewArchive ? (
                        <button
                          type="button"
                          onClick={() => onViewArchive(exp.attachment!, `وصل مصروف ${exp.voucherNo}`)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                        >
                          <Eye className="w-2.5 h-2.5" />
                          <span>عرض</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEditExpense && transaction.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => onEditExpense(exp)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="تعديل المصروف"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {onDeleteExpense && transaction.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                            title="إلغاء واسترداد المبلغ إلى الصندوق"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-slate-800 text-[11px] font-mono font-bold bg-slate-900/90">
              <tr>
                <td colSpan={3} className="py-1.5 px-2 text-slate-300 font-sans">
                  إجمالي المصاريف:
                </td>
                <td colSpan={4} className="py-1.5 px-2 font-mono text-purple-300" dir="ltr">
                  {formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')}
                  {(fin.totalDirectExpensesUSD || 0) > 0 && ` + ${formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
