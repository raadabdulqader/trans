import React, { useState } from 'react';
import { 
  CalendarClock, 
  FileCheck2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Check, 
  AlertTriangle,
  Hourglass,
  MapPin
} from 'lucide-react';
import { DatePicker } from '../ui/date-picker';

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

  const milestones = [
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

  // Check if containers might be at risk of demurrage/detention (exitDate set, but containerReturnDate not set)
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

      {/* Operational Parameters Strip (Job No, Container Destination, Free Time) */}
      {(jobNumber || containerDestination || numFreeDays > 0) && (
        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {jobNumber && (
              <div className="flex items-center gap-1 font-mono">
                <span className="text-slate-400 text-[10px]">رقم المعاملة:</span>
                <strong className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 text-[11px]">{jobNumber}</strong>
              </div>
            )}
            {containerDestination && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-slate-400 text-[10px]">الوجهة:</span>
                <strong className="text-slate-200 text-xs">{containerDestination}</strong>
              </div>
            )}
            {numFreeDays > 0 && (
              <div className="flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-[10px]">السماح:</span>
                <strong className="text-amber-400 font-mono text-xs">{numFreeDays} يوم</strong>
                {deadlineDateStr && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    (أقصى موعد: {deadlineDateStr})
                  </span>
                )}
              </div>
            )}
          </div>

          {deadlineDateStr && !containerReturnDate && daysRemaining !== null && (
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border font-mono ${
              isOverdue
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : daysRemaining <= 3
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {isOverdue ? `⚠️ متأخر بـ ${Math.abs(daysRemaining)} يوم!` : daysRemaining === 0 ? '⚠️ ينتهي اليوم!' : `متبقي ${daysRemaining} يوم`}
            </div>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className="relative">
        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive 4-Milestone 2x2 Grid / Stepper */}
      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {milestones.map((m) => {
            const Icon = m.icon;
            const isDone = !!m.date;

            return (
              <div
                key={m.id}
                className={`p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-slate-900/90 border-slate-750 shadow-xs'
                    : 'bg-slate-950/40 border-slate-850 border-dashed opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isDone 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-bold text-xs text-white truncate">
                        {m.stepNum}. {m.title}
                      </span>
                    </div>

                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 truncate">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">التاريخ:</span>
                  {isDone ? (
                    <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" dir="ltr">
                      {m.date}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">
                      لم يُحدد بعد
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Inline Quick Edit Mode in 2x2 Grid with Compact DatePickers */
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
                onChange={setTempDO}
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
                onChange={setTempClearance}
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
                onChange={setTempExit}
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
                onChange={setTempReturn}
                placeholder="اختر التاريخ..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Demurrage & Container Return Alert (if cargo exited but containers not returned) */}
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
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] shrink-0 hover:bg-amber-400 transition"
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
            <span>تم تسليم وإعادة جميع الحاويات الفارغة للخط الملاحي بنجاح بتاريخ: <strong className="font-mono">{containerReturnDate}</strong></span>
          </span>
          <span className="text-[10px] text-emerald-400/80 font-semibold">براءة ذمة التأخير ✓</span>
        </div>
      )}
    </div>
  );
};
