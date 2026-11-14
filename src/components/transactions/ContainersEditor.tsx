import React, { useState } from 'react';
import { Boxes, Plus, X } from 'lucide-react';

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

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
          <Boxes className="w-3.5 h-3.5 text-cyan-400" />
          <span>أرقام الحاويات المسجلة</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px]">
            {containers.length}
          </span>
        </label>
        <span className="text-[10px] text-slate-500">اختياري</span>
      </div>

      <div className="flex gap-2">
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
          placeholder="رقم الحاوية (MSKU-123456-7) اضغط Enter"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono uppercase text-[11px] focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddContainer}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl transition text-[11px] flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="w-3 h-3" />
          إضافة
        </button>
      </div>

      {containers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1 max-h-16 overflow-y-auto">
          {containers.map((cont, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold text-[10px]"
            >
              <span>{cont}</span>
              <button
                type="button"
                onClick={() => handleRemoveContainer(idx)}
                className="text-slate-400 hover:text-rose-400"
                title="حذف الحاوية"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-[10px] text-slate-500">
          لم تتم إضافة حاويات (يمكن إضافتها الآن أو لاحقاً)
        </div>
      )}
    </div>
  );
};
