import React, { useRef } from 'react';
import { X, Upload, FileText, Trash2, Download, Paperclip, Eye } from 'lucide-react';
import { Attachment } from '../../types/customs';

interface AttachmentsModalProps {
  isOpen: boolean;
  entityType: 'transaction' | 'receipt';
  entityId: string;
  entityTitle: string;
  attachments: Attachment[];
  onClose: () => void;
  onAddAttachment: (att: Omit<Attachment, 'id'>) => void;
  onDeleteAttachment: (attId: string) => void;
  onViewAttachment?: (att: Attachment) => void;
}

export const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  isOpen,
  entityType,
  entityId,
  entityTitle,
  attachments,
  onClose,
  onAddAttachment,
  onDeleteAttachment,
  onViewAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentAttachments = attachments.filter(
    a => a.entityType === entityType && a.entityId === entityId
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // 2MB limit
      if (file.size > 2 * 1024 * 1024) {
        alert(`الملف ${file.name} حجمه أكبر من 2MB، يرجى اختيار ملف أصغر.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onAddAttachment({
          entityType,
          entityId,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
          date: new Date().toISOString().split('T')[0],
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (att: Attachment) => {
    if (!att.dataUrl) {
      alert('محتوى الملف غير متوفر أو ملف افتراضي.');
      return;
    }
    const a = document.createElement('a');
    a.href = att.dataUrl;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-cyan-400" />
            <span>المرفقات والوصولات ({entityTitle})</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-xl group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-200">اضغط لرفع الملفات والوصولات</p>
            <small className="text-slate-400 block mt-1">
              PDF، صور المنافيست، وصولات الكمرك، Word، Excel — الحد الأقصى 2MB للملف
            </small>
          </div>

          {/* Attachments List */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300 block">
              الملفات المرفوعة ({currentAttachments.length}):
            </span>

            {currentAttachments.length === 0 ? (
              <div className="text-center py-6 text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                لا توجد مرفقات مسجلة بعد
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {currentAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{att.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(att.size / 1024).toFixed(1)} KB • {att.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {att.dataUrl && (
                        <>
                          {onViewAttachment && (
                            <button
                              onClick={() => onViewAttachment(att)}
                              title="معاينة الملف المرفق فوراً"
                              className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(att)}
                            title="تحميل الملف"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteAttachment(att.id)}
                        title="حذف الملف"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
