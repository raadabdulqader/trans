'use client';

import React from 'react';
import { DatePicker } from '../../ui/date-picker';

export interface MilestonesInlineEditorProps {
  tempDO: string;
  onTempDOChange: (v: string) => void;
  tempClearance: string;
  onTempClearanceChange: (v: string) => void;
  tempExit: string;
  onTempExitChange: (v: string) => void;
  tempReturn: string;
  onTempReturnChange: (v: string) => void;
}

export const MilestonesInlineEditor: React.FC<MilestonesInlineEditorProps> = ({
  tempDO,
  onTempDOChange,
  tempClearance,
  onTempClearanceChange,
  tempExit,
  onTempExitChange,
  tempReturn,
  onTempReturnChange,
}) => {
  return (
    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700 space-y-2 animate-in fade-in">
      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
        <span>تعديل المواعيد والتواريخ التشغيلية مباشرة:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
            1. تاريخ أمر التسليم (D/O)
          </label>
          <DatePicker
            size="sm"
            value={tempDO}
            onChange={onTempDOChange}
            placeholder="اختر التاريخ..."
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
            2. تاريخ التخليص الكمركي
          </label>
          <DatePicker
            size="sm"
            value={tempClearance}
            onChange={onTempClearanceChange}
            placeholder="اختر التاريخ..."
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
            3. تاريخ خروج الشحنة
          </label>
          <DatePicker
            size="sm"
            value={tempExit}
            onChange={onTempExitChange}
            placeholder="اختر التاريخ..."
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
            4. تاريخ عودة الحاوية
          </label>
          <DatePicker
            size="sm"
            value={tempReturn}
            onChange={onTempReturnChange}
            placeholder="اختر التاريخ..."
          />
        </div>
      </div>
    </div>
  );
};
