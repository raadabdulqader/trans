import React from 'react';
import { 
  CalendarClock, 
  FileCheck2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DatePicker } from '../ui/date-picker';

export interface BillMilestonesEditorProps {
  deliveryOrderDate?: string;
  onDeliveryOrderDateChange: (date: string) => void;
  clearanceDate?: string;
  onClearanceDateChange: (date: string) => void;
  exitDate?: string;
  onExitDateChange: (date: string) => void;
  containerReturnDate?: string;
  onContainerReturnDateChange: (date: string) => void;
}

export const BillMilestonesEditor: React.FC<BillMilestonesEditorProps> = ({
  deliveryOrderDate = '',
  onDeliveryOrderDateChange,
  clearanceDate = '',
  onClearanceDateChange,
  exitDate = '',
  onExitDateChange,
  containerReturnDate = '',
  onContainerReturnDateChange,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const milestones = [
    {
      id: 'do',
      title: 'أمر تسليم الشحنة (D/O)',
      subtitle: 'إذن التسليم الصادر من الوكيل الملاحي أو الناقل',
      date: deliveryOrderDate,
      onChange: onDeliveryOrderDateChange,
      icon: FileCheck2,
      color: 'indigo',
      stepNum: 1,
    },
    {
      id: 'clearance',
      title: 'إنجاز التخليص الكمركي',
      subtitle: 'إنهاء الكشف الجمركي وتثبيت الرسوم والإعفاء',
      date: clearanceDate,
      onChange: onClearanceDateChange,
      icon: ShieldCheck,
      color: 'emerald',
      stepNum: 2,
    },
    {
      id: 'exit',
      title: 'خروج الشحنة (Gate-Out)',
      subtitle: 'مغادرة الشاحنات والحاويات لبوابات الميناء / المنفذ',
      date: exitDate,
      onChange: onExitDateChange,
      icon: Truck,
      color: 'cyan',
      stepNum: 3,
    },
    {
      id: 'return',
      title: 'عودة الحاوية الفارغة',
      subtitle: 'تسليم الحاوية لمحطة الخط الملاحي لتفادي الغرامات',
      date: containerReturnDate,
      onChange: onContainerReturnDateChange,
      icon: RotateCcw,
      color: 'purple',
      stepNum: 4,
    },
  ];

  const completedCount = milestones.filter(m => !!m.date).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const getStageTitle = () => {
    if (completedCount === 4) return '✅ مكتملة المراحل التشغيلية بالكامل';
    if (completedCount === 3) return '🔄 بانتظار إعادة الحاويات الفارغة';
    if (completedCount === 2) return '🚛 بانتظار خروج الشحنة من الميناء';
    if (completedCount === 1) return '🏛️ بانتظار إنجاز التخليص الكمركي';
    return '⏳ بانتظار إصدار أمر تسليم الشحنة';
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 border border-slate-750 shadow-xs space-y-3">
      {/* Header with Progress Tracker */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>المسار الزمني والمراحل التشغيلية للشحنة</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-800 text-emerald-300 border border-emerald-500/30">
                {completedCount}/4 مراحل
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              توثيق المواعيد الحيوية من أمر التسليم حتى إعادة الحاويات
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-emerald-400 block font-mono">
            {progressPercent}% إنجاز
          </span>
          <span className="text-[9px] text-slate-400">
            {getStageTitle()}
          </span>
        </div>
      </div>

      {/* Mini Progress Bar Track */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2x2 Grid of Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {milestones.map((m) => {
          const Icon = m.icon;
          const isDone = !!m.date;

          const colorClasses = {
            indigo: {
              border: isDone ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800 bg-slate-950/60',
              iconBg: 'bg-indigo-500/15 text-indigo-300',
              badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            },
            emerald: {
              border: isDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/60',
              iconBg: 'bg-emerald-500/15 text-emerald-300',
              badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            },
            cyan: {
              border: isDone ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-800 bg-slate-950/60',
              iconBg: 'bg-cyan-500/15 text-cyan-300',
              badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            },
            purple: {
              border: isDone ? 'border-purple-500/40 bg-purple-500/5' : 'border-slate-800 bg-slate-950/60',
              iconBg: 'bg-purple-500/15 text-purple-300',
              badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            },
          }[m.color as 'indigo' | 'emerald' | 'cyan' | 'purple'];

          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${colorClasses.border}`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClasses.iconBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-[11px] text-white truncate">
                      {m.stepNum}. {m.title}
                    </span>
                    <span className="block text-[9px] text-slate-400 truncate">
                      {m.subtitle}
                    </span>
                  </div>
                </div>

                {isDone ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md font-bold text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md font-medium text-[9px] bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>معلق</span>
                  </span>
                )}
              </div>

              {/* DatePicker & Quick "اليوم" Action */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    value={m.date}
                    onChange={m.onChange}
                    placeholder="اختر التاريخ..."
                    className="text-xs py-1"
                  />
                </div>
                {!m.date ? (
                  <button
                    type="button"
                    onClick={() => m.onChange(todayStr)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-0.5 shrink-0"
                    title="تحديد تاريخ اليوم بنقرة واحدة"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>اليوم</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => m.onChange('')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[10px] font-bold border border-slate-700 hover:border-rose-500/40 transition shrink-0"
                    title="مسح التاريخ"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Note Footer */}
      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span>💡</span>
          <span>توثيق تاريخ خروج الشحنة وعودة الحاوية يحمي من غرامات التأخير والأرضيات (Demurrage & Detention).</span>
        </span>
      </div>
    </div>
  );
};
