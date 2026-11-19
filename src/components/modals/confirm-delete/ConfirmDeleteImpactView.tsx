'use client';

import React from 'react';
import { RotateCcw, FileText, AlertTriangle, CheckCircle2, Ban, Trash2 } from 'lucide-react';

export interface FinancialImpact {
  inflowChange?: string;
  outflowChange?: string;
  balanceChange?: string;
  partyChange?: string;
}

export interface ConfirmDeleteImpactViewProps {
  isCancelMode: boolean;
  financialImpact?: FinancialImpact;
  message?: string;
  hasPermission: boolean;
  permissionNote?: string;
  reason: string;
  onReasonChange: (r: string) => void;
  selectedPreset: string;
  onSelectPreset: (preset: string) => void;
  presetReasons: string[];
  onClose: () => void;
  onConfirmAction: () => void;
  onConfirmDelete?: () => void;
}

export const ConfirmDeleteImpactView: React.FC<ConfirmDeleteImpactViewProps> = ({
  isCancelMode,
  financialImpact,
  message,
  hasPermission,
  permissionNote,
  reason,
  onReasonChange,
  selectedPreset,
  onSelectPreset,
  presetReasons,
  onClose,
  onConfirmAction,
  onConfirmDelete,
}) => {
  return (
    <div className="space-y-4">
      {/* Financial Impact Breakdown Box */}
      {financialImpact && (
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>الأثر المالي المباشر للإلغاء على الحسابات:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {financialImpact.balanceChange && (
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">صندوق الشركة:</span>
                <strong className="text-amber-400 font-mono font-bold" dir="ltr">
                  {financialImpact.balanceChange}
                </strong>
              </div>
            )}
            {financialImpact.inflowChange && (
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">إجمالي الواردات:</span>
                <strong className="text-rose-400 font-mono font-bold" dir="ltr">
                  {financialImpact.inflowChange}
                </strong>
              </div>
            )}
            {financialImpact.outflowChange && (
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">إجمالي المصروفات:</span>
                <strong className="text-rose-400 font-mono font-bold" dir="ltr">
                  {financialImpact.outflowChange}
                </strong>
              </div>
            )}
            {financialImpact.partyChange && (
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">كشف حساب الطرف:</span>
                <strong className="text-slate-200 text-[10px] truncate max-w-[150px]">
                  {financialImpact.partyChange}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Description */}
      <p className="text-slate-300 leading-relaxed text-xs">
        {message ||
          (isCancelMode
            ? 'سيتم إلغاء السند دفترياً وتحييد مبلغه من رصيد الصندوق مع الاحتفاظ ببياناته ورقم تسلسله في السجل للأرشفة والرقابة.'
            : 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟')}
      </p>

      {/* Cancel Reason Requirement */}
      {isCancelMode && hasPermission && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>سبب الإلغاء الدفتري (إلزامي للتدقيق):</span>
            </label>
            <span className="text-[10px] text-rose-400 font-bold">* مطلوب</span>
          </div>

          {/* Preset quick buttons */}
          <div className="flex flex-wrap gap-1.5">
            {presetReasons.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                  selectedPreset === preset
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="اكتب سبب الإلغاء بالتفصيل..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-rose-500 focus:outline-none"
          />
        </div>
      )}

      {/* Permission Check Warning */}
      {!hasPermission ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {permissionNote || 'عذراً، هذا المستخدم لا يمتلك صلاحية الحذف والإلغاء المالي. يرجى مراجعة مدير النظام.'}
          </span>
        </div>
      ) : isCancelMode ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>المسار المحاسبي الآمن: يحافظ على تسلسل أرقام السندات ويمنع انقطاع القيود.</span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
          ⚠️ تحذير: هذه العملية نهائية وسيتم مسح السجل وتحديث الحسابات المرتبطة فوراً.
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
        <div>
          {/* Secondary Hard Delete option if admin explicitly wants it */}
          {isCancelMode && hasPermission && onConfirmDelete && (
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'تنبيه: الحذف النهائي يمسح السند بالكامل من قاعدة البيانات. هل تريد المتابعة بالحذف النهائي؟'
                  )
                ) {
                  onConfirmDelete();
                  onClose();
                }
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 underline transition cursor-pointer"
            >
              حذف نهائي بدلاً من الإلغاء الدفتري
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
          >
            إلغاء الأمر
          </button>

          {hasPermission && (
            <button
              type="button"
              disabled={isCancelMode && !reason.trim()}
              onClick={onConfirmAction}
              className={`px-5 py-2 font-bold rounded-xl transition shadow-lg text-xs flex items-center gap-1.5 cursor-pointer ${
                isCancelMode && !reason.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              {isCancelMode ? <Ban className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isCancelMode ? 'تأكيد الإلغاء الدفتري' : 'نعم، تأكيد الحذف'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
