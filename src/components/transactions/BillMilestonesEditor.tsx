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
      title: 'أمر تسليم (D/O)',
      date: deliveryOrderDate,
      onChange: onDeliveryOrderDateChange,
      icon: FileCheck2,
      color: 'indigo',
      stepNum: 1,
    },
    {
      id: 'clearance',
      title: 'التخليص الكمركي',
      date: clearanceDate,
      onChange: onClearanceDateChange,
      icon: ShieldCheck,
      color: 'emerald',
      stepNum: 2,
    },
    {
      id: 'exit',
      title: 'خروج الشحنة (Gate-Out)',
      date: exitDate,
      onChange: onExitDateChange,
      icon: Truck,
      color: 'cyan',
      stepNum: 3,
    },
    {
      id: 'return',
      title: 'عودة الحاوية الفارغة',
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
    if (completedCount === 3) return '🔄 بانتظار إعادة الحاويات';
    if (completedCount === 2) return '🚛 بانتظار خروج الشحنة';
    if (completedCount === 1) return '🏛️ بانتظار إنجاز التخليص';
    return '⏳ بانتظار إصدار أمر التسليم';
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

  const destinationPresets = ['بغداد', 'البصرة', 'أربيل', 'السليمانية', 'النجف'];
  const freeTimePresets = [7, 10, 14, 21];

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm space-y-2.5">
      {/* Compact Header with Progress Tracker */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CalendarClock className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>المراحل التشغيلية للشحنة</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-500/30">
              {completedCount}/4
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 font-semibold">
            {getStageTitle()}
          </span>
          <span className="text-[10px] font-black text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full bg-gradient-to-l from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Columns Milestone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {milestones.map((m) => {
          const Icon = m.icon;
          const isDone = !!m.date;

          const colorClasses = {
            indigo: {
              border: isDone ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
            },
            emerald: {
              border: isDone ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
            },
            cyan: {
              border: isDone ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
            },
            purple: {
              border: isDone ? 'border-purple-500/40 bg-purple-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
              iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
            },
          }[m.color as 'indigo' | 'emerald' | 'cyan' | 'purple'];

          return (
            <div
              key={m.id}
              className={`p-2 rounded-xl border transition-all space-y-1.5 ${colorClasses.border}`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${colorClasses.iconBg}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[11px] text-white truncate">
                    {m.stepNum}. {m.title}
                  </span>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </div>

              {/* DatePicker & Quick "اليوم" Action */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    size="sm"
                    value={m.date}
                    onChange={m.onChange}
                    placeholder="التاريخ..."
                  />
                </div>
                {!m.date ? (
                  <button
                    type="button"
                    onClick={() => m.onChange(todayStr)}
                    className="h-8 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-0.5 shrink-0"
                    title="تحديد تاريخ اليوم"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>اليوم</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => m.onChange('')}
                    className="h-8 px-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-bold border border-slate-700 hover:border-rose-500/40 transition shrink-0"
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

      {/* Free Time & Container Destination Operations Strip */}
      {(onFreeTimeDaysChange || onContainerDestinationChange) && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Free Time */}
            {onFreeTimeDaysChange && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="text-slate-200 font-bold flex items-center gap-1">
                    <Hourglass className="w-3 h-3 text-amber-400" />
                    <span>فترة السماح (Free Time):</span>
                  </label>
                  {deadlineDateStr && (
                    <span className="font-mono text-[10px] text-amber-300 font-bold">
                      أقصى موعد: {deadlineDateStr}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={freeTimeDays}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                        onFreeTimeDaysChange(val);
                      }}
                      placeholder="14"
                      className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2 text-amber-300 font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 pointer-events-none">
                      يوم
                    </span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex items-center gap-1">
                    {freeTimePresets.map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => onFreeTimeDaysChange(days)}
                        className={`h-8 px-2 rounded-lg text-[11px] font-mono font-bold transition border ${
                          Number(freeTimeDays) === days
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                        }`}
                        title={`تحديد ${days} يوماً`}
                      >
                        {days}ي
                      </button>
                    ))}
                  </div>

                  {/* Quick status badge if calculated */}
                  {!containerReturnDate && daysRemaining !== null && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border mr-auto truncate ${
                      isOverdue 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                        : daysRemaining <= 3 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isOverdue ? `متأخر ${Math.abs(daysRemaining)}ي!` : `متبقي ${daysRemaining}ي`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Container Destination */}
            {onContainerDestinationChange && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="text-slate-200 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>وجهة الحاوية / التفريغ:</span>
                  </label>
                  {containerDestination && (
                    <button
                      type="button"
                      onClick={() => onContainerDestinationChange('')}
                      className="text-[10px] text-slate-400 hover:text-rose-400 font-bold"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={containerDestination}
                    onChange={(e) => onContainerDestinationChange(e.target.value)}
                    placeholder="مثال: بغداد، البصرة..."
                    className="flex-1 h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-slate-100 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
                  />

                  {/* Destination presets */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    {destinationPresets.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => onContainerDestinationChange(city)}
                        className={`h-8 px-2 rounded-lg text-[10px] font-bold transition border ${
                          containerDestination === city
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operational Note 1-liner */}
      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-1 pt-0.5">
        <span className="text-amber-400">💡</span>
        <span>توثيق تواريخ خروج وعودة الحاويات وفترة السماح يحمي من الغرامات والأرضيات الملاحية.</span>
      </div>
    </div>
  );
};
