'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { TreasuryTransaction, COMPANIES } from '../../types/customs';
import { TreasuryFinancialSummary } from '../../utils/storage';
import { PrintTreasuryLetterhead } from './print/PrintTreasuryLetterhead';
import { PrintTreasuryVoucherTemplate } from './print/PrintTreasuryVoucherTemplate';
import { PrintTreasuryStatementTemplate } from './print/PrintTreasuryStatementTemplate';

export interface PrintTreasuryModalProps {
  isOpen: boolean;
  mode: 'voucher' | 'statement';
  transaction?: TreasuryTransaction | null;
  transactions?: TreasuryTransaction[];
  summary?: TreasuryFinancialSummary;
  onClose: () => void;
}

export const PrintTreasuryModal: React.FC<PrintTreasuryModalProps> = ({
  isOpen,
  mode,
  transaction,
  transactions = [],
  summary,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const comp = (transaction?.companyId && transaction.companyId !== 'shared')
    ? COMPANIES[transaction.companyId]
    : null;

  const docRef = mode === 'voucher' ? transaction?.voucherNo : 'TREASURY-REPORT';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Controls Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'voucher' ? 'معاينة سند الصندوق الرسمي للطباعة' : 'معاينة كشف حركة صندوق الشركة للطباعة'}
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {comp ? comp.name : 'رأس المال وصندوق الشركة المشترك (نقاء البصرة & صوت الجنوب)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[75vh] overflow-y-auto" id="printableArea" dir="rtl">
          <PrintTreasuryLetterhead comp={comp} todayStr={todayStr} docRef={docRef} />

          {mode === 'voucher' && transaction && (
            <PrintTreasuryVoucherTemplate transaction={transaction} />
          )}

          {mode === 'statement' && (
            <PrintTreasuryStatementTemplate summary={summary} transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  );
};
