import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

interface ArchiveViewerToolbarProps {
  isPdf: boolean;
  numPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
}

export const ArchiveViewerToolbar: React.FC<ArchiveViewerToolbarProps> = ({
  isPdf,
  numPages,
  currentPage,
  setCurrentPage,
  zoomLevel,
  setZoomLevel,
  setRotation,
}) => {
  return (
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
  );
};
