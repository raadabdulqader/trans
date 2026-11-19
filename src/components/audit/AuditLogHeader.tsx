import React from 'react';
import { ShieldCheck, Lock, Printer, Download, FileText, Ban, Coins } from 'lucide-react';

interface AuditLogHeaderProps {
  stats: {
    total: number;
    voidCount: number;
    financialCount: number;
    securityCount: number;
  };
  onOpenPrintReport: () => void;
  onExportCSV: () => void;
}

export const AuditLogHeader: React.FC<AuditLogHeaderProps> = ({
  stats,
  onOpenPrintReport,
  onExportCSV,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                سجل التدقيق والرقابة المحاسبية
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Audit Log & Compliance
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              سجل إلكتروني رقابي غير قابل للتعديل يوثق جميع العمليات المالية، الإلغاءات الدفترية، حركة الصندوق، وتعديل صلاحيات المستخدمين بدقة متناهية.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>سجل محمي ومقفل محاسبياً (Immutable)</span>
          </div>

          <button
            onClick={onOpenPrintReport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold rounded-xl transition text-xs flex items-center gap-2 shadow-sm"
            title="طباعة تقرير التدقيق الرقابي"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>طباعة كشف التدقيق</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            title="تصدير السجل بصيغة CSV للمدقق الخارجي"
          >
            <Download className="w-4 h-4" />
            <span>تصدير إلى CSV</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>إجمالي العمليات الموثقة</span>
          </div>
          <div className="text-xl font-black text-white font-mono">{stats.total}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          <div className="text-xs text-rose-400 mb-1 flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span>العمليات الملغاة دفترياً</span>
          </div>
          <div className="text-xl font-black text-rose-300 font-mono">{stats.voidCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>القيود المالية وحركات الخزينة</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">{stats.financialCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs text-amber-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>عمليات الأمان والمستخدمين</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">{stats.securityCount}</div>
        </div>
      </div>
    </div>
  );
};
