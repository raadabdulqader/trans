import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';
import { AgencyDocumentUploader } from '../AgencyDocumentUploader';
import { CustomsNotesPicker } from '../CustomsNotesPicker';

export interface TransactionNotesTabProps {
  agencyDocument?: TreasuryAttachment;
  setAgencyDocument: React.Dispatch<React.SetStateAction<TreasuryAttachment | undefined>>;
  billNo: string;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  setFormError: (err: string | null) => void;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  onPrev: () => void;
}

export const TransactionNotesTab: React.FC<TransactionNotesTabProps> = ({
  agencyDocument,
  setAgencyDocument,
  billNo,
  onViewArchive,
  setFormError,
  notes,
  setNotes,
  onPrev,
}) => {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-200 text-xs">
      {/* 1. ورقة الوكالة الرسمية */}
      <AgencyDocumentUploader
        agencyDocument={agencyDocument}
        setAgencyDocument={setAgencyDocument}
        billNo={billNo}
        onViewArchive={onViewArchive}
        setFormError={setFormError}
      />

      {/* 2. الملاحظات ومكتبة العبارات الكمركية */}
      <CustomsNotesPicker
        notes={notes}
        setNotes={setNotes}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onPrev}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى الحاويات</span>
        </button>
        <button
          type="submit"
          className="h-8 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition cursor-pointer"
        >
          <span>💾 حفظ بيانات البوليصة</span>
        </button>
      </div>
    </div>
  );
};
