import React, { useState } from 'react';
import { Boxes, Plus, X, Trash2 } from 'lucide-react';

interface ContainersEditorProps {
  containers: string[];
  setContainers: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ContainersEditor: React.FC<ContainersEditorProps> = ({
  containers,
  setContainers,
}) => {
  const [containerInput, setContainerInput] = useState('');

  const handleAddContainer = () => {
    const val = containerInput.trim().toUpperCase();
    if (!val) return;
    if (!containers.includes(val)) {
      setContainers(prev => [...prev, val]);
    }
    setContainerInput('');
  };

  const handleRemoveContainer = (index: number) => {
    setContainers(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح كافة الحاويات المسجلة؟')) {
      setContainers([]);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 flex-wrap gap-2">
        <label className="text-white font-bold text-xs sm:text-sm flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <span>أرقام الحاويات المسجلة على البوليصة</span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs border border-cyan-500/30">
            {containers.length} {containers.length === 1 ? 'حاوية' : 'حاويات'}
          </span>
        </label>

        {containers.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        )}
      </div>

      {/* Input Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={containerInput}
            onChange={(e) => setContainerInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddContainer();
              }
            }}
            placeholder="أدخل رقم الحاوية (مثال: MSKU-123456-7) واضغط Enter..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-cyan-300 font-mono font-black text-xs sm:text-sm tracking-wider uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddContainer}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حاوية</span>
        </button>
      </div>

      {/* Containers Badges List */}
      {containers.length > 0 ? (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>الحاويات المرتبطة بهذه البوليصة:</span>
            <span className="font-mono text-cyan-400 font-bold">إجمالي: {containers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/70 rounded-xl border border-slate-800">
            {containers.map((cont, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-200 font-mono font-black text-xs sm:text-sm shadow-xs group hover:border-cyan-400 transition"
              >
                <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="tracking-wider">{cont}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveContainer(idx)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  title="حذف الحاوية"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 font-medium">
          لم يتم تسجيل أي حاويات بعد. يمكنك إضافة أرقام الحاويات الآن أو في أي وقت لاحقاً.
        </div>
      )}
    </div>
  );
};
