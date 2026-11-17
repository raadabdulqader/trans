import React, { useRef } from 'react';
import { FileCheck2, Upload, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { TreasuryAttachment } from '../../types/customs';

interface AgencyDocumentUploaderProps {
  agencyDocument?: TreasuryAttachment;
  setAgencyDocument: React.Dispatch<React.SetStateAction<TreasuryAttachment | undefined>>;
  billNo: string;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  setFormError: (msg: string | null) => void;
}

export const AgencyDocumentUploader: React.FC<AgencyDocumentUploaderProps> = ({
  agencyDocument,
  setAgencyDocument,
  billNo,
  onViewArchive,
  setFormError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم ملف ورقة الوكالة يجب ألا يتجاوز 5 ميغابايت');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAgencyDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xs space-y-3.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800 flex-wrap">
        <label className="text-white font-bold text-xs sm:text-sm flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <span>ورقة الوكالة الرسمية الخاصة بالعمل (أرشفة الوكالة)</span>
        </label>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-black rounded-xl transition text-xs flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{agencyDocument ? 'تحديث وثيقة الوكالة' : 'رفع وأرشفة الوكالة'}</span>
        </button>
      </div>

      {agencyDocument ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-emerald-300 truncate">
                {agencyDocument.name}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                تمت الأرشفة بنجاح • {(agencyDocument.size / 1024).toFixed(1)} KB • {agencyDocument.date}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {onViewArchive && (
              <button
                type="button"
                onClick={() => onViewArchive(agencyDocument, `ورقة الوكالة - بوليصة ${billNo}`)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-black flex items-center gap-1.5 border border-emerald-500/40 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة الوثيقة</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAgencyDocument(undefined)}
              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
              title="إزالة ورقة الوكالة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-5 bg-slate-950/60 rounded-xl border border-dashed border-indigo-500/30 text-center text-xs text-slate-400 font-medium hover:border-indigo-400/60 hover:bg-indigo-500/5 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
        >
          <Upload className="w-6 h-6 text-indigo-400/80 mb-1" />
          <span className="text-slate-200 font-bold">اضغط هنا لرفع وأرشفة ورقة الوكالة الرسمية للبوليصة</span>
          <span className="text-[11px] text-slate-500">يقبل النظام ملفات الصور (JPG, PNG) أو مستندات PDF بحجم أقصى 5 ميغابايت</span>
        </div>
      )}
    </div>
  );
};
