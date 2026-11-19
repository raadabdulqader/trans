import React from 'react';
import { PaymentMode } from '../QuickPaymentModal';

interface PaymentModalFooterProps {
  payMode: PaymentMode;
  onClose: () => void;
  isFullyPaid: boolean;
  isOverRemaining: boolean;
  amountIQD: number;
  amountUSD: number;
}

export const PaymentModalFooter: React.FC<PaymentModalFooterProps> = ({
  payMode,
  onClose,
  isFullyPaid,
  isOverRemaining,
  amountIQD,
  amountUSD,
}) => {
  const totalPaid = (payMode !== 'USD' ? amountIQD : 0) + (payMode !== 'IQD' ? amountUSD : 0);
  const isSubmitDisabled = isFullyPaid || isOverRemaining || totalPaid <= 0;

  return (
    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
      <div className="text-[11px] text-slate-400">
        {payMode === 'split' ? (
          <span className="text-amber-300">
            💡 سيتم إنشاء سندي قبض منفصلين: سند بالدينار في صندوق الدينار، وسند بالدولار في صندوق الدولار مع ربطهما بالبوليصة.
          </span>
        ) : (
          <span>يتم إيداع المبلغ المقبوض مباشرة في الصندوق الخاص بتلك العملة.</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
        >
          إلغاء
        </button>
        <button 
          type="submit" 
          disabled={isSubmitDisabled}
          className={`px-5 py-1.5 rounded-xl font-bold transition ${
            isSubmitDisabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20'
          }`}
        >
          تسجيل الدفعة
        </button>
      </div>
    </div>
  );
};
