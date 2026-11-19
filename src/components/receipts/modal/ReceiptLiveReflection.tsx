import React from 'react';
import { Currency, Receipt } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface ReceiptLiveReflectionProps {
  type: Receipt['type'];
  fin: { remainingAmount: number } | null;
  amount: number;
  hasCommission: boolean;
  currency: Currency;
  billCurrency: Currency;
  commissionBearer: 'company' | 'party';
  commissionAmount: number;
  commissionCurrency: Currency;
  previewBreakdown: { netCreditInBillCurrency: number };
  newRemainingOnBill: number;
}

export const ReceiptLiveReflection: React.FC<ReceiptLiveReflectionProps> = ({
  type,
  fin,
  amount,
  hasCommission,
  currency,
  billCurrency,
  commissionBearer,
  commissionAmount,
  commissionCurrency,
  previewBreakdown,
  newRemainingOnBill,
}) => {
  if (!(type === 'payment' && fin && amount > 0 && (hasCommission || currency !== billCurrency))) {
    return null;
  }

  return (
    <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">انعكاس الصندوق:</span>
        <strong className="font-mono text-emerald-400" dir="ltr">
          {hasCommission && commissionBearer === 'company' && commissionAmount > 0
            ? commissionCurrency === currency
              ? `+${formatCurrency(Math.max(0, amount - commissionAmount), currency)} (صافي بعد استقطاع عمولة الشركة)`
              : `+${formatCurrency(amount, currency)} (يُستقطع -${formatCurrency(commissionAmount, commissionCurrency)} عمولة على الشركة)`
            : `+${formatCurrency(amount, currency)}${hasCommission && commissionAmount > 0 ? ' (العمولة على الزبون لا تؤثر على الصندوق)' : ''}`}
        </strong>
      </div>
      <div className="flex items-center gap-3">
        <span>
          <span className="text-slate-400">يُحتسب للبوليصة (الحوالة): </span>
          <strong className="font-mono text-cyan-300" dir="ltr">
            {formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurrency)}
          </strong>
          {hasCommission && commissionAmount > 0 && (
            <span className="text-[10px] text-amber-300 mr-1">
              ({commissionBearer === 'party' ? 'العمولة على الزبون لا تؤثر على الحوالة' : 'العمولة على الشركة تُستقطع من الدفعة'})
            </span>
          )}
        </span>
        <span className="text-slate-700">|</span>
        <span>
          <span className="text-slate-400">المتبقي الجديد: </span>
          <strong className={`font-mono ${newRemainingOnBill === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
            {formatCurrency(newRemainingOnBill, billCurrency)}
          </strong>
        </span>
      </div>
    </div>
  );
};
