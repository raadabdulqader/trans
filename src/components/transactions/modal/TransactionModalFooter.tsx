import React from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import { Currency, Transaction, TreasuryAttachment } from '../../../types/customs';

export interface TransactionModalFooterProps {
  isMixedCurrency: boolean;
  currency: Currency;
  totalAmount: number;
  totalAmountUSD?: number;
  initialPaid: number;
  initialPaidUSD?: number;
  containersCount: number;
  milestonesCount: number;
  agencyDocument?: TreasuryAttachment;
  onTriggerAgencyUpload: () => void;
  initialData?: Transaction | null;
  onDelete?: (tx: Transaction) => void;
  onClose: () => void;
  isInitialExceeded: boolean;
  isTotalLessThanExisting: boolean;
}

export const TransactionModalFooter: React.FC<TransactionModalFooterProps> = ({
  isMixedCurrency,
  currency,
  totalAmount,
  totalAmountUSD,
  initialPaid,
  initialPaidUSD,
  containersCount,
  milestonesCount,
  agencyDocument,
  onTriggerAgencyUpload,
  initialData,
  onDelete,
  onClose,
  isInitialExceeded,
  isTotalLessThanExisting,
}) => {
  return (
    <div className="px-4 sm:px-5 py-2.5 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10 shadow-lg">
      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 flex-wrap">
        <span className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-bold text-[11px]">الإجمالي:</span>
          <span className="font-mono font-black text-white text-xs">
            {isMixedCurrency
              ? `${new Intl.NumberFormat('ar-IQ').format(totalAmount || 0)} د.ع + $${totalAmountUSD || 0}`
              : currency === 'USD'
              ? `$${(totalAmount || 0).toLocaleString()}`
              : `${new Intl.NumberFormat('ar-IQ').format(totalAmount || 0)} د.ع`}
          </span>
        </span>
        <span className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-bold text-[11px]">المقدم:</span>
          <span className="font-mono font-black text-emerald-400 text-xs">
            {isMixedCurrency || ((initialPaid || 0) > 0 && (initialPaidUSD || 0) > 0)
              ? `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع + $${(initialPaidUSD || 0).toLocaleString()}`
              : (initialPaidUSD || 0) > 0
              ? `$${(initialPaidUSD || 0).toLocaleString()}`
              : `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع`}
          </span>
        </span>
        <span className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-bold text-[11px]">الحاويات:</span>
          <span className="font-mono font-black text-cyan-300 text-xs">{containersCount}</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-bold text-[11px]">المراحل:</span>
          <span className="font-mono font-black text-purple-300 text-xs">{milestonesCount}/4</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onTriggerAgencyUpload}
          className={`h-8 px-3 font-bold rounded-lg transition text-xs flex items-center gap-1.5 border cursor-pointer ${
            agencyDocument
              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
              : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/40'
          }`}
          title="رفع وأرشفة ورقة الوكالة الخاصة بالعمل لهذه البوليصة"
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>{agencyDocument ? '✓ أُرشفت الوكالة' : 'أرشفة الوكالة'}</span>
        </button>

        {initialData && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(initialData)}
            className="h-8 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="h-8 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-lg transition text-xs cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isInitialExceeded || isTotalLessThanExisting}
          className={`h-8 px-5 font-black rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer ${
            isInitialExceeded || isTotalLessThanExisting
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
          }`}
        >
          <span>💾</span>
          <span>{initialData ? 'حفظ التعديلات' : 'حفظ بيانات البوليصة'}</span>
        </button>
      </div>
    </div>
  );
};
