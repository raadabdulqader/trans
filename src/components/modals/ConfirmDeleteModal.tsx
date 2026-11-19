import React, { useState, useEffect } from 'react';
import { X, Ban, Trash2, Lock } from 'lucide-react';
import {
  ConfirmDeleteBlockedView,
  BlockedReasonDetail,
} from './confirm-delete/ConfirmDeleteBlockedView';
import {
  ConfirmDeleteImpactView,
  FinancialImpact,
} from './confirm-delete/ConfirmDeleteImpactView';

export type { FinancialImpact, BlockedReasonDetail };

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
  blockedReasonDetails?: BlockedReasonDetail[];
  accountingAdvice?: string[];
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
  'تعديل في الإنفاق المالي',
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
  blockedReasonDetails,
  accountingAdvice,
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
        <div
          className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between ${
            isBlockedMode
              ? 'bg-amber-500/10'
              : isCancelMode
              ? 'bg-rose-500/10'
              : 'bg-slate-950/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isBlockedMode
                  ? 'bg-amber-500/20 text-amber-400'
                  : isCancelMode
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
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
                {isCancelMode
                  ? 'تطبيق معايير التدقيق المحاسبي المعمول بها في الشركات'
                  : 'الرقابة المالية والمحاسبية'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isBlockedMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : isCancelMode
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {isBlockedMode ? 'مرتبط بحركات مالية' : isCancelMode ? 'إلغاء قيد' : 'حذف'}
              </span>
            </div>
          )}

          {isBlockedMode ? (
            <ConfirmDeleteBlockedView
              message={message}
              activeFinancialsWarning={activeFinancialsWarning}
              blockedReasonDetails={blockedReasonDetails}
              accountingAdvice={accountingAdvice}
              onClose={onClose}
              onConvertToCancelledBill={onConvertToCancelledBill}
            />
          ) : (
            <ConfirmDeleteImpactView
              isCancelMode={isCancelMode}
              financialImpact={financialImpact}
              message={message}
              hasPermission={hasPermission}
              permissionNote={permissionNote}
              reason={reason}
              onReasonChange={setReason}
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              presetReasons={PRESET_CANCEL_REASONS}
              onClose={onClose}
              onConfirmAction={handleConfirmAction}
              onConfirmDelete={onConfirmDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};
