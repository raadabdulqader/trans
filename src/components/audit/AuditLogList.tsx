import React from 'react';
import { 
  ShieldCheck, 
  Ban, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Printer, 
  AlertTriangle, 
  Coins, 
  Eye 
} from 'lucide-react';
import { AuditLogEntry, AuditAction, AuditEntityType } from '../../types/customs';
import { formatRelativeTime } from '../../utils/storage';

export const getActionBadge = (action: AuditAction) => {
  switch (action) {
    case 'void':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Ban className="w-3.5 h-3.5" />
          <span>إلغاء دفتري (Void)</span>
        </span>
      );
    case 'create':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>إضافة وقيد جديد</span>
        </span>
      );
    case 'update':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <Edit3 className="w-3.5 h-3.5" />
          <span>تعديل بيانات</span>
        </span>
      );
    case 'delete':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/20 text-red-300 border border-red-600/40">
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف إداري</span>
        </span>
      );
    case 'print':
    case 'export':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة وتصدير</span>
        </span>
      );
    case 'auth':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>أمان وصلاحيات</span>
        </span>
      );
  }
};

export const getEntityBadge = (entity: AuditEntityType) => {
  switch (entity) {
    case 'bill':
      return <span className="text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">بوليصة كمركية</span>;
    case 'receipt':
      return <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-mono">سند / وصل</span>;
    case 'treasury':
      return <span className="text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded text-[11px] font-mono">صندوق الشركة</span>;
    case 'account_expense':
      return <span className="text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-mono">مصروفات / رواتب</span>;
    case 'customer':
      return <span className="text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-mono">عميل / زبون</span>;
    case 'employee':
      return <span className="text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded text-[11px] font-mono">موظف / مخلص</span>;
    case 'user':
      return <span className="text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-mono">مستخدم ونظام</span>;
    default:
      return <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">النظام العام</span>;
  }
};

interface AuditLogListProps {
  filteredLogs: AuditLogEntry[];
  onInspect: (log: AuditLogEntry) => void;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
  filteredLogs,
  onInspect,
}) => {
  if (filteredLogs.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-12 text-center text-slate-400">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">لا توجد سجلات تدقيق تطابق معايير البحث</h3>
        <p className="text-xs text-slate-500 mt-1">جرّب تغيير فلاتر التاريخ، أو نوع العملية، أو تفريغ خانة البحث.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="divide-y divide-slate-800/80">
        {filteredLogs.map((log) => {
          const isVoid = log.action === 'void';
          return (
            <div 
              key={log.id} 
              className={`p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isVoid ? 'bg-rose-950/10' : ''
              }`}
            >
              {/* Left block: Icon, User info, and Content */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="pt-0.5">
                  {getActionBadge(log.action)}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {log.title}
                    </span>
                    {log.entityReference && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                        {log.entityReference}
                      </span>
                    )}
                    {getEntityBadge(log.entityType)}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed break-words">
                    {log.details}
                  </p>

                  {/* Cancel Reason Box if voided */}
                  {isVoid && log.cancelReason && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>سبب الإلغاء:</span>
                      <span className="font-bold text-rose-200">{log.cancelReason}</span>
                    </div>
                  )}

                  {/* Financial Impact if any */}
                  {log.financialImpact?.balanceChange && (
                    <div className="text-[11px] font-mono text-teal-300 flex items-center gap-1.5 mt-1">
                      <Coins className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>الأثر المالي: {log.financialImpact.balanceChange}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right block: User, Timestamp, Inspect Action */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold text-slate-200">{log.userName}</span>
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                      👤
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-end mt-0.5">
                    <span className="font-mono">{formatRelativeTime(log.timestamp)}</span>
                    <span>•</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <button
                  onClick={() => onInspect(log)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition text-xs flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
                  title="معاينة تفاصيل سجل التدقيق"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فحص</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
