'use client';

import React from 'react';
import { X, FileText, Coins, Truck, Paperclip } from 'lucide-react';
import { CompanyId, Currency, Transaction, COMPANIES } from '../../../types/customs';
import { ModalTab } from './useTransactionForm';

export interface TransactionModalHeaderProps {
  initialData?: Transaction | null;
  billNo: string;
  jobNumber?: string;
  companyId: CompanyId;
  activeTab: ModalTab;
  setActiveTab: (tab: ModalTab) => void;
  milestonesCount: number;
  totalAmount: number;
  totalAmountUSD: number;
  isMixedCurrency: boolean;
  currency: Currency;
  containersCount: number;
  hasAgencyDocument: boolean;
  onClose: () => void;
}

export const TransactionModalHeader: React.FC<TransactionModalHeaderProps> = ({
  initialData,
  billNo,
  jobNumber,
  companyId,
  activeTab,
  setActiveTab,
  milestonesCount,
  totalAmount,
  totalAmountUSD,
  isMixedCurrency,
  currency,
  containersCount,
  hasAgencyDocument,
  onClose,
}) => {
  return (
    <>
      {/* Top Banner */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base shadow-inner shrink-0">
            📑
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                {initialData ? 'تعديل بيانات البوليصة الكمركية' : 'تسجيل بوليصة كمركية جديدة'}
              </h2>
              <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700 shadow-xs">
                {billNo || 'جديد'}
              </span>
              {jobNumber && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs">
                  Job: {jobNumber}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-bold border shadow-xs ${COMPANIES[companyId]?.badgeClass}`}
              >
                {COMPANIES[companyId]?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              إدخال بيانات المعاملة، التخليص الكمركي، المراحل التشغيلية، الإنفاق المالي، وحسابات النقل
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="إغلاق النافذة"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="px-4 sm:px-5 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Tab 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'general'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. البيانات والمراحل</span>
            <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-slate-950 text-emerald-300 border border-slate-800">
              {milestonesCount}/4
            </span>
          </button>

          {/* Tab 2 */}
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs ring-1 ring-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>2. الإنفاق المالي</span>
            {(totalAmount > 0 || (totalAmountUSD || 0) > 0) && (
              <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-slate-950 text-amber-300 border border-slate-800">
                {isMixedCurrency ? 'مركب' : currency}
              </span>
            )}
          </button>

          {/* Tab 3 */}
          <button
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'transport'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. الحاويات والنقل</span>
            {containersCount > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800">
                {containersCount}
              </span>
            )}
          </button>

          {/* Tab 4 */}
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-xs ring-1 ring-purple-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5 text-purple-400" />
            <span>4. الوكالة والملاحظات</span>
            {hasAgencyDocument && (
              <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓
              </span>
            )}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <span>القسم:</span>
          <strong className="text-white font-bold">
            {activeTab === 'general'
              ? 'البيانات والمراحل التشغيلية'
              : activeTab === 'financial'
              ? 'الإنفاق المالي وحساب الزبون'
              : activeTab === 'transport'
              ? 'الحاويات والنقل البري'
              : 'ورقة الوكالة والملاحظات'}
          </strong>
        </div>
      </div>
    </>
  );
};
