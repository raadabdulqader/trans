import React from 'react';
import { 
  Coins, 
  Wallet, 
  Paperclip, 
  Pencil, 
  Printer, 
  Trash2 
} from 'lucide-react';
import { Transaction } from '../../../types/customs';

interface DetailModalFooterProps {
  transaction: Transaction;
  fin: {
    remainingAmount: number;
    remainingAmountUSD?: number;
  };
  billAttachmentsCount: number;
  onOpenQuickAdvance: () => void;
  onOpenQuickPayment: () => void;
  onOpenAddExpense?: (tx: Transaction) => void;
  onOpenAttachments: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onPrintBillFile: () => void;
  onPrintInvoice: () => void;
  onDeleteTransaction?: (tx: Transaction) => void;
}

export const DetailModalFooter: React.FC<DetailModalFooterProps> = ({
  transaction,
  fin,
  billAttachmentsCount,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenAddExpense,
  onOpenAttachments,
  onEditTransaction,
  onPrintBillFile,
  onPrintInvoice,
  onDeleteTransaction,
}) => {
  const isFullyPaid = transaction.isMixedCurrency
    ? (fin.remainingAmount <= 0 && (fin.remainingAmountUSD || 0) <= 0)
    : fin.remainingAmount <= 0;
  const isPaymentDisabled = transaction.status === 'cancelled' || isFullyPaid;

  return (
    <div className="p-3 sm:px-4 sm:py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
      {/* Quick Operations on the Right (RTL) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onOpenQuickAdvance}
          disabled={transaction.status === 'cancelled'}
          className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            transaction.status === 'cancelled'
              ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
          title={transaction.status === 'cancelled' ? 'لا يمكن صرف سلف على بوليصة ملغاة' : 'صرف سلفة للمخلص'}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>🏦 سلفة للمخلص</span>
        </button>

        <button
          onClick={onOpenQuickPayment}
          disabled={isPaymentDisabled}
          className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            isPaymentDisabled
              ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
          title={
            transaction.status === 'cancelled' 
              ? 'لا يمكن قبض مبالغ لبوليصة ملغاة' 
              : isFullyPaid 
              ? 'البوليصة مسددة بالكامل (خالصة)' 
              : 'تسجيل دفعة من الزبون'
          }
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>💳 دفعة زبون {transaction.status === 'cancelled' ? '(ملغاة)' : isFullyPaid ? '(خالصة)' : ''}</span>
        </button>

        {onOpenAddExpense && (
          <button
            type="button"
            onClick={() => onOpenAddExpense(transaction)}
            disabled={transaction.status === 'cancelled'}
            className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              transaction.status === 'cancelled'
                ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs'
            }`}
            title="صرف رسوم كمركية، موانئ، فحص، عمال، أو نثريات على البوليصة"
          >
            <span>💸</span>
            <span>صرف مصروف</span>
          </button>
        )}

        <button
          onClick={onOpenAttachments}
          className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>📎 المرفقات ({billAttachmentsCount})</span>
        </button>
      </div>

      {/* Edit / Print / Delete Actions on the Left (RTL) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {onEditTransaction && transaction.status !== 'cancelled' && (
          <button
            type="button"
            onClick={() => onEditTransaction(transaction)}
            className="h-8 px-2.5 text-xs bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold rounded-lg transition flex items-center gap-1.5"
            title="تعديل بيانات البوليصة والنقلات"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-400" />
            <span>تعديل البوليصة</span>
          </button>
        )}

        <button
          onClick={onPrintBillFile}
          className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>🖨️ طباعة الملف</span>
        </button>

        <button
          onClick={onPrintInvoice}
          className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
        >
          <span>📄 طباعة فاتورة</span>
        </button>

        {onDeleteTransaction && (
          <button
            type="button"
            onClick={() => onDeleteTransaction(transaction)}
            className="h-8 px-2.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-lg transition flex items-center gap-1"
            title="حذف البوليصة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        )}
      </div>
    </div>
  );
};
