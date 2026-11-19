'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, COMPANIES, CompanyId } from '../../types/customs';
import { getBillFinancials } from '../../utils/storage';
import { PrintLetterhead } from './print/PrintLetterhead';
import { PrintInvoiceTemplate } from './print/PrintInvoiceTemplate';
import { PrintBillDossierTemplate } from './print/PrintBillDossierTemplate';
import { PrintReceiptVoucherTemplate } from './print/PrintReceiptVoucherTemplate';

export interface PrintModalProps {
  isOpen: boolean;
  type: 'bill' | 'invoice' | 'voucher';
  transaction?: Transaction | null;
  receipt?: Receipt | null;
  customer?: Customer | null;
  employee?: Employee | null;
  receipts: Receipt[];
  treasury?: any[];
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  type,
  transaction,
  receipt,
  customer,
  employee,
  receipts,
  treasury = [],
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyKey: CompanyId = transaction?.companyId || receipt?.companyId || 'naqaa_basra';
  const comp = COMPANIES[companyKey] || COMPANIES.naqaa_basra;

  const fin = transaction ? getBillFinancials(transaction, receipts, undefined, treasury) : null;
  const billReceipts = transaction ? receipts.filter(r => r.billId === transaction.id) : [];

  const billExpenses = transaction ? (treasury || []).filter(t => {
    if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
    const isCarrierPayment = t.subAccount === 'carriers' || !!t.carrierId || (t.category && (t.category.includes('نقل') || t.category.includes('ناقل')));
    if (isCarrierPayment) return false;
    return t.relatedBillNo && t.relatedBillNo.trim().toLowerCase() === transaction.billNo.trim().toLowerCase();
  }) : [];

  const todayStr = new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const docRef = transaction ? transaction.billNo : receipt ? receipt.receiptNo : 'DOC-01';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Header Controls */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {type === 'invoice' ? 'معاينة فاتورة العميل' : type === 'bill' ? 'معاينة ملف البوليصة والمعاملة' : 'معاينة سند مالي'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${comp.badgeClass}`}>
                {comp.name}
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

        {/* Printable Area with Authentic Formal Document Design */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[75vh] overflow-y-auto" id="printableArea" dir="rtl">
          <PrintLetterhead comp={comp} todayStr={todayStr} docRef={docRef} />

          {type === 'invoice' && transaction && fin && (
            <PrintInvoiceTemplate
              transaction={transaction}
              fin={fin}
              customer={customer}
              employee={employee}
            />
          )}

          {type === 'bill' && transaction && fin && (
            <PrintBillDossierTemplate
              transaction={transaction}
              fin={fin}
              customer={customer}
              employee={employee}
              billReceipts={billReceipts}
              billExpenses={billExpenses}
            />
          )}

          {type === 'voucher' && receipt && (
            <PrintReceiptVoucherTemplate
              receipt={receipt}
              transaction={transaction}
              customer={customer}
              employee={employee}
            />
          )}
        </div>
      </div>
    </div>
  );
};
