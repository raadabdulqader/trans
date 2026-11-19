'use client';

import React from 'react';
import { User } from 'lucide-react';
import { TreasuryMovementType, TreasuryAttachment } from '../../../types/customs';
import { TreasuryReceiptArchiver } from './TreasuryReceiptArchiver';

export interface TreasuryPartyArchivingColProps {
  type: TreasuryMovementType;
  partyName: string;
  setPartyName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  attachment?: TreasuryAttachment;
  setAttachment: (att?: TreasuryAttachment) => void;
  setFormError: (err: string | null) => void;
}

export const TreasuryPartyArchivingCol: React.FC<TreasuryPartyArchivingColProps> = ({
  type,
  partyName,
  setPartyName,
  description,
  setDescription,
  attachment,
  setAttachment,
  setFormError,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-bold text-slate-200">
        <span className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-cyan-400" />
          <span>بيانات الطرف والأرشفة الإلكترونية</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">القسم التوثيقي</span>
      </div>

      {/* Party Name */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
          {type === 'deposit' ? 'اسم المودع / الطرف الدافع *' : 'اسم المستلم / الجهة الصارفة *'}
        </label>
        <input
          type="text"
          required
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder={
            type === 'deposit'
              ? 'مثال: المدير العام، مصرف بغداد، السيد جاسم...'
              : 'مثال: شركة الكهرباء، الموظف، صاحب العقار...'
          }
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none text-xs"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
          البيان والتفاصيل الإيضاحية
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="شرح سبب وتفاصيل حركة الصندوق..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none resize-none text-xs"
        />
      </div>

      {/* Receipt Archiving */}
      <TreasuryReceiptArchiver
        attachment={attachment}
        onAttachmentChange={setAttachment}
        onSetError={setFormError}
      />
    </div>
  );
};
