import React, { useRef } from 'react';
import { Paperclip, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';

interface TreasuryReceiptArchiverProps {
  attachment?: TreasuryAttachment;
  onAttachmentChange: (att?: TreasuryAttachment) => void;
  onSetError: (err: string | null) => void;
}

export const TreasuryReceiptArchiver: React.FC<TreasuryReceiptArchiverProps> = ({
  attachment,
  onAttachmentChange,
  onSetError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onSetError('حجم الملف يجب ألا يتجاوز 2 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onAttachmentChange({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      onSetError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
          <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
          <span>أرشفة وصل الإيداع أو السحب (صورة أو PDF):</span>
        </span>

        {attachment && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>مؤرشف</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!attachment ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 border border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-300 transition bg-slate-950/60 text-[11px] group cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>اضغط لرفع وأرشفة صورة الوصل المالي / الإشعار البنكي</span>
        </button>
      ) : (
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-950 border border-slate-700/80">
          <div className="flex items-center gap-2 truncate">
            {attachment.type.startsWith('image/') ? (
              <img
                src={attachment.dataUrl}
                alt="وصل مؤرشف"
                className="h-8 w-8 object-cover rounded-lg border border-slate-700"
              />
            ) : (
              <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                PDF
              </div>
            )}
            <div className="truncate">
              <div className="font-semibold text-white truncate max-w-[160px] text-[11px]">
                {attachment.name}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">{attachment.date}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 rounded-md font-bold cursor-pointer"
            >
              تغيير
            </button>
            <button
              type="button"
              onClick={() => onAttachmentChange(undefined)}
              className="p-1 text-rose-400 hover:text-rose-300 rounded-md hover:bg-rose-500/10 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
