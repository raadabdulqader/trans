'use client';

import React from 'react';
import { Trash2, Printer } from 'lucide-react';
import { TreasuryTransaction, TreasuryMovementType } from '../../../types/customs';

export interface TreasuryModalFooterProps {
  initialData?: TreasuryTransaction | null;
  onDelete?: (tx: TreasuryTransaction) => void;
  onClose: () => void;
  onExecuteSave: (andPrint: boolean) => void;
  type: TreasuryMovementType;
}

export const TreasuryModalFooter: React.FC<TreasuryModalFooterProps> = ({
  initialData,
  onDelete,
  onClose,
  onExecuteSave,
  type,
}) => {
  return (
    <div className="px-5 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xl">
      <div>
        {initialData && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(initialData)}
            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف القيد</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition text-xs cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={() => onExecuteSave(false)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
          title="حفظ القيد فقط دون فتح شاشة الطباعة"
        >
          حفظ فقط
        </button>
        <button
          type="submit"
          className={`px-5 py-2 font-black rounded-xl text-slate-950 transition shadow-lg text-xs flex items-center gap-2 cursor-pointer ${
            type === 'deposit'
              ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 text-slate-950'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
          }`}
          title="حفظ القيد بالصندوق وفتح السند للطباعة فوراً"
        >
          <Printer className="w-4 h-4" />
          <span>حفظ وطباعة القيد</span>
        </button>
      </div>
    </div>
  );
};
