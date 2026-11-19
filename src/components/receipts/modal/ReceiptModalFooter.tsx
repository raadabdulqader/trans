import React from 'react';
import { Currency } from '../../../types/customs';

interface ReceiptModalFooterProps {
  amount: number;
  currency: Currency;
  hasCommission: boolean;
  commissionAmount: number;
  commissionCurrency: Currency;
  commissionBearer: 'company' | 'party';
  onClose: () => void;
  isBillFullyPaid: boolean;
  isPaymentOverRemaining: boolean;
}

export const ReceiptModalFooter: React.FC<ReceiptModalFooterProps> = ({
  amount,
  currency,
  hasCommission,
  commissionAmount,
  commissionCurrency,
  commissionBearer,
  onClose,
  isBillFullyPaid,
  isPaymentOverRemaining,
}) => {
  const isSubmitDisabled = isBillFullyPaid || isPaymentOverRemaining || amount <= 0;

  return (
    <div className="px-5 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="text-slate-500">المبلغ:</span>
          <span className="font-mono font-bold text-emerald-400">
            {currency === 'USD' ? `$${(amount || 0).toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(amount || 0)} د.ع`}
          </span>
        </span>
        {hasCommission && commissionAmount > 0 && (
          <>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-[11px] text-amber-300">
              <span>العمولة:</span>
              <span className="font-mono font-bold">
                {commissionCurrency === 'USD' ? `$${commissionAmount.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(commissionAmount)} د.ع`}
              </span>
              <span className="text-[10px] text-slate-400">
                ({commissionBearer === 'company' ? 'على الشركة' : 'على الزبون'})
              </span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`px-5 py-1.5 font-bold rounded-xl transition text-xs flex items-center gap-1.5 ${
            isSubmitDisabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
          }`}
        >
          <span>💾</span>
          <span>حفظ السند</span>
        </button>
      </div>
    </div>
  );
};
