import React from 'react';
import { 
  Eye, 
  ShieldCheck, 
  ExternalLink, 
  Printer, 
  Download, 
  Maximize2, 
  Minimize2, 
  X 
} from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment } from '../../../types/customs';

interface ArchiveModalHeaderProps {
  customTitle?: string;
  transaction?: TreasuryTransaction | null;
  attachment: TreasuryAttachment;
  isPdf: boolean;
  blobUrl: string | null;
  isFullscreen: boolean;
  onOpenExternal: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export const ArchiveModalHeader: React.FC<ArchiveModalHeaderProps> = ({
  customTitle,
  transaction,
  attachment,
  isPdf,
  blobUrl,
  isFullscreen,
  onOpenExternal,
  onPrint,
  onDownload,
  onToggleFullscreen,
  onClose,
}) => {
  return (
    <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-xs">
          <Eye className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white">
              {customTitle || (transaction ? `معاينة الوصل المؤرشف - سند رقم ${transaction.voucherNo}` : 'معاينة الوصل المؤرشف')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>معاينة مباشرة مفكوك الحظر</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {attachment.name} • {(attachment.size / 1024).toFixed(1)} KB • {isPdf ? 'مستند PDF (مُعالج بكود المحرك المباشر)' : 'صورة وثيقة'}
          </p>
        </div>
      </div>

      {/* Action Tools in Header */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {blobUrl && (
          <button
            onClick={onOpenExternal}
            title="فتح الوصل في تبويب جديد دون حظر المتصفح"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 hidden md:flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>تبويب جديد</span>
          </button>
        )}

        <button
          onClick={onPrint}
          title="طباعة الوصل فوراً"
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">طباعة</span>
        </button>

        <button
          onClick={onDownload}
          title="تحميل نسخة احتياطية من الملف الأصلي"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'تصغير المعاينة' : 'تكبير المعاينة ملء الشاشة'}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button 
          onClick={onClose} 
          title="إغلاق المعاينة"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition mr-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
