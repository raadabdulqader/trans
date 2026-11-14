import React from 'react';
import { X, AlertOctagon } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  message: string;
  details?: string[];
  onClose: () => void;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  message,
  details = [],
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-rose-900/60 to-rose-950/60 border-b border-rose-500/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-rose-200 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>⛔ لا يمكن إغلاق أو إنجاز المعاملة</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-200 text-sm leading-relaxed font-semibold">
            {message}
          </p>

          {details.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-rose-400 font-bold block">الأسباب المانعة:</span>
              <ul className="space-y-1.5 text-slate-300">
                {details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-normal">
            يجب أولاً تحصيل المبالغ المتبقية من العميل أو تصفية سلف المخلصين المفتوحة قبل اعتماد حالة (منجزة ✅).
          </p>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
          >
            فهمت، سأقوم بالتسوية
          </button>
        </div>
      </div>
    </div>
  );
};
