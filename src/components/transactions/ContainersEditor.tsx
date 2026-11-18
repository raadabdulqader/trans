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
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-750 shadow-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 flex-wrap gap-1.5">
        <label className="text-white font-bold text-xs flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span>أرقام الحاويات المسجلة</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-black text-[10px] border border-cyan-500/30">
            {containers.length}
          </span>
        </label>

        {containers.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح الكل</span>
          </button>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
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
            placeholder="رقم الحاوية (مثال: MSKU-123456-7) واضغط Enter..."
            className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-cyan-300 font-mono font-bold text-xs tracking-wider uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddContainer}
          className="h-8 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة</span>
        </button>
      </div>

      {/* Containers Badges List */}
      {containers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950/70 rounded-lg border border-slate-800">
          {containers.map((cont, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-200 font-mono font-bold text-xs group hover:border-cyan-400 transition"
            >
              <span className="text-[10px] text-cyan-400 font-semibold">#{idx + 1}</span>
              <span className="tracking-wide">{cont}</span>
              <button
                type="button"
                onClick={() => handleRemoveContainer(idx)}
                className="p-0.5 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="حذف الحاوية"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-2 bg-slate-950/50 rounded-lg border border-dashed border-slate-800 text-center text-[11px] text-slate-400 font-medium">
          لم يتم تسجيل حاويات بعد. يمكنك إضافة أرقام الحاويات الآن أو لاحقاً.
        </div>
      )}
    </div>
  );
};
