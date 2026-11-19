import React from 'react';
import { FileText, Paperclip, Trash2, Upload } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';
import { SubAccountType, SALARY_TYPES, DAILY_CATEGORIES, RENT_TYPES } from './AccountExpensePresets';

interface AccountExpenseClassificationFormProps {
  subAccount: SubAccountType;
  expenseSubCategory: string;
  setExpenseSubCategory: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  attachment: TreasuryAttachment | undefined;
  setAttachment: (att: TreasuryAttachment | undefined) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AccountExpenseClassificationForm: React.FC<AccountExpenseClassificationFormProps> = ({
  subAccount,
  expenseSubCategory,
  setExpenseSubCategory,
  description,
  setDescription,
  attachment,
  setAttachment,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-cyan-400" />
          تصنيف البند والأرشيف
        </span>
        <span className="text-[10px] text-slate-500">أرشفة الوصل</span>
      </div>

      {/* Sub-category selector */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
          نوع البند التفصيلي <span className="text-rose-400">*</span>
        </label>
        <select
          value={expenseSubCategory}
          onChange={(e) => setExpenseSubCategory(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
        >
          {subAccount === 'salaries' && SALARY_TYPES.map((st, i) => (
            <option key={i} value={st}>{st}</option>
          ))}
          {subAccount === 'daily' && DAILY_CATEGORIES.map((dc, i) => (
            <option key={i} value={dc}>{dc}</option>
          ))}
          {subAccount === 'rents' && RENT_TYPES.map((rt, i) => (
            <option key={i} value={rt}>{rt}</option>
          ))}
        </select>
      </div>

      {/* Notes / Description */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">البيان / الوصف</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ملاحظات تفصيلية حول عملية الصرف..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none"
        />
      </div>

      {/* Attachment / Receipt Archiving */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px] flex items-center justify-between">
          <span>أرشفة وصل أو فاتورة الصرف</span>
          <span className="text-[10px] text-slate-500">صور أو مستندات أو PDF</span>
        </label>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        {attachment ? (
          <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs text-white font-medium truncate">{attachment.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {(attachment.size / 1024).toFixed(1)} KB • مؤرشف وجاهز للمعاينة
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(undefined)}
              className="text-rose-400 hover:text-rose-300 p-1"
              title="حذف الملف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-slate-200 text-xs transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>رفع وأرشفة وصل الدفع أو الفاتورة</span>
          </button>
        )}
      </div>
    </div>
  );
};
