'use client';

import React from 'react';
import { TreasuryTransaction } from '../../../types/customs';
import { formatCurrency, TreasuryFinancialSummary } from '../../../utils/storage';

export interface PrintTreasuryStatementTemplateProps {
  summary?: TreasuryFinancialSummary;
  transactions: TreasuryTransaction[];
}

export const PrintTreasuryStatementTemplate: React.FC<PrintTreasuryStatementTemplateProps> = ({
  summary,
  transactions,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
        <h2 className="text-xl font-black text-slate-900">كشف حساب وحركة صندوق الشركة المالي</h2>
        <p className="text-xs text-slate-600">سجل عمليات السحب والإيداع النقدية وحركة السيولة</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
            <span className="text-slate-600 block">إجمالي الإيداعات والمقبوضات:</span>
            <strong className="text-emerald-700 font-mono text-sm block mt-1" dir="ltr">
              {formatCurrency(summary.totalInflow)}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
            <span className="text-slate-600 block">إجمالي السحوبات والمصروفات:</span>
            <strong className="text-rose-700 font-mono text-sm block mt-1" dir="ltr">
              {formatCurrency(summary.totalOutflow)}
            </strong>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-400 rounded-lg text-center">
            <span className="text-slate-900 font-bold block">رصيد الصندوق الحالي:</span>
            <strong className="text-slate-900 font-mono text-base block mt-1" dir="ltr">
              {formatCurrency(summary.currentBalance)}
            </strong>
          </div>
        </div>
      )}

      {/* Statement Table */}
      <table className="w-full text-right text-xs border border-slate-300 border-collapse">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-300 font-bold">
            <th className="p-2 border-l border-slate-300">رقم السند</th>
            <th className="p-2 border-l border-slate-300">التاريخ</th>
            <th className="p-2 border-l border-slate-300">نوع الحركة</th>
            <th className="p-2 border-l border-slate-300">الطرف / المستفيد</th>
            <th className="p-2 border-l border-slate-300">البيان والتصنيف</th>
            <th className="p-2 border-l border-slate-300 text-left">وارد (+)</th>
            <th className="p-2 border-l border-slate-300 text-left">صادر (-)</th>
            <th className="p-2 border-l border-slate-300 text-center">الأرشفة</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => {
            const isCancelled = t.status === 'cancelled';
            return (
              <tr key={t.id} className={`border-b border-slate-200 ${isCancelled ? 'bg-rose-50/60 text-slate-400' : ''}`}>
                <td className="p-2 border-l border-slate-300 font-mono font-bold">
                  <span className={isCancelled ? 'line-through text-slate-400' : ''}>{t.voucherNo}</span>
                  {isCancelled && <span className="mr-1 text-[9px] text-rose-600 font-bold bg-rose-100 px-1 py-0.2 rounded">(ملغي دفترياً)</span>}
                </td>
                <td className="p-2 border-l border-slate-300 font-mono">{t.date}</td>
                <td className="p-2 border-l border-slate-300">
                  {t.type === 'deposit' ? 'إيداع نقدي' : 'سحب نقدي'}
                </td>
                <td className="p-2 border-l border-slate-300 font-semibold">{t.partyName}</td>
                <td className="p-2 border-l border-slate-300">
                  <div>{t.category}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                    {isCancelled ? `[ملغي: ${t.cancelReason || 'قيد ملغي'}] ${t.description || ''}` : (t.description || '—')}
                  </div>
                </td>
                <td className="p-2 border-l border-slate-300 font-mono font-bold text-left text-emerald-800" dir="ltr">
                  {t.type === 'deposit' ? (
                    <span className={isCancelled ? 'line-through text-slate-400' : ''}>{formatCurrency(t.amount)}</span>
                  ) : '—'}
                </td>
                <td className="p-2 border-l border-slate-300 font-mono font-bold text-left text-rose-800" dir="ltr">
                  {t.type === 'withdrawal' ? (
                    <span className={isCancelled ? 'line-through text-slate-400' : ''}>{formatCurrency(t.amount)}</span>
                  ) : '—'}
                </td>
                <td className="p-2 border-l border-slate-300 text-center">
                  {t.attachment ? 'مؤرشف ✓' : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-12 text-xs text-center">
        <div>
          <p className="font-bold mb-12 text-slate-800">إعداد / أمين الصندوق</p>
          <p className="text-slate-400">................................................</p>
        </div>
        <div>
          <p className="font-bold mb-12 text-slate-800">اعتماد الإدارة المالية / الختم</p>
          <p className="text-slate-400">................................................</p>
        </div>
      </div>
    </div>
  );
};
