import React from 'react';
import { X, Ban } from 'lucide-react';
import { 
  Transaction, 
  Customer, 
  Employee, 
  Receipt, 
  Attachment, 
  COMPANIES, 
  TreasuryAttachment, 
  TreasuryTransaction, 
  BillTransportTrip 
} from '../../types/customs';
import { getBillFinancials } from '../../utils/storage';
import { DetailGeneralInfo } from '../transactions/detail/DetailGeneralInfo';
import { DetailFinancialSummary } from '../transactions/detail/DetailFinancialSummary';
import { DetailTransportTrips } from '../transactions/detail/DetailTransportTrips';
import { DetailDirectExpenses } from '../transactions/detail/DetailDirectExpenses';
import { DetailVouchersHistory } from '../transactions/detail/DetailVouchersHistory';
import { DetailModalFooter } from '../transactions/detail/DetailModalFooter';

export interface TransactionDetailModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  attachments: Attachment[];
  treasury?: TreasuryTransaction[];
  exchangeRate?: number;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onAttachAgencyToTransaction?: (tx: Transaction, file: File) => void;
  onClose: () => void;
  onOpenQuickAdvance: () => void;
  onOpenQuickPayment: () => void;
  onOpenQuickSettlement: (empId: string) => void;
  onOpenAttachments: () => void;
  onPrintBillFile: () => void;
  onPrintInvoice: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onUpdateOperationalDates?: (tx: Transaction, updates: {
    deliveryOrderDate?: string;
    clearanceDate?: string;
    exitDate?: string;
    containerReturnDate?: string;
  }) => void;
  onDeleteTrip?: (tx: Transaction, trip: BillTransportTrip) => void;
  onDeleteReceipt?: (receipt: Receipt) => void;
  onDeleteTransaction?: (tx: Transaction) => void;
  onOpenAddExpense?: (tx: Transaction) => void;
  onEditExpense?: (tx: TreasuryTransaction) => void;
  onDeleteExpense?: (tx: TreasuryTransaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  transaction,
  customers,
  employees,
  receipts,
  attachments,
  treasury,
  exchangeRate = 1500,
  onViewArchive,
  onAttachAgencyToTransaction,
  onClose,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenQuickSettlement,
  onOpenAttachments,
  onPrintBillFile,
  onPrintInvoice,
  onEditTransaction,
  onUpdateOperationalDates,
  onDeleteTrip,
  onDeleteReceipt,
  onDeleteTransaction,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  if (!isOpen || !transaction) return null;

  const customer = customers.find(c => c.id === transaction.customerId);
  const employee = employees.find(e => e.id === transaction.employeeId);
  const fin = getBillFinancials(transaction, receipts, exchangeRate, treasury);
  const billReceipts = receipts.filter(r => r.billId === transaction.id);

  const normalizeBillNo = (no?: string) => (no || '').trim().replace(/^#/, '').toLowerCase();
  const currentBillNo = normalizeBillNo(transaction.billNo);

  const carrierPaymentsOnBill = (treasury || []).filter(t => {
    if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
    const isCarrierPayment = t.subAccount === 'carriers' || !!t.carrierId || (t.category && (t.category.includes('نقل') || t.category.includes('ناقل')));
    if (!isCarrierPayment) return false;
    return normalizeBillNo(t.relatedBillNo) === currentBillNo;
  });

  const billDirectExpenses = (treasury || []).filter(t => {
    if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
    const isCarrierPayment = t.subAccount === 'carriers' || !!t.carrierId || (t.category && (t.category.includes('نقل') || t.category.includes('ناقل')));
    if (isCarrierPayment) return false;
    return normalizeBillNo(t.relatedBillNo) === currentBillNo;
  });

  const billAttachments = attachments.filter(a => a.entityType === 'transaction' && a.entityId === transaction.id);
  const comp = COMPANIES[transaction.companyId || 'naqaa_basra'] || COMPANIES.naqaa_basra;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl xl:max-w-7xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Compact & Pinned */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-sm font-bold shrink-0">
              📋
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] text-slate-400 font-medium">بوليصة:</span>
                <h2 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">{transaction.billNo}</h2>
                {transaction.jobNumber && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Job: {transaction.jobNumber}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${comp.badgeClass}`}>
                  🏢 {comp.shortName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  transaction.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : transaction.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : transaction.status === 'cancelled'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {transaction.status === 'completed' 
                    ? '✅ منجزة' 
                    : transaction.status === 'pending' 
                    ? '⏳ قيد التنفيذ' 
                    : transaction.status === 'cancelled'
                    ? '❌ ملغاة دفترياً'
                    : '⚠️ معلقة'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{comp.fullName} • صندوق مالي موحد</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns Layout */}
        <div className="p-3 sm:p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {transaction.status === 'cancelled' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-400">
                <Ban className="w-4 h-4 shrink-0" />
                <span>هذه البوليصة ملغاة دفترياً ومحاسبياً (VOID)</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                تم تحييد الأثر المالي للبوليصة وحماية الصندوق وفق المعالجة المحاسبية المعتمدة.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-rose-400/80 pt-1 border-t border-rose-500/20 font-mono">
                {transaction.cancelReason && <span>السبب: {transaction.cancelReason}</span>}
                {transaction.cancelledBy && <span>بواسطة: {transaction.cancelledBy}</span>}
                {transaction.cancelledAt && <span>التاريخ: {transaction.cancelledAt.split('T')[0]}</span>}
              </div>
            </div>
          )}

          {/* Grid: 2 Columns on Large Screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
            
            {/* COLUMN 1 (Right in RTL): Identification & Operational Timeline */}
            <DetailGeneralInfo
              transaction={transaction}
              customer={customer}
              employee={employee}
              onAttachAgencyToTransaction={onAttachAgencyToTransaction}
              onViewArchive={onViewArchive}
              onUpdateOperationalDates={onUpdateOperationalDates}
            />

            {/* COLUMN 2 (Left in RTL): Financial Summary & Operational Accounts */}
            <div className="space-y-3.5">
              
              {/* Financial Summary Cards */}
              <DetailFinancialSummary
                transaction={transaction}
                fin={fin}
                exchangeRate={exchangeRate}
                directExpensesCount={billDirectExpenses.length}
              />

              {/* Transport Trips & Carrier Details Section */}
              <DetailTransportTrips
                transaction={transaction}
                fin={fin}
                onEditTransaction={onEditTransaction}
                onViewArchive={onViewArchive}
                onDeleteTrip={onDeleteTrip}
              />

              {/* Bill Direct Operational Expenses Section */}
              <DetailDirectExpenses
                transaction={transaction}
                directExpenses={billDirectExpenses}
                fin={fin}
                onOpenAddExpense={onOpenAddExpense}
                onViewArchive={onViewArchive}
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
              />

              {/* Transactions Vouchers & Advances History */}
              <DetailVouchersHistory
                transaction={transaction}
                billReceipts={billReceipts}
                carrierPaymentsOnBill={carrierPaymentsOnBill}
                directExpensesCount={billDirectExpenses.length}
                openAdvances={fin.openAdvances}
                employee={employee}
                exchangeRate={exchangeRate}
                onOpenQuickSettlement={onOpenQuickSettlement}
                onDeleteReceipt={onDeleteReceipt}
                onViewArchive={onViewArchive}
              />

            </div>

          </div>

        </div>

        {/* Modal Footer with Actions */}
        <DetailModalFooter
          transaction={transaction}
          fin={fin}
          billAttachmentsCount={billAttachments.length}
          onOpenQuickAdvance={onOpenQuickAdvance}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenAddExpense={onOpenAddExpense}
          onOpenAttachments={onOpenAttachments}
          onEditTransaction={onEditTransaction}
          onPrintBillFile={onPrintBillFile}
          onPrintInvoice={onPrintInvoice}
          onDeleteTransaction={onDeleteTransaction}
        />

      </div>
    </div>
  );
};
