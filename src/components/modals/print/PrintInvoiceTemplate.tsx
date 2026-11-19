'use client';

import React from 'react';
import { Transaction, Customer, Employee } from '../../../types/customs';
import { formatCurrency, BillFinancials } from '../../../utils/storage';

export interface PrintInvoiceTemplateProps {
  transaction: Transaction;
  fin: BillFinancials;
  customer?: Customer | null;
  employee?: Employee | null;
}

export const PrintInvoiceTemplate: React.FC<PrintInvoiceTemplateProps> = ({
  transaction,
  fin,
  customer,
  employee,
}) => {
  return (
    <div className="space-y-6">
      {transaction.status === 'cancelled' && (
        <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
          <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
            <span>⛔ فاتورة وبوليصة ملغاة دفترياً ومحاسبياً (VOID INVOICE)</span>
          </div>
          <p className="text-xs text-rose-600 font-semibold">
            هذه الفاتورة ملغاة دفترياً وتم تحييد كافة قيودها المالية وسندات القبض المرتبطة بها من حسابات صندوق الشركة.
          </p>
          <div className="text-[11px] text-rose-800 font-medium mt-1">
            سبب الإلغاء: {transaction.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {transaction.cancelledBy || 'المسؤول'} {transaction.cancelledAt ? `(${transaction.cancelledAt.split('T')[0]})` : ''}
          </div>
        </div>
      )}

      <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
        <h2 className="text-xl font-bold text-slate-900">فاتورة حساب تخليص كمركي</h2>
        <span className="text-xs text-slate-600 font-mono">Invoice #{transaction.billNo}</span>
      </div>

      {/* Customer and Bill Details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div><strong>السادة / الشركة:</strong> {customer?.name || 'الزبون المحترم'}</div>
          <div><strong>اسم المسؤول:</strong> {customer?.contact || '—'}</div>
          <div><strong>رقم الهاتف:</strong> {customer?.phone || '—'}</div>
          <div><strong>العنوان:</strong> {customer?.address || '—'}</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div><strong>رقم البوليصة (B/L):</strong> <span className="font-mono font-bold">{transaction.billNo}</span></div>
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
          <div><strong>تاريخ الاستلام:</strong> <span className="font-mono">{transaction.date}</span></div>
          <div><strong>نوع البضاعة:</strong> {transaction.goodsType || 'بضاعة عامة'}</div>
          <div><strong>المخلص المسؤول:</strong> {employee?.name || '—'}</div>
        </div>
      </div>

      {/* Containers List */}
      {transaction.containers.length > 0 && (
        <div className="space-y-1 text-xs">
          <strong>🚢 أرقام الحاويات المشمولة:</strong>
          <div className="flex flex-wrap gap-2 pt-1 font-mono">
            {transaction.containers.map((c, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statement Table */}
      <table className="w-full text-right text-xs border border-slate-300 border-collapse">
        <thead>
          <tr className="bg-slate-200 border-b border-slate-300 font-bold">
            <th className="p-2.5 border-l border-slate-300">البيان / الوصف</th>
            <th className="p-2.5 text-left border-l border-slate-300">المبلغ (د.ع)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="p-2.5 border-l border-slate-300">
              <div>أجور ومصاريف التخليص الكمركي، الرسوم، ومناولة البضاعة للبوليصة {transaction.billNo}</div>
              {(fin.totalCarrierCost || 0) > 0 && (
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  (إجمالي العقد: {formatCurrency(fin.grossTotalAmount || 0, transaction.currency || 'IQD')} - استقطاع أجور النقل البري: {formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')})
                </div>
              )}
            </td>
            <td className="p-2.5 font-mono font-bold text-left border-l border-slate-300" dir="ltr">
              {formatCurrency(fin.totalAmount, transaction.currency || 'IQD')}
            </td>
          </tr>
          <tr className="border-b border-slate-200 bg-emerald-50 text-emerald-900">
            <td className="p-2.5 border-l border-slate-300">إجمالي المبالغ المسددة والمقبوضة حتى تاريخه</td>
            <td className="p-2.5 font-mono font-bold text-left border-l border-slate-300" dir="ltr">
              {formatCurrency(fin.totalCollected, transaction.currency || 'IQD')}
            </td>
          </tr>
          <tr className="bg-slate-100 font-bold text-sm">
            <td className="p-3 border-l border-slate-300 text-slate-900">الرصيد المتبقي المطلوب سداده:</td>
            <td className="p-3 font-mono text-left border-l border-slate-300 text-slate-900" dir="ltr">
              {formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
        <div>
          <p className="font-bold mb-12">توقيع وختم المحاسب</p>
          <p className="text-slate-400">................................................</p>
        </div>
        <div>
          <p className="font-bold mb-12">توقيع المستلم / العميل</p>
          <p className="text-slate-400">................................................</p>
        </div>
      </div>
    </div>
  );
};
