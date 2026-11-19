'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TreasuryTransaction, TreasuryAttachment } from '../../types/customs';
import { pdfjsLib, base64ToUint8Array, base64ToBlob } from '../../utils/pdfRenderer';
import { ArchiveModalHeader } from '../treasury/archive/ArchiveModalHeader';
import { ArchiveViewerToolbar } from '../treasury/archive/ArchiveViewerToolbar';
import { ArchiveViewerBody } from '../treasury/archive/ArchiveViewerBody';
import { ArchiveModalFooter } from '../treasury/archive/ArchiveModalFooter';

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

  // PDF-specific states
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

  // Create safe object URL (Blob URL)
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

  // Render current PDF page directly to HTML5 Canvas
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
        <ArchiveModalHeader
          customTitle={customTitle}
          transaction={transaction}
          attachment={attachment}
          isPdf={isPdf}
          blobUrl={blobUrl}
          isFullscreen={isFullscreen}
          onOpenExternal={handleOpenExternal}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onClose={onClose}
        />

        {/* Viewer Canvas Area */}
        <div className="flex-1 p-3 sm:p-5 overflow-auto flex flex-col items-center justify-center bg-slate-950/80 relative">
          <ArchiveViewerToolbar
            isPdf={isPdf}
            numPages={numPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            setRotation={setRotation}
          />

          <ArchiveViewerBody
            isPdf={isPdf}
            isImage={isImage}
            isLoadingPdf={isLoadingPdf}
            pdfError={pdfError}
            canvasRef={canvasRef}
            attachment={attachment}
            zoomLevel={zoomLevel}
            rotation={rotation}
            isFullscreen={isFullscreen}
            blobUrl={blobUrl}
            onDownload={handleDownload}
            onOpenExternal={handleOpenExternal}
          />
        </div>

        <ArchiveModalFooter
          transaction={transaction}
          attachment={attachment}
        />
      </div>
    </div>
  );
};
