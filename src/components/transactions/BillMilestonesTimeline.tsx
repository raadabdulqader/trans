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
  AlertTriangle 
} from 'lucide-react';
import { DatePicker } from '../ui/date-picker';

export interface BillMilestonesTimelineProps {
  billNo: string;
  deliveryOrderDate?: string;
  clearanceDate?: string;
  exitDate?: string;
  containerReturnDate?: string;
  containersCount?: number;
  onUpdateDates?: (updates: {
    deliveryOrderDate?: string;
    clearanceDate?: string;
    exitDate?: string;
    containerReturnDate?: string;
  }) => void;
}

export const BillMilestonesTimeline: React.FC<BillMilestonesTimelineProps> = ({
  billNo,
  deliveryOrderDate,
  clearanceDate,
  exitDate,
  containerReturnDate,
  containersCount = 0,
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

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg space-y-3.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">المسار والخط الزمني التشغيلي للبوليصة</h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                {completedCount} من 4 مراحل مكتملة
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              تتبع الإجراءات من استلام أمر التسليم حتى تفريغ وإعادة الحاوية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onUpdateDates && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3 h-3 text-emerald-400" />
              <span>تحديث التواريخ</span>
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ التواريخ</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative">
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive 4-Milestone Grid / Stepper */}
      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {milestones.map((m) => {
            const Icon = m.icon;
            const isDone = !!m.date;

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-slate-900/90 border-slate-750 shadow-xs'
                    : 'bg-slate-950/40 border-slate-850 border-dashed opacity-80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-white">
                        {m.stepNum}. {m.title}
                      </span>
                    </div>

                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">التاريخ:</span>
                  {isDone ? (
                    <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20" dir="ltr">
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
        /* Inline Quick Edit Mode */
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-3 animate-in fade-in">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <span>تعديل المواعيد والتواريخ التشغيلية مباشرة:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                1. تاريخ أمر التسليم (D/O)
              </label>
              <DatePicker
                value={tempDO}
                onChange={setTempDO}
                placeholder="اختر التاريخ..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                2. تاريخ التخليص الكمركي
              </label>
              <DatePicker
                value={tempClearance}
                onChange={setTempClearance}
                placeholder="اختر التاريخ..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                3. تاريخ خروج الشحنة
              </label>
              <DatePicker
                value={tempExit}
                onChange={setTempExit}
                placeholder="اختر التاريخ..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                4. تاريخ عودة الحاوية
              </label>
              <DatePicker
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
