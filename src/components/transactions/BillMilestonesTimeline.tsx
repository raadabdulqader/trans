'use client';

import React, { useState } from 'react';
import { 
  CalendarClock, 
  FileCheck2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  Edit3, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { MilestoneOperationalStrip } from './milestones/MilestoneOperationalStrip';
import { MilestoneCardsGrid, MilestoneItem } from './milestones/MilestoneCardsGrid';
import { MilestonesInlineEditor } from './milestones/MilestonesInlineEditor';

export interface BillMilestonesTimelineProps {
  billNo: string;
  jobNumber?: string;
  deliveryOrderDate?: string;
  clearanceDate?: string;
  exitDate?: string;
  containerReturnDate?: string;
  containersCount?: number;
  freeTimeDays?: number;
  containerDestination?: string;
  onUpdateDates?: (updates: {
    deliveryOrderDate?: string;
    clearanceDate?: string;
    exitDate?: string;
    containerReturnDate?: string;
  }) => void;
}

export const BillMilestonesTimeline: React.FC<BillMilestonesTimelineProps> = ({
  billNo,
  jobNumber,
  deliveryOrderDate,
  clearanceDate,
  exitDate,
  containerReturnDate,
  containersCount = 0,
  freeTimeDays,
  containerDestination,
  onUpdateDates,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDO, setTempDO] = useState(deliveryOrderDate || '');
  const [tempClearance, setTempClearance] = useState(clearanceDate || '');
  const [tempExit, setTempExit] = useState(exitDate || '');
  const [tempReturn, setTempReturn] = useState(containerReturnDate || '');

  const milestones: MilestoneItem[] = [
    {
      id: 'do',
      stepNum: 1,
      title: 'أمر تسليم الشحنة',
      code: 'D/O Issued',
      date: deliveryOrderDate,
      icon: FileCheck2,
      desc: 'إذن التسليم من الوكيل الملاحي',
      color: 'indigo',
    },
    {
      id: 'clearance',
      stepNum: 2,
      title: 'إنجاز التخليص الكمركي',
      code: 'Customs Cleared',
      date: clearanceDate,
      icon: ShieldCheck,
      desc: 'الكشف الجمركي وتثبيت الرسوم',
      color: 'emerald',
    },
    {
      id: 'exit',
      stepNum: 3,
      title: 'خروج الشحنة (Gate-Out)',
      code: 'Port Departure',
      date: exitDate,
      icon: Truck,
      desc: 'مغادرة بوابات الميناء / المنفذ',
      color: 'cyan',
    },
    {
      id: 'return',
      stepNum: 4,
      title: 'عودة الحاوية الفارغة',
      code: 'MT Container Return',
      date: containerReturnDate,
      icon: RotateCcw,
      desc: 'إرجاع الحاويات للخط الملاحي',
      color: 'purple',
    },
  ];

  const completedCount = milestones.filter(m => !!m.date).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handleStartEdit = () => {
    setTempDO(deliveryOrderDate || '');
    setTempClearance(clearanceDate || '');
    setTempExit(exitDate || '');
    setTempReturn(containerReturnDate || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateDates) {
      onUpdateDates({
        deliveryOrderDate: tempDO || undefined,
        clearanceDate: tempClearance || undefined,
        exitDate: tempExit || undefined,
        containerReturnDate: tempReturn || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const isAwaitingReturn = !!exitDate && !containerReturnDate && containersCount > 0;
  const baseDate = exitDate || deliveryOrderDate;
  const numFreeDays = Number(freeTimeDays) || 0;
  let deadlineDateStr: string | null = null;
  let daysRemaining: number | null = null;
  let isOverdue = false;

  if (baseDate && numFreeDays > 0) {
    try {
      const baseD = new Date(baseDate);
      const deadD = new Date(baseD);
      deadD.setDate(baseD.getDate() + numFreeDays);
      deadlineDateStr = deadD.toISOString().split('T')[0];

      if (!containerReturnDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(deadD);
        target.setHours(0, 0, 0, 0);
        const diffMs = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;
        isOverdue = diffDays < 0;
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-2.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CalendarClock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">المسار والخط الزمني التشغيلي</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                {completedCount}/4 مكتملة
              </span>
              {jobNumber && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                  Job: {jobNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onUpdateDates && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="h-7 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3 text-emerald-400" />
              <span>تحديث التواريخ</span>
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-1 animate-in fade-in">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>حفظ التواريخ</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Operational Parameters Strip */}
      <MilestoneOperationalStrip
        jobNumber={jobNumber}
        containerDestination={containerDestination}
        numFreeDays={numFreeDays}
        deadlineDateStr={deadlineDateStr}
        containerReturnDate={containerReturnDate}
        daysRemaining={daysRemaining}
        isOverdue={isOverdue}
      />

      {/* Progress Track */}
      <div className="relative">
        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive 4-Milestone Grid / Stepper */}
      {!isEditing ? (
        <MilestoneCardsGrid milestones={milestones} />
      ) : (
        <MilestonesInlineEditor
          tempDO={tempDO}
          onTempDOChange={setTempDO}
          tempClearance={tempClearance}
          onTempClearanceChange={setTempClearance}
          tempExit={tempExit}
          onTempExitChange={setTempExit}
          tempReturn={tempReturn}
          onTempReturnChange={setTempReturn}
        />
      )}

      {/* Demurrage & Container Return Alert */}
      {isAwaitingReturn && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              تنبيه الحاويات ({containersCount} حاوية): خرجت البضاعة من الميناء بتاريخ ({exitDate}) وبانتظار تسجيل تاريخ إعادة الحاويات الفارغة للخط الملاحي لتفادي غرامات التأخير.
            </span>
          </div>
          {onUpdateDates && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] shrink-0 hover:bg-amber-400 transition cursor-pointer"
            >
              تسجيل عودة الحاوية
            </button>
          )}
        </div>
      )}

      {containerReturnDate && (
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              تم تسليم وإعادة جميع الحاويات الفارغة للخط الملاحي بنجاح بتاريخ:{' '}
              <strong className="font-mono">{containerReturnDate}</strong>
            </span>
          </span>
          <span className="text-[10px] text-emerald-400/80 font-semibold">براءة ذمة التأخير ✓</span>
        </div>
      )}
    </div>
  );
};
