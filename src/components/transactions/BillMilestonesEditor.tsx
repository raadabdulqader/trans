import React from 'react';
import { 
  CalendarClock, 
  FileCheck2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Hourglass,
  AlertTriangle
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
  freeTimeDays?: number | '';
  onFreeTimeDaysChange?: (days: number | '') => void;
  containerDestination?: string;
  onContainerDestinationChange?: (destination: string) => void;
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
  freeTimeDays = '',
  onFreeTimeDaysChange,
  containerDestination = '',
  onContainerDestinationChange,
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
        const today = new Date(todayStr);
        const diffMs = deadD.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;
        isOverdue = diffDays < 0;
      }
    } catch {
      // ignore date calculation errors
    }
  }

  const destinationPresets = ['بغداد', 'البصرة', 'أربيل', 'السليمانية', 'كركوك', 'النجف', 'كربلاء'];
  const freeTimePresets = [7, 10, 14, 21, 28];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md space-y-4">
      {/* Header with Progress Tracker */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>المسار الزمني والمراحل التشغيلية للشحنة</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-500/40">
                {completedCount}/4 مراحل مكتملة
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              توثيق المواعيد الحيوية من استلام إذن التسليم حتى تفريغ وإعادة الحاويات
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-emerald-400 block font-mono">
            {progressPercent}% إنجاز المسار
          </span>
          <span className="text-[11px] text-slate-300 font-semibold">
            {getStageTitle()}
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300 shadow-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2x2 Grid of Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {milestones.map((m) => {
          const Icon = m.icon;
          const isDone = !!m.date;

          const colorClasses = {
            indigo: {
              border: isDone ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
              badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            },
            emerald: {
              border: isDone ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
              badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            },
            cyan: {
              border: isDone ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
              badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            },
            purple: {
              border: isDone ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
              badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            },
          }[m.color as 'indigo' | 'emerald' | 'cyan' | 'purple'];

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${colorClasses.border}`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorClasses.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-xs text-white truncate">
                      {m.stepNum}. {m.title}
                    </span>
                    <span className="block text-[10px] text-slate-300 font-medium truncate mt-0.5">
                      {m.subtitle}
                    </span>
                  </div>
                </div>

                {isDone ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold text-[10px] bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>معلق</span>
                  </span>
                )}
              </div>

              {/* DatePicker & Quick "اليوم" Action */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    value={m.date}
                    onChange={m.onChange}
                    placeholder="اختر التاريخ..."
                  />
                </div>
                {!m.date ? (
                  <button
                    type="button"
                    onClick={() => m.onChange(todayStr)}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition flex items-center gap-1 shrink-0"
                    title="تحديد تاريخ اليوم بنقرة واحدة"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>اليوم</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => m.onChange('')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-bold border border-slate-700 hover:border-rose-500/40 transition shrink-0"
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

      {/* Free Time & Container Destination Operations Card */}
      {(onFreeTimeDaysChange || onContainerDestinationChange) && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-750 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-amber-400" />
              <span>محددات الحاوية وفترة السماح (Free Time & Container Destination)</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              حماية من غرامات التأخير والأرضيات
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Time (فترة السماح بالأيام) */}
            {onFreeTimeDaysChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                    <span>فترة السماح للحاوية (Free Time):</span>
                  </label>
                  {numFreeDays > 0 && (
                    <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                      {numFreeDays} يوم
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={freeTimeDays}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                        onFreeTimeDaysChange(val);
                      }}
                      placeholder="مثال: 14"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-amber-300 font-mono text-sm font-bold focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      أيام
                    </span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex items-center gap-1">
                    {freeTimePresets.map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => onFreeTimeDaysChange(days)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                          Number(freeTimeDays) === days
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs ring-1 ring-amber-500/40'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                        title={`تحديد ${days} يوماً`}
                      >
                        {days}ي
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiry / Countdown status */}
                {deadlineDateStr && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                    containerReturnDate
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : isOverdue
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : daysRemaining !== null && daysRemaining <= 3
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  }`}>
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-300 font-semibold">الموعد الأقصى:</span>
                      <strong className="underline text-white font-bold">{deadlineDateStr}</strong>
                    </span>
                    {!containerReturnDate && daysRemaining !== null && (
                      <span className="font-bold">
                        {isOverdue ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            متأخر بـ {Math.abs(daysRemaining)} يوم!
                          </span>
                        ) : daysRemaining === 0 ? (
                          '⚠️ ينتهي اليوم!'
                        ) : (
                          `متبقي ${daysRemaining} يوم سماح`
                        )}
                      </span>
                    )}
                    {containerReturnDate && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تمت الإعادة بنجاح
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Container Destination (وجهة الحاوية / التسليم) */}
            {onContainerDestinationChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>وجهة الحاوية / التسليم (Container Destination):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">موقع المستودع أو المدينة</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={containerDestination}
                    onChange={(e) => onContainerDestinationChange(e.target.value)}
                    placeholder="مثال: بغداد - مخازن جميلة، البصرة - الشعيبة، أربيل..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Destination presets */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {destinationPresets.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => onContainerDestinationChange(city)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition border ${
                        containerDestination === city
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                  {containerDestination && (
                    <button
                      type="button"
                      onClick={() => onContainerDestinationChange('')}
                      className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 font-bold transition"
                      title="مسح الوجهة"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operational Note Footer */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-between text-xs text-slate-300 font-medium">
        <span className="flex items-center gap-2">
          <span className="text-amber-400 text-base">💡</span>
          <span>توثيق تواريخ خروج وعودة الحاويات وفترة السماح يحمي الشركة والزبون من الغرامات والأرضيات الملاحية.</span>
        </span>
      </div>
    </div>
  );
};
