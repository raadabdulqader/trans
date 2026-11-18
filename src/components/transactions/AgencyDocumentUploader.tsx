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
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-xs space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800 flex-wrap">
        <label className="text-white font-bold text-xs flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <span>ورقة الوكالة الرسمية الخاصة بالعمل</span>
        </label>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-7.5 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{agencyDocument ? 'تحديث الوكالة' : 'رفع وأرشفة الوكالة'}</span>
        </button>
      </div>

      {agencyDocument ? (
        <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-300 truncate">
                {agencyDocument.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                أُرشفت بنجاح • {(agencyDocument.size / 1024).toFixed(1)} KB • {agencyDocument.date}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onViewArchive && (
              <button
                type="button"
                onClick={() => onViewArchive(agencyDocument, `ورقة الوكالة - بوليصة ${billNo}`)}
                className="h-7 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-1 border border-emerald-500/40 transition cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>معاينة</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAgencyDocument(undefined)}
              className="h-7 w-7 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center justify-center cursor-pointer"
              title="إزالة ورقة الوكالة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-950/60 rounded-lg border border-dashed border-indigo-500/30 text-center text-xs text-slate-400 font-medium hover:border-indigo-400/60 hover:bg-indigo-500/5 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4 text-indigo-400/80 shrink-0" />
          <span className="text-slate-300 font-semibold">اضغط هنا لرفع وأرشفة ورقة الوكالة الرسمية للبوليصة</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">(PDF أو صور حتى 5MB)</span>
        </div>
      )}
    </div>
  );
};
