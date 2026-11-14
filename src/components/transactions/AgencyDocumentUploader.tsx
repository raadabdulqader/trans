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

    if (file.size > 4 * 1024 * 1024) {
      setFormError('حجم ملف ورقة الوكالة يجب ألا يتجاوز 4 ميغابايت');
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
    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2">
        <label className="text-slate-200 font-bold text-[11px] flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>ورقة الوكالة الخاصة بالعمل (أرشفة الوكالة)</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold rounded-xl transition text-[11px] flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{agencyDocument ? 'تحديث ورقة الوكالة' : 'أرشفة الوكالة'}</span>
        </button>
      </div>

      {agencyDocument ? (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-300 truncate">
                {agencyDocument.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                تمت أرشفة الوكالة • {(agencyDocument.size / 1024).toFixed(1)} KB • {agencyDocument.date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onViewArchive && (
              <button
                type="button"
                onClick={() => onViewArchive(agencyDocument, `ورقة الوكالة - بوليصة ${billNo}`)}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30"
              >
                <Eye className="w-3 h-3" />
                <span>معاينة</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAgencyDocument(undefined)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              title="إزالة ورقة الوكالة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-slate-400 leading-relaxed">
          يمكنك أرشفة ورقة الوكالة الخاصة بالزبون كصورة أو مستند PDF لمعاينتها عند تدقيق البوليصة.
        </div>
      )}
    </div>
  );
};
