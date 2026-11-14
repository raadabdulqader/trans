import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Ban, 
  FileText, 
  ShieldAlert, 
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';

export interface FinancialImpact {
  inflowChange?: string;
  outflowChange?: string;
  balanceChange?: string;
  partyChange?: string;
}

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  mode?: 'cancel' | 'delete' | 'blocked';
  title?: string;
  itemName?: string;
  message?: string;
  financialImpact?: FinancialImpact;
  hasPermission?: boolean;
  permissionNote?: string;
  activeFinancialsWarning?: {
    collected: number;
    advances: number;
    receiptsCount: number;
  };
  onClose: () => void;
  onConfirmCancel?: (reason: string) => void;
  onConfirmDelete?: () => void;
  onConvertToCancelledBill?: () => void;
}

const PRESET_CANCEL_REASONS = [
  'خطأ في تسجيل المبلغ',
  'إرجاع دفعة للزبون نقداً',
  'تكرار إدخال السند',
  'إلغاء المعاملة الكمركية',
  'تعديل في الاتفاق المالي',
  'سند تجريبي / قيد خاطئ',
];

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  mode = 'delete',
  title,
  itemName,
  message,
  financialImpact,
  hasPermission = true,
  permissionNote,
  activeFinancialsWarning,
  onClose,
  onConfirmCancel,
  onConfirmDelete,
  onConvertToCancelledBill,
}) => {
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setSelectedPreset('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCancelMode = mode === 'cancel';
  const isBlockedMode = mode === 'blocked';

  const defaultTitle = isBlockedMode
    ? 'إجراء غير مسموح به محاسبياً'
    : isCancelMode
    ? 'إلغاء السند دفترياً (معالجة محاسبية)'
    : 'تأكيد الحذف';

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setReason(preset);
  };

  const handleConfirmAction = () => {
    if (isCancelMode) {
      const finalReason = reason.trim() || selectedPreset || 'إلغاء دفتري بناءً على تدقيق الحسابات';
      if (onConfirmCancel) {
        onConfirmCancel(finalReason);
      }
    } else if (onConfirmDelete) {
      onConfirmDelete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between ${
          isBlockedMode ? 'bg-amber-500/10' : isCancelMode ? 'bg-rose-500/10' : 'bg-slate-950/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              isBlockedMode
                ? 'bg-amber-500/20 text-amber-400'
                : isCancelMode
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isBlockedMode ? (
                <Lock className="w-5 h-5" />
              ) : isCancelMode ? (
                <Ban className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {title || defaultTitle}
              </h2>
              <span className="text-[10px] text-slate-400">
                {isCancelMode ? 'تطبيق معايير التدقيق المحاسبي المعمول بها في الشركات' : 'الرقابة المالية والمحاسبية'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Target Item Name Banner */}
          {itemName && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 font-semibold font-mono flex items-center justify-between">
              <span className="truncate">{itemName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isBlockedMode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {isBlockedMode ? 'مرتبط بحركات مالية' : isCancelMode ? 'إلغاء قيد' : 'حذف'}
              </span>
            </div>
          )}

          {/* Blocked Mode View (When Bill has active money attached) */}
          {isBlockedMode && activeFinancialsWarning ? (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>لا يمكن حذف هذه البوليصة فيزيائياً من النظام</span>
                </div>
                <p>
                  وفقاً للأصول المحاسبية المعمول بها في الشركات، لا يمكن مسح بوليصة دخلت أموالها أو سلفها في صندوق الشركة لوجود التزامات مالية نشطة:
                </p>
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
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 space-y-2">
                <span className="font-bold text-white block">الحلول المحاسبية النظامية:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-slate-200">تحويل البوليصة إلى «ملغاة»:</strong> يحفظ تاريخ المعاملة وأرشيفها ويفصلها عن المعاملات الجارية دون تخريب موازنة الصندوق.
                  </li>
                  <li>
                    <strong className="text-slate-200">إلغاء السندات المالية أولاً:</strong> إذا كان تسجيل الأموال تم بالخطأ، قم بإلغاء وصولات الدفع والسلف المرتبطة بها أولاً.
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
                >
                  إغلاق
                </button>
                {onConvertToCancelledBill && (
                  <button
                    type="button"
                    onClick={() => {
                      onConvertToCancelledBill();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>تحويل البوليصة إلى حالة ملغاة (المسار المحاسبي)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Cancel Mode or Standard Delete */
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
                        <strong className="text-amber-400 font-mono font-bold" dir="ltr">{financialImpact.balanceChange}</strong>
                      </div>
                    )}
                    {financialImpact.inflowChange && (
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">إجمالي الواردات:</span>
                        <strong className="text-rose-400 font-mono font-bold" dir="ltr">{financialImpact.inflowChange}</strong>
                      </div>
                    )}
                    {financialImpact.outflowChange && (
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">إجمالي المصروفات:</span>
                        <strong className="text-rose-400 font-mono font-bold" dir="ltr">{financialImpact.outflowChange}</strong>
                      </div>
                    )}
                    {financialImpact.partyChange && (
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">كشف حساب الطرف:</span>
                        <strong className="text-slate-200 text-[10px] truncate max-w-[150px]">{financialImpact.partyChange}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message Description */}
              <p className="text-slate-300 leading-relaxed text-xs">
                {message || (isCancelMode 
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
                    {PRESET_CANCEL_REASONS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${
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
                    onChange={(e) => setReason(e.target.value)}
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
                        if (confirm('تنبيه: الحذف النهائي يمسح السند بالكامل من قاعدة البيانات. هل تريد المتابعة بالحذف النهائي؟')) {
                          onConfirmDelete();
                          onClose();
                        }
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 underline transition"
                    >
                      حذف نهائي بدلاً من الإلغاء الدفتري
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
                  >
                    إلغاء الأمر
                  </button>
                  
                  {hasPermission && (
                    <button
                      type="button"
                      disabled={isCancelMode && !reason.trim()}
                      onClick={handleConfirmAction}
                      className={`px-5 py-2 font-bold rounded-xl transition shadow-lg text-xs flex items-center gap-1.5 ${
                        isCancelMode && !reason.trim()
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                          : isCancelMode
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
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
          )}

        </div>
      </div>
    </div>
  );
};
