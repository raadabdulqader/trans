'use client';

import React from 'react';
import { Transaction, Customer, Employee, Receipt } from '../../../types/customs';
import { formatCurrency, BillFinancials } from '../../../utils/storage';

export interface PrintBillDossierTemplateProps {
  transaction: Transaction;
  fin: BillFinancials;
  customer?: Customer | null;
  employee?: Employee | null;
  billReceipts: Receipt[];
  billExpenses: any[];
}

export const PrintBillDossierTemplate: React.FC<PrintBillDossierTemplateProps> = ({
  transaction,
  fin,
  customer,
  employee,
  billReceipts,
  billExpenses,
}) => {
  return (
    <div className="space-y-6">
      {transaction.status === 'cancelled' && (
        <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
          <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
            <span>⛔ ملف بوليصة ملغي دفترياً ومحاسبياً (VOID DOSSIER)</span>
          </div>
          <p className="text-xs text-rose-600 font-semibold">
            هذه المعاملة ملغاة دفترياً وتم تسوية/استرداد كافة الحسابات والذمم والسلف المرتبطة بها في صندوق الشركة.
          </p>
          <div className="text-[11px] text-rose-800 font-medium mt-1">
            سبب الإلغاء: {transaction.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {transaction.cancelledBy || 'المسؤول'} {transaction.cancelledAt ? `(${transaction.cancelledAt.split('T')[0]})` : ''}
          </div>
        </div>
      )}

      <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
        <h2 className="text-xl font-bold text-slate-900">ملف البوليصة والمعاملة الكمركية</h2>
        <span className="text-xs text-slate-600 font-mono">Dossier #{transaction.billNo}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div><strong>العميل:</strong> {customer?.name}</div>
          <div><strong>المخلص:</strong> {employee?.name}</div>
          {transaction.jobNumber && (
            <div><strong>رقم المعاملة (Job No):</strong> <span className="font-mono font-bold text-slate-800">{transaction.jobNumber}</span></div>
          )}
          {transaction.containerDestination && (
            <div><strong>وجهة الحاوية:</strong> <span>{transaction.containerDestination}</span></div>
          )}
          {transaction.freeTimeDays && (
            <div><strong>فترة السماح (Free Time):</strong> <span className="font-mono">{transaction.freeTimeDays} يوم</span></div>
          )}
          <div><strong>تاريخ إنشاء البوليصة:</strong> <span className="font-mono">{transaction.createdAt || transaction.date}</span></div>
          <div><strong>تاريخ الاستلام والفتح:</strong> <span className="font-mono">{transaction.date}</span></div>
          <div><strong>الحالة:</strong> {transaction.status === 'completed' ? 'منجزة' : 'قيد التنفيذ'}</div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div>
            <strong>المبلغ الكلي (الصافي):</strong> {formatCurrency(fin.totalAmount, transaction.currency || 'IQD')}
            {(fin.totalCarrierCost || 0) > 0 && (
              <span className="text-[10px] text-slate-500 mr-1">
                (بعد خصم أجور الناقل: -{formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')})
              </span>
            )}
          </div>
          <div><strong>المسدد:</strong> {formatCurrency(fin.totalCollected, transaction.currency || 'IQD')}</div>
          <div><strong>المتبقي:</strong> {formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')}</div>
          <div><strong>سلف المخلص المفتوحة:</strong> {formatCurrency(fin.openAdvances, transaction.currency || 'IQD')}</div>
        </div>
      </div>

      {/* Receipts inside bill */}
      <div className="space-y-2">
        <strong className="text-xs">سجل الحركات المالية المربوطة بالمعاملة:</strong>
        <table className="w-full text-right text-xs border border-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-2 border-l border-slate-300">رقم الوصل</th>
              <th className="p-2 border-l border-slate-300">النوع</th>
              <th className="p-2 border-l border-slate-300">المبلغ</th>
              <th className="p-2 border-l border-slate-300">التاريخ</th>
              <th className="p-2 border-l border-slate-300">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {billReceipts.map(r => {
              const rCurr = r.currency || transaction.currency || 'IQD';
              return (
                <tr key={r.id} className={`border-b border-slate-200 ${r.status === 'cancelled' ? 'bg-rose-50/60 text-slate-400' : ''}`}>
                  <td className="p-2 border-l border-slate-300 font-mono">
                    {r.receiptNo}
                    {r.status === 'cancelled' && <span className="mr-1.5 text-[10px] text-rose-600 font-bold bg-rose-100 px-1 py-0.2 rounded">(ملغي دفترياً)</span>}
                  </td>
                  <td className="p-2 border-l border-slate-300">
                    {r.type === 'deposit' ? 'دفعة أولى' : r.type === 'payment' ? 'دفعة زبون' : r.type === 'advance' ? 'سلفة مخلص' : 'تسوية'}
                  </td>
                  <td className="p-2 border-l border-slate-300 font-mono" dir="ltr">
                    <span className={r.status === 'cancelled' ? 'line-through text-slate-400' : ''}>{formatCurrency(r.amount, rCurr)}</span>
                  </td>
                  <td className="p-2 border-l border-slate-300 font-mono">{r.date}</td>
                  <td className="p-2 border-l border-slate-300">
                    {r.status === 'cancelled' ? `[ملغي: ${r.cancelReason || 'قيد ملغي'}] ${r.notes || ''}` : (r.notes || '—')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Direct Expenses inside bill */}
      {billExpenses.length > 0 && (
        <div className="space-y-2">
          <strong className="text-xs">المصاريف الكمركية والتشغيلية المخصومة من الصندوق ({billExpenses.length} سند):</strong>
          <table className="w-full text-right text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-l border-slate-300">رقم السند</th>
                <th className="p-2 border-l border-slate-300">التصنيف</th>
                <th className="p-2 border-l border-slate-300">الجهة المستلمة</th>
                <th className="p-2 border-l border-slate-300">المبلغ والصندوق</th>
                <th className="p-2 border-l border-slate-300">التاريخ</th>
                <th className="p-2 border-l border-slate-300">البيان</th>
              </tr>
            </thead>
            <tbody>
              {billExpenses.map(exp => (
                <tr key={exp.id} className="border-b border-slate-200">
                  <td className="p-2 border-l border-slate-300 font-mono">{exp.voucherNo}</td>
                  <td className="p-2 border-l border-slate-300">{exp.category}</td>
                  <td className="p-2 border-l border-slate-300">{exp.partyName || '—'}</td>
                  <td className="p-2 border-l border-slate-300 font-mono" dir="ltr">
                    - {formatCurrency(exp.amount, exp.currency || 'IQD')} ({exp.currency === 'USD' ? 'دولار' : 'دينار'})
                  </td>
                  <td className="p-2 border-l border-slate-300 font-mono">{exp.date}</td>
                  <td className="p-2 border-l border-slate-300">{exp.description || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
              <tr>
                <td colSpan={3} className="p-2 text-right">إجمالي المصاريف المصروفة من الصندوق:</td>
                <td colSpan={3} className="p-2 font-mono text-rose-700" dir="ltr">
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
