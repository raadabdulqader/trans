'use client';

import React from 'react';
import { Transaction, Customer, Employee, Receipt } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

export interface PrintReceiptVoucherTemplateProps {
  receipt: Receipt;
  transaction?: Transaction | null;
  customer?: Customer | null;
  employee?: Employee | null;
}

export const PrintReceiptVoucherTemplate: React.FC<PrintReceiptVoucherTemplateProps> = ({
  receipt,
  transaction,
  customer,
  employee,
}) => {
  const rcptCurr = receipt.currency || transaction?.currency || 'IQD';

  return (
    <div className="space-y-6">
      {receipt.status === 'cancelled' && (
        <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
          <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
            <span>⛔ سند ملغي دفترياً ومحاسبياً (VOID VOUCHER)</span>
          </div>
          <p className="text-xs text-rose-600 font-semibold">
            هذا السند غير ساري المفعول وتم تحييد أثره المالي بالكامل من قيود الصندوق وحسابات الشركة.
          </p>
          <div className="text-[11px] text-rose-800 font-medium mt-1">
            سبب الإلغاء: {receipt.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {receipt.cancelledBy || 'المسؤول'} {receipt.cancelledAt ? `(${receipt.cancelledAt.split('T')[0]})` : ''}
          </div>
        </div>
      )}

      <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
        <h2 className="text-xl font-bold text-slate-900">
          {receipt.type === 'payment' || receipt.type === 'deposit' ? 'سند قبض مالي' : 'سند صرف سلفة / تسوية'}
        </h2>
        <span className="text-xs text-slate-600 font-mono">Voucher #{receipt.receiptNo}</span>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs leading-loose">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span><strong>تاريخ السند:</strong> {receipt.date}</span>
          <div>
            <strong>المبلغ:</strong>{' '}
            <span className={`font-mono font-bold text-sm ${receipt.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900'}`} dir="ltr">
              {formatCurrency(receipt.amount, rcptCurr)}
            </span>
            {rcptCurr === 'USD' && (
              <div className="text-[10px] text-slate-600 font-mono text-left">
                ≈ {new Intl.NumberFormat('ar-IQ').format(receipt.amount * (receipt.exchangeRate || 1500))} د.ع (سعر 100$ = {((receipt.exchangeRate || 1500) * 100).toLocaleString('ar-IQ')} د.ع)
              </div>
            )}
          </div>
        </div>
        <div>
          <strong>استلمنا من / صرفنا إلى:</strong> {customer ? customer.name : employee ? employee.name : '—'}
        </div>
        <div>
          <strong>رقم البوليصة المعتمدة:</strong> <span className="font-mono font-bold">{transaction?.billNo || '—'}</span>
        </div>
        <div>
          <strong>وذلك عن:</strong> {receipt.notes || 'تسديد رسوم ومصاريف كمركية'}
        </div>

        {receipt.hasCommission && (receipt.commissionAmount || 0) > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5 text-xs">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <strong>عمولة تحويل / صرافة:</strong>{' '}
                <span className="font-mono font-bold" dir="ltr">
                  {formatCurrency(receipt.commissionAmount || 0, receipt.commissionCurrency || receipt.currency || 'IQD')}
                </span>
                <span className="mr-2 text-[11px] font-semibold text-amber-900">
                  ({receipt.commissionBearer === 'company' ? 'تحمل الشركة كمصروف مستقل — لا تُستقطع من رصيد الزبون' : 'الزبون / الطرف الآخر'})
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-700">
                المبلغ المقيد لحساب الزبون: <strong>{formatCurrency(receipt.amount, receipt.currency || 'IQD')}</strong> (كامل)
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
        <div>
          <p className="font-bold mb-12">أمين الصندوق / المحاسب</p>
          <p className="text-slate-400">................................................</p>
        </div>
        <div>
          <p className="font-bold mb-12">توقيع المستلم / المودع</p>
          <p className="text-slate-400">................................................</p>
        </div>
      </div>
    </div>
  );
};
