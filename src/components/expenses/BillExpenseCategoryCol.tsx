import React, { useRef, useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Building2, 
  FileText, 
  Paperclip, 
  Upload, 
  Receipt, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { Employee, TreasuryAttachment } from '../../types/customs';
import { BILL_EXPENSE_PRESETS, BillExpenseCategory } from './BillExpensePresets';

interface BillExpenseCategoryColProps {
  category: string;
  setCategory: (c: string) => void;
  onSelectPreset: (preset: BillExpenseCategory) => void;
  partyName: string;
  setPartyName: (p: string) => void;
  employee?: Employee;
  description: string;
  setDescription: (d: string) => void;
  attachment?: TreasuryAttachment;
  setAttachment: (att?: TreasuryAttachment) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  voucherNo: string;
  billNo: string;
  date: string;
  processFile: (file: File) => void;
}

export const BillExpenseCategoryCol: React.FC<BillExpenseCategoryColProps> = ({
  category,
  setCategory,
  onSelectPreset,
  partyName,
  setPartyName,
  employee,
  description,
  setDescription,
  attachment,
  setAttachment,
  onViewArchive,
  voucherNo,
  billNo,
  date,
  processFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          2. تصنيف المصروف، المستلم، والوصل
        </h3>
      </div>

      {/* Expense Category Preset Grid */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>تصنيف المصروف الكمركي / التشغيلي:</span>
          </label>
          <span className="text-[10px] text-slate-500">
            انقر على البند للتعبئة التلقائية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {BILL_EXPENSE_PRESETS.map((preset) => {
            const isSelected = category === preset.name;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-right transition border flex flex-col justify-between gap-1 text-xs relative cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-white border-amber-500 ring-2 ring-amber-500/40 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold truncate text-[11px]">{preset.name}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {preset.shortDesc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom / Active Category Name Input */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            اسم التصنيف المعتمد للسند (يمكنك تخصيصه إذا أردت):
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
            placeholder="اكتب تصنيف المصروف..."
          />
        </div>
      </div>

      {/* Beneficiary / Payee */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
        <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>الجهة المستلمة / الصادر لأمره <span className="text-rose-400">*</span></span>
        </label>
        <input
          type="text"
          required
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="مثلاً: كمرك أم قصر، شركة الموانئ، فحص سونار، مقاول العمال..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
        />

        {/* Quick Party Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-500 text-[10px]">اقتراحات سريعة:</span>
          {employee && (
            <button
              type="button"
              onClick={() => setPartyName(employee.name)}
              className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition cursor-pointer"
            >
              المخلص: {employee.name}
            </button>
          )}
          <button
            type="button"
            onClick={() => setPartyName('الهيئة العامة للكمارك - المنفذ الجمركي')}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition cursor-pointer"
          >
            الكمارك
          </button>
          <button
            type="button"
            onClick={() => setPartyName('الشركة العامة لموانئ العراق')}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition cursor-pointer"
          >
            الموانئ
          </button>
          <button
            type="button"
            onClick={() => setPartyName('محطة الفحص وسونار أم قصر')}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition cursor-pointer"
          >
            السونار
          </button>
          <button
            type="button"
            onClick={() => setPartyName('إدارة الميزان الجمركي')}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition cursor-pointer"
          >
            الميزان
          </button>
        </div>
      </div>

      {/* Statement / Description */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
        <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>البيان / تفاصيل سبب الصرف</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اكتب تفاصيل أو سبب الصرف ورقم الحاوية أو المنفذ أو رقم الإيصال..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Receipt Attachment & Archive Box */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          className="hidden"
        />

        <div className="flex items-center justify-between">
          <span className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
            <span>أرشفة وصل / مستند المصروف (صورة أو PDF):</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 transition shadow-xs cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{attachment ? 'تغيير الوصل' : 'رفع الوصل'}</span>
          </button>
        </div>

        {attachment ? (
          <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-white font-mono font-bold block truncate">{attachment.name}</span>
                <span className="text-[10px] text-slate-400">
                  {(attachment.size / 1024).toFixed(1)} KB • {attachment.date || date}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onViewArchive && (
                <button
                  type="button"
                  onClick={() => onViewArchive(attachment, `وصل مصروف ${voucherNo} - بوليصة ${billNo}`)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/30 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAttachment(undefined)}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                title="إزالة المرفق"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
              isDragging 
                ? 'border-amber-400 bg-amber-500/10 text-amber-300' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-400'
            }`}
          >
            <Upload className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-medium">اسحب وأفلت صورة الوصل هنا، أو انقر للاختيار</span>
            <span className="text-[10px] text-slate-500">يدعم الصور وملفات PDF بحد أقصى 5 ميغابايت</span>
          </div>
        )}
      </div>
    </div>
  );
};
