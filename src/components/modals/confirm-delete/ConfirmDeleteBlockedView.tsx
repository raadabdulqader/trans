'use client';

import React from 'react';
import { ShieldAlert, Ban } from 'lucide-react';

export interface BlockedReasonDetail {
  label: string;
  value: string;
  subValue?: string;
  variant?: 'amber' | 'emerald' | 'cyan' | 'rose' | 'default';
}

export interface ConfirmDeleteBlockedViewProps {
  message?: string;
  activeFinancialsWarning?: {
    collected: number;
    advances: number;
    receiptsCount: number;
  };
  blockedReasonDetails?: BlockedReasonDetail[];
  accountingAdvice?: string[];
  onClose: () => void;
  onConvertToCancelledBill?: () => void;
}

export const ConfirmDeleteBlockedView: React.FC<ConfirmDeleteBlockedViewProps> = ({
  message,
  activeFinancialsWarning,
  blockedReasonDetails,
  accountingAdvice,
  onClose,
  onConvertToCancelledBill,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>حماية محاسبية مشددة: يمنع الحذف الفيزيائي من النظام</span>
        </div>
        <p className="text-amber-200/90 leading-relaxed">
          {message || 'وفقاً للأصول والمعايير المحاسبية المعتمدة، لا يمكن حذف هذا السجل لوجود قيود مالية أو تشغيلية نشطة مرتبطة بالصندوق أو بالذمم المالية.'}
        </p>

        {/* Bill active financials warning cards */}
        {activeFinancialsWarning && (
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-amber-500/20">
              <span className="text-slate-400 block text-[10px]">مقبوضات من الزبون:</span>
              <strong className="text-emerald-400 text-xs" dir="ltr">
                {new Intl.NumberFormat('ar-IQ').format(activeFinancialsWarning.collected)} د.ع
              </strong>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-xl border border-amber-500/20">
              <span className="text-slate-400 block text-[10px]">سلف منصرفة للمخلص:</span>
              <strong className="text-amber-400 text-xs" dir="ltr">
                {new Intl.NumberFormat('ar-IQ').format(activeFinancialsWarning.advances)} د.ع
              </strong>
            </div>
          </div>
        )}

        {/* Generic Blocked Reason Details (Carriers, Employees, Customers, etc.) */}
        {blockedReasonDetails && blockedReasonDetails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {blockedReasonDetails.map((item, idx) => {
              const variantClasses =
                item.variant === 'rose'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : item.variant === 'emerald'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : item.variant === 'cyan'
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                  : item.variant === 'amber'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300';

              return (
                <div key={idx} className={`p-2.5 rounded-xl border ${variantClasses}`}>
                  <span className="text-slate-400 block text-[10px]">{item.label}</span>
                  <strong className="text-xs font-bold font-mono block mt-0.5" dir="ltr">
                    {item.value}
                  </strong>
                  {item.subValue && (
                    <span className="text-[9px] text-slate-400 block mt-0.5">{item.subValue}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 space-y-2">
        <span className="font-bold text-white block text-xs">أفضل الممارسات المحاسبية البديلة:</span>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
          {accountingAdvice && accountingAdvice.length > 0 ? (
            accountingAdvice.map((adv, idx) => (
              <li key={idx} className="text-slate-300">
                {adv}
              </li>
            ))
          ) : (
            <>
              <li>
                <strong className="text-slate-200">الحظر الصارم للحذف الفيزيائي:</strong> لمنع اختلال توازن الخزينة وسجل التدقيق وضياع الذمم المالية للشركة.
              </li>
              <li>
                <strong className="text-slate-200">الإلغاء الدفتري (Void):</strong> في حال تسجيل حركة بالخطأ، يتم إلغاء السند دفترياً مع بيان السبب ليعود الأثر المالي فوراً للصندوق.
              </li>
              <li>
                <strong className="text-slate-200">الأرشفة التاريخية:</strong> الاحتفاظ بالسجلات يضمن سلامة ميزان المراجعة وكشوفات الحسابات الرسمية.
              </li>
            </>
          )}
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs cursor-pointer"
        >
          فهمت ذلك (إغلاق ومراجعة الحسابات)
        </button>
        {onConvertToCancelledBill && (
          <button
            type="button"
            onClick={() => {
              onConvertToCancelledBill();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>تحويل البوليصة إلى حالة ملغاة (المسار المحاسبي)</span>
          </button>
        )}
      </div>
    </div>
  );
};
