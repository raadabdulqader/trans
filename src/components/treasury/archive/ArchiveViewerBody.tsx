import React from 'react';
import { Loader2, AlertCircle, Download, ExternalLink, FileText } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';

interface ArchiveViewerBodyProps {
  isPdf: boolean;
  isImage: boolean;
  isLoadingPdf: boolean;
  pdfError: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  attachment: TreasuryAttachment;
  zoomLevel: number;
  rotation: number;
  isFullscreen: boolean;
  blobUrl: string | null;
  onDownload: () => void;
  onOpenExternal: () => void;
}

export const ArchiveViewerBody: React.FC<ArchiveViewerBodyProps> = ({
  isPdf,
  isImage,
  isLoadingPdf,
  pdfError,
  canvasRef,
  attachment,
  zoomLevel,
  rotation,
  isFullscreen,
  blobUrl,
  onDownload,
  onOpenExternal,
}) => {
  return (
    <div className="w-full flex-1 overflow-auto flex items-center justify-center p-2">
      {/* Loading Indicator */}
      {isLoadingPdf && (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="text-sm font-bold text-slate-200">جاري فك تشفير وعرض ملف الـ PDF...</div>
          <div className="text-xs text-slate-400">يتم رسم الصفحات مباشرة على شاشة العرض دون الاعتماد على مشغل المتصفح</div>
        </div>
      )}

      {/* PDF Error Fallback with Direct Alternatives */}
      {isPdf && pdfError && !isLoadingPdf && (
        <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl max-w-md text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">تنبيه بخصوص ملف الـ PDF</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            الملف محفوظ ومؤرشف بأمان ولكن المتصفح يمنع عرضه التلقائي. يمكنك تحميله أو فتحه مباشرة عبر الرابط المباشر التالي:
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل الملف الآن</span>
            </button>
            {blobUrl && (
              <button
                onClick={onOpenExternal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>فتح بتبويب مستقل</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Canvas-Rendered PDF */}
      {isPdf && !pdfError && (
        <div 
          className={`transition-all duration-150 flex items-center justify-center ${isLoadingPdf ? 'hidden' : 'block'}`}
        >
          <canvas 
            ref={canvasRef} 
            className="rounded-2xl border border-slate-700/80 shadow-2xl bg-white max-w-full select-none"
          />
        </div>
      )}

      {/* High-res Image Rendering with Zoom & Rotate */}
      {isImage && (
        <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            style={{ 
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`, 
              transformOrigin: 'center center',
              maxHeight: isFullscreen ? '85vh' : '65vh',
            }}
            className="max-w-full rounded-2xl border border-slate-800 shadow-2xl object-contain transition-transform duration-150 select-none bg-slate-900/50"
          />
        </div>
      )}

      {/* Other Document Types (Word, Excel, etc.) */}
      {!isPdf && !isImage && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto text-2xl">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{attachment.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              هذا الملف محفوظ ومؤرشف كملف مكتبي. يمكنك تنزيله وتشغيله على جهازك.
            </p>
          </div>
          <button
            onClick={onDownload}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto transition"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الملف ({(attachment.size / 1024).toFixed(1)} KB)</span>
          </button>
        </div>
      )}
    </div>
  );
};
