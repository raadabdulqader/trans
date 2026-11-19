'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { TreasuryMovementType } from '../../../types/customs';

export interface TreasuryModalHeaderProps {
  type: TreasuryMovementType;
  voucherNo: string;
  isEdit: boolean;
  onClose: () => void;
}

export const TreasuryModalHeader: React.FC<TreasuryModalHeaderProps> = ({
  type,
  voucherNo,
  isEdit,
  onClose,
}) => {
  return (
    <div
      className={`px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 ${
        type === 'deposit'
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900'
          : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
            type === 'deposit'
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-rose-500 text-white shadow-rose-500/20'
          }`}
        >
          {type === 'deposit' ? (
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {isEdit
                ? 'تعديل قيد الصندوق'
                : type === 'deposit'
                ? 'إيداع نقدي في صندوق الشركة'
                : 'سحب نقدي من صندوق الشركة'}
            </h2>
            <span
              className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-bold"
              dir="ltr"
            >
              {voucherNo || 'سند جديد'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            سند قبض / صرف نقدي رسمي مع التوجيه الدفتري المزدوج والأرشفة الإلكترونية
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
