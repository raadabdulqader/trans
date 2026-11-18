import React from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  Boxes, 
  Coins, 
  Wallet, 
  Paperclip, 
  Printer, 
  CheckCheck,
  AlertCircle,
  Trash2,
  Ban,
  FileCheck2,
  Upload,
  Eye,
  CheckCircle2,
  Plus,
  Pencil,
  Truck,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, Attachment, COMPANIES, TreasuryAttachment, TreasuryTransaction, BillTransportTrip } from '../../types/customs';
import { formatCurrency, getBillFinancials, getReceiptBreakdownForBill } from '../../utils/storage';
import { Badge } from '../ui/badge';
import { CUSTOMS_PRESET_NOTES } from '../../utils/customsNotes';
import { BillMilestonesTimeline } from '../transactions/BillMilestonesTimeline';

interface TransactionDetailModalProps {
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
  const agencyInputRef = React.useRef<HTMLInputElement | null>(null);
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
            <div className="space-y-3.5">
              
              {/* General Information Card (2x2 Grid) */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">الزبون (الشركة):</span>
                    <strong className="text-white text-xs block truncate" title={customer?.name}>{customer?.name || '—'}</strong>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{customer?.phone || '—'}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">المخلص الكمركي المسؤول:</span>
                    <strong className="text-white text-xs block truncate" title={employee?.name}>{employee?.name || '—'}</strong>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{employee?.phone || '—'}</div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">تواريخ المعاملة:</span>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">الإنشاء:</span>
                      <strong className="text-emerald-400 font-mono text-[11px]">{transaction.createdAt || transaction.date || '—'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between mt-0.5">
                      <span className="text-slate-400 text-[10px]">الاستلام:</span>
                      <strong className="text-white font-mono text-[11px]">{transaction.date || '—'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      نوع البضاعة: <span className="text-slate-200 font-semibold">{transaction.goodsType || 'عامة'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">محددات الشحنة والحاوية:</span>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">Job No:</span>
                      <strong className="text-cyan-300 font-mono text-[11px]">{transaction.jobNumber || '—'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between mt-0.5">
                      <span className="text-slate-400 text-[10px]">فترة السماح:</span>
                      <strong className="text-amber-400 font-mono text-[11px]">{transaction.freeTimeDays ? `${transaction.freeTimeDays} يوم` : '—'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate" title={transaction.containerDestination}>
                      الوجهة: <span className="text-slate-200 font-semibold">{transaction.containerDestination || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Milestones Timeline */}
              <BillMilestonesTimeline
                billNo={transaction.billNo}
                jobNumber={transaction.jobNumber}
                deliveryOrderDate={transaction.deliveryOrderDate}
                clearanceDate={transaction.clearanceDate}
                exitDate={transaction.exitDate}
                containerReturnDate={transaction.containerReturnDate}
                containersCount={transaction.containers?.length || 0}
                freeTimeDays={transaction.freeTimeDays}
                containerDestination={transaction.containerDestination}
                onUpdateDates={onUpdateOperationalDates ? (updates) => onUpdateOperationalDates(transaction, updates) : undefined}
              />

              {/* Containers Section */}
              <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                    <span>أرقام الحاويات المسجلة ({transaction.containers.length}):</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    {transaction.containerDestination && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                        📍 {transaction.containerDestination}
                      </span>
                    )}
                    {transaction.freeTimeDays && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-800 font-mono">
                        ⏳ سماح {transaction.freeTimeDays} يوم
                      </span>
                    )}
                  </div>
                </div>

                {transaction.containers.length === 0 ? (
                  <div className="py-2.5 px-3 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-400 text-center text-[11px]">
                    لا توجد حاويات مضافة لهذه البوليصة
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {transaction.containers.map((cont, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono font-bold text-cyan-300 text-xs shadow-xs"
                      >
                        📦 {cont}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Agency Document Archiving Section */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2.5">
                <input
                  ref={agencyInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onAttachAgencyToTransaction) {
                      onAttachAgencyToTransaction(transaction, file);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>ورقة الوكالة للبوليصة</span>
                      {transaction.agencyDocument ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>مؤرشفة</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                          غير مؤرشفة
                        </span>
                      )}
                    </div>
                    {transaction.agencyDocument ? (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {transaction.agencyDocument.name} • {(transaction.agencyDocument.size / 1024).toFixed(1)} KB
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        أرشفة ورقة الوكالة للرجوع إليها
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {transaction.agencyDocument && onViewArchive && (
                    <button
                      type="button"
                      onClick={() => onViewArchive(transaction.agencyDocument!, `ورقة الوكالة - بوليصة ${transaction.billNo}`)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>معاينة</span>
                    </button>
                  )}
                  {onAttachAgencyToTransaction && (
                    <button
                      type="button"
                      onClick={() => agencyInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{transaction.agencyDocument ? 'تحديث' : 'أرشفة'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notes & Badges */}
              {transaction.notes && (
                <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-slate-400 font-semibold text-xs">ملاحظات وتوجيهات البوليصة:</span>
                    <div className="flex flex-wrap gap-1">
                      {CUSTOMS_PRESET_NOTES.filter(
                        (p) => transaction.notes.includes(p.fullText) || transaction.notes.includes(p.badgeLabel)
                      ).map((p) => (
                        <Badge key={p.id} variant={p.variant} className="text-[9px] py-0.2 px-1.5">
                          {p.badgeLabel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-200 text-xs whitespace-pre-line leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 font-sans">
                    {transaction.notes}
                  </p>
                </div>
              )}

            </div>

            {/* COLUMN 2 (Left in RTL): Financial Summary & Operational Accounts */}
            <div className="space-y-3.5">
              
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                {/* 1. Total Bill Amount */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-[10px] text-slate-400 font-medium">المبلغ الكلي للبوليصة:</div>
                  <div className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5" dir="ltr">
                    {transaction.isMixedCurrency ? (
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span>{formatCurrency(fin.totalAmount || 0, 'IQD')}</span>
                        <span className="text-cyan-300">+{formatCurrency(fin.totalAmountUSD || 0, 'USD')}</span>
                      </div>
                    ) : (
                      formatCurrency(fin.totalAmount, transaction.currency || 'IQD')
                    )}
                  </div>
                  {transaction.currency === 'USD' && !transaction.isMixedCurrency && (
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalAmount * exchangeRate))} د.ع
                    </div>
                  )}
                  {transaction.isMixedCurrency && (
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5" dir="ltr">
                      ≈ {new Intl.NumberFormat('ar-IQ').format((fin.totalAmount || 0) + ((fin.totalAmountUSD || 0) * exchangeRate))} د.ع
                    </div>
                  )}
                  {(fin.totalCarrierCost || 0) > 0 && (
                    <div className="mt-1 text-[9px] text-amber-300 font-mono" dir="rtl">
                      أجور نقل متضمنة: <span className="font-bold">{formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}</span>
                    </div>
                  )}
                </div>

                {/* 2. Paid / Collected */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-[10px] text-slate-400 font-medium">المسدد من الزبون:</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono mt-0.5" dir="ltr">
                    {transaction.isMixedCurrency ? (
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span>{formatCurrency(fin.totalCollected, 'IQD')}</span>
                        <span className="text-cyan-300">+{formatCurrency(fin.totalCollectedUSD || 0, 'USD')}</span>
                      </div>
                    ) : (
                      formatCurrency(fin.totalCollected, transaction.currency || 'IQD')
                    )}
                  </div>
                  {transaction.currency === 'USD' && fin.totalCollected > 0 && !transaction.isMixedCurrency && (
                    <div className="text-[9px] text-emerald-300/80 font-mono mt-0.5">
                      ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalCollected * exchangeRate))} د.ع
                    </div>
                  )}
                </div>

                {/* 3. Remaining on Customer */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-[10px] text-slate-400 font-medium">المتبقي على الزبون:</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono mt-0.5" dir="ltr">
                    {transaction.isMixedCurrency ? (
                      (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0) ? (
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span>{formatCurrency(fin.remainingAmount, 'IQD')}</span>
                          <span className="text-cyan-400">+{formatCurrency(fin.remainingAmountUSD || 0, 'USD')}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-xs">0 (خالص)</span>
                      )
                    ) : (
                      formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')
                    )}
                  </div>
                  {transaction.currency === 'USD' && fin.remainingAmount > 0 && !transaction.isMixedCurrency && (
                    <div className="text-[9px] text-amber-300/80 font-mono mt-0.5">
                      ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.remainingAmount * exchangeRate))} د.ع
                    </div>
                  )}
                </div>

                {/* 4. Broker Advances */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-[10px] text-slate-400 font-medium">سلف المخلص:</div>
                  <div className="text-xs sm:text-sm font-bold text-rose-400 font-mono mt-0.5" dir="ltr">
                    {(fin.openAdvancesIQD || 0) > 0 && (fin.openAdvancesUSD || 0) > 0 ? (
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span>{formatCurrency(fin.openAdvancesIQD || 0, 'IQD')}</span>
                        <span className="text-cyan-300">+{formatCurrency(fin.openAdvancesUSD || 0, 'USD')}</span>
                      </div>
                    ) : (fin.openAdvancesUSD || 0) > 0 ? (
                      formatCurrency(fin.openAdvancesUSD || 0, 'USD')
                    ) : (fin.openAdvancesIQD || 0) > 0 ? (
                      formatCurrency(fin.openAdvancesIQD || 0, 'IQD')
                    ) : (
                      formatCurrency(0, transaction.currency || 'IQD')
                    )}
                  </div>
                </div>

                {/* 5. Direct Expenses & Net Profit */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 col-span-2 sm:col-span-2">
                  <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                    <span>مصاريف البوليصة:</span>
                    <span className="text-[9px] text-slate-400 font-mono">({billDirectExpenses.length} سند)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-purple-300 font-mono mt-0.5" dir="ltr">
                    {(fin.totalDirectExpensesIQD || 0) > 0 && (fin.totalDirectExpensesUSD || 0) > 0 ? (
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span>{formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')}</span>
                        <span className="text-cyan-300">+{formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')}</span>
                      </div>
                    ) : (fin.totalDirectExpensesUSD || 0) > 0 ? (
                      formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')
                    ) : (fin.totalDirectExpensesIQD || 0) > 0 ? (
                      formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')
                    ) : (
                      <span className="text-slate-500 text-xs font-sans">0 د.ع</span>
                    )}
                  </div>
                  {(fin.totalDirectExpenses || 0) > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="rtl">
                      صافي الربح: <strong className="text-emerald-400">{formatCurrency(fin.netEstimatedProfit || 0, transaction.currency || 'IQD')}</strong>
                    </div>
                  )}
                </div>

              </div>

              {/* Transport Trips & Carrier Details Section */}
              {((transaction.transportTrips && transaction.transportTrips.length > 0) || transaction.transportDocument) && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>نقل البضائع والنواقل ({transaction.transportTrips?.length || 0} نقلة)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {onEditTransaction && transaction.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => onEditTransaction(transaction)}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition"
                          title="إضافة أو تعديل نقلات وشاحنات البوليصة"
                        >
                          <Plus className="w-3 h-3" />
                          <span>إدارة النقلات</span>
                        </button>
                      )}
                      {transaction.transportDocument && onViewArchive && (
                        <button
                          type="button"
                          onClick={() =>
                            onViewArchive(
                              transaction.transportDocument!,
                              `وصل استلام النقل - بوليصة ${transaction.billNo}`
                            )
                          }
                          className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة الوصل</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {transaction.transportTrips && transaction.transportTrips.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                            <th className="py-1.5 px-2">شركة النقل</th>
                            <th className="py-1.5 px-2">الوجهة</th>
                            <th className="py-1.5 px-2 text-center">الشاحنات</th>
                            <th className="py-1.5 px-2">السائق</th>
                            <th className="py-1.5 px-2">أجرة الناقل</th>
                            <th className="py-1.5 px-2 text-center">وصل</th>
                            <th className="py-1.5 px-2 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                          {transaction.transportTrips.map((trip) => (
                            <tr key={trip.id} className="hover:bg-slate-900/40">
                              <td className="py-1.5 px-2 font-bold text-white">{trip.carrierName || 'شركة نقل'}</td>
                              <td className="py-1.5 px-2 text-slate-300">{trip.destination || '—'}</td>
                              <td className="py-1.5 px-2 text-center font-mono font-bold text-amber-300">
                                {trip.truckCount || 1}
                              </td>
                              <td className="py-1.5 px-2">
                                <div className="text-slate-200">{trip.driverName || '—'}</div>
                                <div className="text-[9px] font-mono text-cyan-300">
                                  {trip.truckPlateNo || ''}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 font-mono font-bold text-amber-400" dir="ltr">
                                {formatCurrency(trip.carrierCost, trip.currency)}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                {trip.transportDocument && onViewArchive ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onViewArchive(
                                        trip.transportDocument!,
                                        `وصل نقلة (${trip.destination}) - بوليصة ${transaction.billNo}`
                                      )
                                    }
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>عرض</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">—</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                {onDeleteTrip && transaction.status !== 'cancelled' ? (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteTrip(transaction, trip)}
                                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                    title="حذف النقلة"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {(fin.totalCarrierCost || 0) > 0 && (
                          <tfoot className="border-t border-slate-700 text-[11px] font-mono divide-y divide-slate-800/80 bg-slate-900/90">
                            <tr>
                              <td colSpan={4} className="py-1.5 px-2 text-slate-300 font-sans font-bold">
                                إجمالي أجور النواقل:
                              </td>
                              <td className="py-1.5 px-2 font-mono text-amber-400 font-bold" dir="ltr">
                                {formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}
                              </td>
                              <td colSpan={2} className="py-1.5 px-2 text-center text-[10px] text-slate-400 font-sans">
                                كلفة تشغيلية
                              </td>
                            </tr>
                            {(fin.totalCarrierPaid || 0) > 0 && (
                              <tr className="font-semibold">
                                <td colSpan={4} className="py-1 px-2 text-emerald-300 font-sans">
                                  ✓ المسدد للنواقل (سندات صرف):
                                </td>
                                <td className="py-1 px-2 font-mono text-emerald-400 font-bold" dir="ltr">
                                  - {formatCurrency(fin.totalCarrierPaid || 0, transaction.currency || 'IQD')}
                                </td>
                                <td colSpan={2} className="py-1 px-2 text-center text-[10px] text-emerald-400 font-sans">
                                  مسدد نقداً
                                </td>
                              </tr>
                            )}
                            <tr className={`font-bold ${
                              (fin.remainingCarrierDue || 0) > 0 
                                ? 'bg-amber-950/30 text-amber-300' 
                                : 'bg-emerald-950/30 text-emerald-300'
                            }`}>
                              <td colSpan={4} className="py-1.5 px-2 font-sans">
                                المستحق المتبقي للناقل:
                              </td>
                              <td className={`py-1.5 px-2 font-mono font-bold ${
                                (fin.remainingCarrierDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                              }`} dir="ltr">
                                {formatCurrency(
                                  fin.remainingCarrierDue !== undefined 
                                    ? fin.remainingCarrierDue 
                                    : Math.max(0, (fin.totalCarrierCost || 0) - (fin.totalCarrierPaid || 0)), 
                                  transaction.currency || 'IQD'
                                )}
                              </td>
                              <td colSpan={2} className="py-1.5 px-2 text-center text-[10px] font-sans">
                                {(fin.remainingCarrierDue || 0) > 0 ? 'مستحق' : 'خالص ✅'}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Bill Direct Operational Expenses Section */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="text-purple-400">💸</span>
                    <span>المصاريف الكمركية والتشغيلية ({billDirectExpenses.length} سند صرف)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onOpenAddExpense && transaction.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => onOpenAddExpense(transaction)}
                        className="px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="صرف رسوم كمركية أو موانئ أو فحص أو نثريات"
                      >
                        <Plus className="w-3 h-3" />
                        <span>صرف مصروف</span>
                      </button>
                    )}
                  </div>
                </div>

                {billDirectExpenses.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-400 text-center text-[11px] flex flex-wrap items-center justify-between gap-2">
                    <span>لا توجد مصاريف كمركية أو تشغيلية مسجلة من الصندوق حتى الآن.</span>
                    {onOpenAddExpense && transaction.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => onOpenAddExpense(transaction)}
                        className="text-purple-400 hover:text-purple-300 text-[11px] font-bold underline"
                      >
                        + صرف الآن
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                          <th className="py-1.5 px-2">رقم السند</th>
                          <th className="py-1.5 px-2">التصنيف</th>
                          <th className="py-1.5 px-2">الجهة المستلمة</th>
                          <th className="py-1.5 px-2">المبلغ</th>
                          <th className="py-1.5 px-2">التاريخ والبيان</th>
                          <th className="py-1.5 px-2 text-center">مستند</th>
                          <th className="py-1.5 px-2 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        {billDirectExpenses.map((exp) => {
                          const expCurr = exp.currency || 'IQD';
                          return (
                            <tr key={exp.id} className="hover:bg-slate-900/40">
                              <td className="py-1.5 px-2 font-mono font-bold text-purple-300 text-[11px]">
                                {exp.voucherNo}
                              </td>
                              <td className="py-1.5 px-2 font-bold text-slate-200">
                                {exp.category}
                              </td>
                              <td className="py-1.5 px-2 text-slate-300">
                                {exp.partyName || '—'}
                              </td>
                              <td className="py-1.5 px-2 font-mono font-bold" dir="ltr">
                                <span className={expCurr === 'USD' ? 'text-cyan-400' : 'text-purple-300'}>
                                  - {formatCurrency(exp.amount, expCurr)}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-slate-400 max-w-[140px]">
                                <div className="font-mono text-[9px] text-slate-500">{exp.date}</div>
                                <div className="truncate text-[10px] text-slate-300">{exp.description || '—'}</div>
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                {exp.attachment && onViewArchive ? (
                                  <button
                                    type="button"
                                    onClick={() => onViewArchive(exp.attachment!, `وصل مصروف ${exp.voucherNo}`)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>عرض</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">—</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {onEditExpense && transaction.status !== 'cancelled' && (
                                    <button
                                      type="button"
                                      onClick={() => onEditExpense(exp)}
                                      className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                                      title="تعديل المصروف"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  {onDeleteExpense && transaction.status !== 'cancelled' && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteExpense(exp)}
                                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                                      title="إلغاء واسترداد المبلغ إلى الصندوق"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-slate-800 text-[11px] font-mono font-bold bg-slate-900/90">
                        <tr>
                          <td colSpan={3} className="py-1.5 px-2 text-slate-300 font-sans">
                            إجمالي المصاريف:
                          </td>
                          <td colSpan={4} className="py-1.5 px-2 font-mono text-purple-300" dir="ltr">
                            {formatCurrency(fin.totalDirectExpensesIQD || 0, 'IQD')}
                            {(fin.totalDirectExpensesUSD || 0) > 0 && ` + ${formatCurrency(fin.totalDirectExpensesUSD || 0, 'USD')}`}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Transactions Vouchers & Advances History */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ReceiptIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>سجل الوصولات والدفعات ({billReceipts.length + carrierPaymentsOnBill.length + billDirectExpenses.length}):</span>
                  </span>

                  {fin.openAdvances > 0 && employee && (
                    <button
                      onClick={() => onOpenQuickSettlement(employee.id)}
                      className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>تصفية سلف المخلص</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                        <th className="py-1.5 px-2">رقم السند</th>
                        <th className="py-1.5 px-2">النوع</th>
                        <th className="py-1.5 px-2">المبلغ</th>
                        <th className="py-1.5 px-2">الأثر</th>
                        <th className="py-1.5 px-2">التاريخ</th>
                        <th className="py-1.5 px-2 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px]">
                      {billReceipts.length === 0 && carrierPaymentsOnBill.length === 0 && billDirectExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">
                            لا توجد وصولات أو دفعات مسجلة لهذه البوليصة بعد
                          </td>
                        </tr>
                      ) : (
                        <>
                          {billReceipts.map(r => {
                            const isCancelled = r.status === 'cancelled';
                            const billCurr = transaction.currency === 'USD' ? 'USD' : 'IQD';
                            const rCurr = r.currency || billCurr;
                            const b = getReceiptBreakdownForBill(r, billCurr, exchangeRate || transaction.exchangeRate || 1500);
                            const isCustomerPayment = r.type === 'deposit' || r.type === 'payment';

                            return (
                              <tr key={r.id} className={`hover:bg-slate-900/30 ${isCancelled ? 'bg-rose-950/20 text-slate-400' : ''}`}>
                                <td className="py-1.5 px-2 font-mono font-bold text-[11px]">
                                  <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>{r.receiptNo}</span>
                                  {isCancelled && (
                                    <span className="mr-1 text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                                      ملغي
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-2">
                                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                    r.type === 'payment' || r.type === 'deposit'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : r.type === 'advance'
                                      ? 'bg-amber-500/10 text-amber-400'
                                      : 'bg-purple-500/10 text-purple-400'
                                  }`}>
                                    {r.type === 'deposit' ? 'دفعة أولى' : r.type === 'payment' ? 'دفعة زبون' : r.type === 'advance' ? 'سلفة مخلص' : 'تسوية سلفة'}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-mono font-bold text-slate-100" dir="ltr">
                                  {isCancelled ? (
                                    <span className="line-through text-slate-500">{formatCurrency(r.amount, rCurr)}</span>
                                  ) : (
                                    <span className={rCurr === 'USD' ? 'text-cyan-400' : 'text-emerald-400'}>
                                      {formatCurrency(r.amount, rCurr)}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-2 text-[10px]">
                                  {isCancelled ? (
                                    <span className="text-rose-400">محيد</span>
                                  ) : isCustomerPayment ? (
                                    <strong className="font-mono text-emerald-400" dir="ltr">
                                      +{formatCurrency(b.netCreditInBillCurrency, billCurr)}
                                    </strong>
                                  ) : (
                                    <span className="text-amber-300 font-mono" dir="ltr">
                                      {r.type === 'advance' ? `-${formatCurrency(r.amount, rCurr)}` : `تسوية`}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-2 text-slate-400 font-mono text-[10px]">
                                  {r.date}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  {onDeleteReceipt && (
                                    <button
                                      onClick={() => onDeleteReceipt(r)}
                                      title={isCancelled ? "حذف السند نهائياً" : "إلغاء السند دفترياً"}
                                      className={`p-1 rounded transition ${
                                        isCancelled
                                          ? 'bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200'
                                          : 'bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                                      }`}
                                    >
                                      {isCancelled ? <Trash2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Carrier Payments */}
                          {carrierPaymentsOnBill.map(t => {
                            const tCurr = t.currency || 'IQD';
                            return (
                              <tr key={t.id} className="hover:bg-slate-900/30 bg-amber-950/10">
                                <td className="py-1.5 px-2 font-mono font-bold text-cyan-300 text-[11px]">
                                  {t.voucherNo}
                                </td>
                                <td className="py-1.5 px-2">
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                    🚛 دفعة ناقل
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-mono font-bold text-rose-400" dir="ltr">
                                  - {formatCurrency(t.amount, tCurr)}
                                </td>
                                <td className="py-1.5 px-2 text-[10px] text-slate-300">
                                  {t.partyName || 'شركة النقل'}
                                </td>
                                <td className="py-1.5 px-2 text-slate-400 font-mono text-[10px]">
                                  {t.date}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  {t.attachment && onViewArchive ? (
                                    <button
                                      type="button"
                                      onClick={() => onViewArchive(t.attachment!, `وصل دفعة الناقل ${t.voucherNo}`)}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                                    >
                                      <Eye className="w-2.5 h-2.5" />
                                      <span>عرض</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer with Actions - Pinned & Compact */}
        <div className="p-3 sm:px-4 sm:py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Quick Operations on the Right (RTL) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={onOpenQuickAdvance}
              disabled={transaction.status === 'cancelled'}
              className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                transaction.status === 'cancelled'
                  ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
              title={transaction.status === 'cancelled' ? 'لا يمكن صرف سلف على بوليصة ملغاة' : 'صرف سلفة للمخلص'}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>🏦 سلفة للمخلص</span>
            </button>

            {(() => {
              const isFullyPaid = transaction.isMixedCurrency
                ? (fin.remainingAmount <= 0 && (fin.remainingAmountUSD || 0) <= 0)
                : fin.remainingAmount <= 0;
              const isDisabled = transaction.status === 'cancelled' || isFullyPaid;
              return (
                <button
                  onClick={onOpenQuickPayment}
                  disabled={isDisabled}
                  className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    isDisabled
                      ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                  title={transaction.status === 'cancelled' ? 'لا يمكن قبض مبالغ لبوليصة ملغاة' : isFullyPaid ? 'البوليصة مسددة بالكامل (خالصة)' : 'تسجيل دفعة من الزبون'}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>💳 دفعة زبون {transaction.status === 'cancelled' ? '(ملغاة)' : isFullyPaid ? '(خالصة)' : ''}</span>
                </button>
              );
            })()}

            {onOpenAddExpense && (
              <button
                type="button"
                onClick={() => onOpenAddExpense(transaction)}
                disabled={transaction.status === 'cancelled'}
                className={`h-8 px-2.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  transaction.status === 'cancelled'
                    ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                    : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs'
                }`}
                title="صرف رسوم كمركية، موانئ، فحص، عمال، أو نثريات على البوليصة"
              >
                <span>💸</span>
                <span>صرف مصروف</span>
              </button>
            )}

            <button
              onClick={onOpenAttachments}
              className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>📎 المرفقات ({billAttachments.length})</span>
            </button>
          </div>

          {/* Edit / Print / Delete Actions on the Left (RTL) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {onEditTransaction && transaction.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => onEditTransaction(transaction)}
                className="h-8 px-2.5 text-xs bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold rounded-lg transition flex items-center gap-1.5"
                title="تعديل بيانات البوليصة والنقلات"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                <span>تعديل البوليصة</span>
              </button>
            )}

            <button
              onClick={onPrintBillFile}
              className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>🖨️ طباعة الملف</span>
            </button>

            <button
              onClick={onPrintInvoice}
              className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>📄 طباعة فاتورة</span>
            </button>

            {onDeleteTransaction && (
              <button
                type="button"
                onClick={() => onDeleteTransaction(transaction)}
                className="h-8 px-2.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-lg transition flex items-center gap-1"
                title="حذف البوليصة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
