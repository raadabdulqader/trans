import React from 'react';
import { TreasuryTransaction, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface ArchiveModalFooterProps {
  transaction?: TreasuryTransaction | null;
  attachment: TreasuryAttachment;
}

export const ArchiveModalFooter: React.FC<ArchiveModalFooterProps> = ({
  transaction,
  attachment,
}) => {
  return (
    <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
      {transaction ? (
        <div className="flex flex-wrap items-center gap-4">
          <div>
            البيان: <strong className="text-slate-200">{transaction.description || 'سند مالي'}</strong>
          </div>
          <div>
            الطرف: <strong className="text-white">{transaction.partyName}</strong>
          </div>
          <div>
            المبلغ: <strong className="text-emerald-400 font-mono font-bold" dir="ltr">{formatCurrency(transaction.amount)}</strong>
          </div>
        </div>
      ) : (
        <div>
          الوثيقة: <strong className="text-slate-200">{attachment.name}</strong> • تم فك حظر المعاينة وعرضها مباشرة بنظام Canvas
        </div>
      )}

      <div className="text-[11px] text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>نظام المعاينة المستقل: لا يتأثر ببلوك المتصفح أو إضافات الحماية</span>
      </div>
    </div>
  );
};
