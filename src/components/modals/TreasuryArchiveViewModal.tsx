'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Printer, 
  RotateCw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { pdfjsLib, base64ToUint8Array, base64ToBlob } from '../../utils/pdfRenderer';

interface TreasuryArchiveViewModalProps {
  isOpen: boolean;
  transaction?: TreasuryTransaction | null;
  directAttachment?: TreasuryAttachment | null;
  customTitle?: string;
  onClose: () => void;
}

export const TreasuryArchiveViewModal: React.FC<TreasuryArchiveViewModalProps> = ({
  isOpen,
  transaction,
  directAttachment,
  customTitle,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // PDF-specific states (Canvas rendering bypasses browser iframe & PDF plugin blocks)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const attachment = directAttachment || transaction?.attachment;

  const isPdf = Boolean(
    attachment?.type?.includes('pdf') || 
    attachment?.name?.toLowerCase().endsWith('.pdf') || 
    attachment?.dataUrl?.startsWith('data:application/pdf')
  );

  const isImage = Boolean(!isPdf && (
    attachment?.type?.startsWith('image/') || 
    attachment?.name?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/) ||
    attachment?.dataUrl?.startsWith('data:image/')
  ));

  // Reset zoom & page when modal opens or attachment changes
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
      setCurrentPage(1);
    }
  }, [isOpen, attachment?.dataUrl]);

  // Create safe object URL (Blob URL) for download or safe new tab opening
  useEffect(() => {
    if (!attachment?.dataUrl) {
      setBlobUrl(null);
      return;
    }

    try {
      const mime = isPdf ? 'application/pdf' : (attachment.type || 'image/jpeg');
      const blob = base64ToBlob(attachment.dataUrl, mime);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.warn('Could not create Blob URL:', err);
    }
  }, [attachment?.dataUrl, isPdf]);

  // Load PDF with Mozilla PDF.js into memory
  useEffect(() => {
    if (!isOpen || !attachment?.dataUrl || !isPdf) {
      setPdfDoc(null);
      setPdfError(null);
      setIsLoadingPdf(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingPdf(true);
    setPdfError(null);

    const loadPdfDoc = async () => {
      try {
        const bytes = base64ToUint8Array(attachment.dataUrl);
        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages || 1);
          setCurrentPage(1);
          setIsLoadingPdf(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('PDF.js loading error:', err);
          setPdfError(err?.message || 'تعذر فك تشفير محتوى الـ PDF');
          setIsLoadingPdf(false);
        }
      }
    };

    loadPdfDoc();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, attachment?.dataUrl, isPdf]);

  // Render current PDF page directly to HTML5 Canvas (100% bypasses browser blocks)
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !isPdf) return;

    let isCancelled = false;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Retina quality factor
        const pixelRatio = window.devicePixelRatio || 1;
        const scale = 1.6 * zoomLevel * pixelRatio;
        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (_) {}
      }
    };
  }, [pdfDoc, currentPage, zoomLevel, rotation, isPdf]);

  if (!isOpen || !attachment) return null;

  const handleDownload = () => {
    if (!attachment.dataUrl) return;
    try {
      const mime = isPdf ? 'application/pdf' : (attachment.type || 'application/octet-stream');
      const blob = base64ToBlob(attachment.dataUrl, mime);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name || `receipt_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      const a = document.createElement('a');
      a.href = attachment.dataUrl;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // Safe native printing without window.open (bypasses iframe popup blocks)
  const handlePrint = () => {
    let printSource = '';
    if (isPdf && canvasRef.current) {
      printSource = canvasRef.current.toDataURL('image/png');
    } else if (attachment.dataUrl) {
      printSource = attachment.dataUrl;
    }

    if (!printSource) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <title>${customTitle || 'طباعة الوصل المؤرشف'}</title>
            <style>
              @page { size: auto; margin: 10mm; }
              body { margin: 0; padding: 20px; text-align: center; font-family: 'Cairo', sans-serif; }
              h2 { font-size: 16px; color: #0f172a; margin-bottom: 6px; }
              p { font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 15px; }
              img { max-width: 95%; max-height: 85vh; height: auto; border: 1px solid #cbd5e1; border-radius: 8px; margin: 0 auto; display: block; }
            </style>
          </head>
          <body>
            <h2>${customTitle || (transaction ? `الوصل المؤرشف للسند ${transaction.voucherNo}` : 'الوصل المؤرشف')}</h2>
            <p>اسم الملف: ${attachment.name} • تاريخ الأرشفة: ${attachment.date || ''}</p>
            <img src="${printSource}" />
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Print frame error:', e);
        } finally {
          setTimeout(() => iframe.remove(), 1500);
        }
      }, 350);
    }
  };

  const handleOpenExternal = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-slate-900 border border-slate-800 rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen 
            ? 'fixed inset-2 z-50 max-w-none h-[calc(100vh-16px)]' 
            : 'max-w-4xl max-h-[92vh] h-[85vh]'
        }`}
      >
        
        {/* Header */}
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
            
            {/* Safe New Tab Opening (Blob) */}
            {blobUrl && (
              <button
                onClick={handleOpenExternal}
                title="فتح الوصل في تبويب جديد دون حظر المتصفح"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 hidden md:flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>تبويب جديد</span>
              </button>
            )}

            {/* Direct Print */}
            <button
              onClick={handlePrint}
              title="طباعة الوصل فوراً"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              title="تحميل نسخة احتياطية من الملف الأصلي"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'تصغير المعاينة' : 'تكبير المعاينة ملء الشاشة'}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button 
              onClick={onClose} 
              title="إغلاق المعاينة"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Canvas Area */}
        <div className="flex-1 p-3 sm:p-5 overflow-auto flex flex-col items-center justify-center bg-slate-950/80 relative">
          
          {/* Floating Zoom & Page Controls Toolbar (Works for both Canvas PDF & Images) */}
          <div className="sticky top-2 z-20 flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/95 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-2xl text-xs mb-3">
            
            {/* Multi-page controls for PDF */}
            {isPdf && numPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono font-bold text-cyan-400 px-1">
                  صفحة {currentPage} من {numPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                  disabled={currentPage >= numPages}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-slate-700 mx-1" />
              </>
            )}

            {/* Zoom Controls */}
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.2))}
              className="p-1 rounded-lg hover:bg-slate-800 hover:text-cyan-400 text-slate-300 transition"
              title="تصغير (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-mono font-bold text-slate-200 px-1 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={() => setZoomLevel(prev => Math.min(3.5, prev + 0.2))}
              className="p-1 rounded-lg hover:bg-slate-800 hover:text-cyan-400 text-slate-300 transition"
              title="تكبير (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-slate-700 mx-1" />

            {/* Rotate */}
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1 rounded-lg hover:bg-slate-800 hover:text-cyan-400 text-slate-300 transition flex items-center gap-1"
              title="تدوير 90 درجة باتجاه اليمين"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              onClick={() => { setZoomLevel(1); setRotation(0); }}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-slate-800 transition font-medium"
            >
              100% ضبط
            </button>
          </div>

          {/* Main Rendering Canvas Container */}
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
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الملف الآن</span>
                  </button>
                  {blobUrl && (
                    <button
                      onClick={handleOpenExternal}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>فتح بتبويب مستقل</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Canvas-Rendered PDF (100% Native Drawing - No Plugin, No Iframe Block) */}
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
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto transition"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف ({(attachment.size / 1024).toFixed(1)} KB)</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Footer Info Bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          {transaction ? (
            <div className="flex flex-wrap items-center gap-4">
              <div>
                البيان: <strong className="text-slate-200">{transaction.description || 'سند مالي'}</strong>
              </div>
              <div>
                الطرف: <strong className="text-white">{transaction.partyName}</strong>
              </div>
              <div>
                المبلغ: <strong className="text-emerald-400 font-mono font-bold" dir="ltr">{formatCurrency(transaction.amount)}</strong>
              </div>
            </div>
          ) : (
            <div>
              الوثيقة: <strong className="text-slate-200">{attachment.name}</strong> • تم فك حظر المعاينة وعرضها مباشرة بنظام Canvas
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>نظام المعاينة المستقل: لا يتأثر ببلوك المتصفح أو إضافات الحماية</span>
          </div>
        </div>

      </div>
    </div>
  );
};
