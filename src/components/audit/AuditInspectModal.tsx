import React from 'react';
import { ShieldCheck, X, CheckCircle2, Lock } from 'lucide-react';
import { AuditLogEntry } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { getActionBadge, getEntityBadge } from './AuditLogList';

interface AuditInspectModalProps {
  inspectEntry: AuditLogEntry | null;
  onClose: () => void;
}

export const AuditInspectModal: React.FC<AuditInspectModalProps> = ({
  inspectEntry,
  onClose,
}) => {
  if (!inspectEntry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">بطاقة التحقق والتدقيق الرقابي</h3>
              <span className="text-[11px] font-mono text-slate-400">معرف السجل: {inspectEntry.id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-400 block mb-1">نوع الحركة الرقابية</span>
              <div>{getActionBadge(inspectEntry.action)}</div>
            </div>
            <div className="text-left">
              <span className="text-slate-400 block mb-1">القسم المعني</span>
              <div>{getEntityBadge(inspectEntry.entityType)}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold block">العنوان والتوصيف</span>
            <div className="text-slate-100 font-bold text-sm bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {inspectEntry.title}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold block">البيان والتفاصيل المحاسبية</span>
            <div className="text-slate-200 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-sans">
              {inspectEntry.details}
            </div>
          </div>

          {inspectEntry.cancelReason && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-rose-400 font-bold block mb-1">سبب الإلغاء الدفتري المحاسبي:</span>
              <div className="text-rose-200 font-medium">{inspectEntry.cancelReason}</div>
            </div>
          )}

          {inspectEntry.financialImpact && (
            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-1">
              <span className="text-teal-400 font-bold block">الأثر المالي المترتب على الحركة:</span>
              {inspectEntry.financialImpact.amount !== undefined && (
                <div className="text-teal-200 font-mono">
                  المبلغ المالي: {formatCurrency(inspectEntry.financialImpact.amount)}
                </div>
              )}
              {inspectEntry.financialImpact.balanceChange && (
                <div className="text-teal-200 font-mono">
                  تأثير الصندوق: {inspectEntry.financialImpact.balanceChange}
                </div>
              )}
            </div>
          )}

          {/* Security Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">المستخدم المنفذ:</span>
              <span className="text-slate-200 font-bold">{inspectEntry.userName}</span>
              <span className="text-[11px] text-slate-400 block">({inspectEntry.userRole})</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">التوقيت الدقيق (ISO):</span>
              <span className="text-slate-200 font-mono text-[11px] block">
                {new Date(inspectEntry.timestamp).toLocaleString('ar-IQ')}
              </span>
              <span className="text-emerald-400 text-[10px] flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>سجل موثق ومختوم رقمياً</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>غير قابل للتعديل أو الحذف (Tamper-Proof)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
