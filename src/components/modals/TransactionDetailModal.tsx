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
  Pencil
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg font-bold">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{transaction.billNo}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${comp.badgeClass}`}>
                  🏢 {comp.shortName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
              <p className="text-xs text-slate-400">{comp.fullName} • صندوق مالي موحد</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {transaction.status === 'cancelled' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-300 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                <Ban className="w-4 h-4 shrink-0" />
                <span>هذه البوليصة ملغاة دفترياً ومحاسبياً (VOID)</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                تم تحييد الأثر المالي للبوليصة وحماية الصندوق وفق المعالجة المحاسبية المعتمدة. تم إلغاء القيود المالية المرتبطة أو تحويلها لأمانات.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-rose-400/80 pt-1 border-t border-rose-500/20 font-mono">
                {transaction.cancelReason && <span>السبب: {transaction.cancelReason}</span>}
                {transaction.cancelledBy && <span>بواسطة: {transaction.cancelledBy}</span>}
                {transaction.cancelledAt && <span>التاريخ: {transaction.cancelledAt.split('T')[0]}</span>}
              </div>
            </div>
          )}

          {/* General Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">الزبون (الشركة):</span>
              <strong className="text-white text-sm">{customer?.name || '—'}</strong>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{customer?.phone}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">المخلص الكمركي المسؤول:</span>
              <strong className="text-white text-sm">{employee?.name || '—'}</strong>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{employee?.phone}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">تواريخ المعاملة:</span>
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400">تاريخ الإنشاء: </span>
                <strong className="text-emerald-400 font-mono">{transaction.createdAt || transaction.date || '—'}</strong>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                <span className="text-slate-400">تاريخ الاستلام: </span>
                <strong className="text-white font-mono">{transaction.date || '—'}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">نوع البضاعة: {transaction.goodsType || 'عامة'}</div>
            </div>
          </div>

          {/* Operational Milestones Timeline (أمر التسليم، التخليص، خروج الشحنة، عودة الحاوية) */}
          <BillMilestonesTimeline
            billNo={transaction.billNo}
            deliveryOrderDate={transaction.deliveryOrderDate}
            clearanceDate={transaction.clearanceDate}
            exitDate={transaction.exitDate}
            containerReturnDate={transaction.containerReturnDate}
            containersCount={transaction.containers?.length || 0}
            onUpdateDates={onUpdateOperationalDates ? (updates) => onUpdateOperationalDates(transaction, updates) : undefined}
          />

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">
                المبلغ الكلي للبوليصة:
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1" dir="ltr">
                {transaction.isMixedCurrency ? (
                  <div className="flex flex-col text-xs leading-tight">
                    <span>{formatCurrency(fin.totalAmount || 0, 'IQD')}</span>
                    <span className="text-cyan-300">+{formatCurrency(fin.totalAmountUSD || 0, 'USD')}</span>
                  </div>
                ) : (
                  formatCurrency(fin.totalAmount, transaction.currency || 'IQD')
                )}
              </div>
              {transaction.currency === 'USD' && !transaction.isMixedCurrency && (
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalAmount * exchangeRate))} د.ع
                </div>
              )}
              {transaction.isMixedCurrency && (
                <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                  ≈ {new Intl.NumberFormat('ar-IQ').format((fin.totalAmount || 0) + ((fin.totalAmountUSD || 0) * exchangeRate))} د.ع
                </div>
              )}
              {(fin.totalCarrierCost || 0) > 0 && (
                <div className="mt-1 flex flex-col gap-0.5 text-[10px]">
                  <div className="text-amber-300 font-mono flex items-center gap-1" dir="rtl" title="أجور نقل تدفع للنواقل (تكلفة تشغيلية متضمنة بالعقد)">
                    <span>أجور نقل متضمنة:</span>
                    <span className="font-bold">{formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[9px]" dir="rtl">
                    (تكلفة تشغيلية لا تخصم من الزبون)
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">المسدد من الزبون:</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1" dir="ltr">
                {transaction.isMixedCurrency ? (
                  <div className="flex flex-col text-xs leading-tight">
                    <span>{formatCurrency(fin.totalCollected, 'IQD')}</span>
                    <span className="text-cyan-300">+{formatCurrency(fin.totalCollectedUSD || 0, 'USD')}</span>
                  </div>
                ) : (
                  formatCurrency(fin.totalCollected, transaction.currency || 'IQD')
                )}
              </div>
              {transaction.currency === 'USD' && fin.totalCollected > 0 && !transaction.isMixedCurrency && (
                <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                  ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalCollected * exchangeRate))} د.ع
                </div>
              )}
              {((fin.collectedInUSD || 0) > 0 && (fin.collectedInIQD || 0) > 0) && (
                <div className="text-[10px] text-cyan-300 font-mono mt-0.5" dir="ltr">
                  (${formatCurrency(fin.collectedInUSD || 0, 'USD')} + {formatCurrency(fin.collectedInIQD || 0, 'IQD')})
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">المتبقي على الزبون:</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-1" dir="ltr">
                {transaction.isMixedCurrency ? (
                  (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0) ? (
                    <div className="flex flex-col text-xs leading-tight">
                      <span>{formatCurrency(fin.remainingAmount, 'IQD')}</span>
                      <span className="text-cyan-400">+{formatCurrency(fin.remainingAmountUSD || 0, 'USD')}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-semibold">0 (خالص)</span>
                  )
                ) : (
                  formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')
                )}
              </div>
              {transaction.currency === 'USD' && fin.remainingAmount > 0 && !transaction.isMixedCurrency && (
                <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                  ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.remainingAmount * exchangeRate))} د.ع
                </div>
              )}
              {(fin.customerCommissionInBillCurr || 0) > 0 && (
                <div className="text-[10px] text-amber-300 mt-0.5">
                  خُصمت عمولة على الزبون: {formatCurrency(fin.customerCommissionInBillCurr || 0, transaction.currency || 'IQD')}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">سلف المخلص:</div>
              <div className="text-sm font-bold text-rose-400 font-mono mt-1" dir="ltr">
                {(fin.openAdvancesIQD || 0) > 0 && (fin.openAdvancesUSD || 0) > 0 ? (
                  <div className="flex flex-col text-xs leading-tight">
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

            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-purple-300 font-bold flex items-center justify-between">
                <span>مصاريف البوليصة:</span>
                <span className="text-[10px] text-slate-400 font-mono">({billDirectExpenses.length} سند)</span>
              </div>
              <div className="text-sm font-bold text-purple-300 font-mono mt-1" dir="ltr">
                {(fin.totalDirectExpensesIQD || 0) > 0 && (fin.totalDirectExpensesUSD || 0) > 0 ? (
                  <div className="flex flex-col text-xs leading-tight">
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

          {/* Containers Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-cyan-400" />
                <span>أرقام الحاويات المسجلة ({transaction.containers.length}):</span>
              </span>
            </div>

            {transaction.containers.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center">
                لا توجد حاويات مضافة لهذه البوليصة
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transaction.containers.map((cont, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 font-mono font-bold text-cyan-300 text-xs shadow-xs"
                  >
                    📦 {cont}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Agency Document Archiving Section (ورقة الوكالة الخاصة بالعمل) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>ورقة الوكالة الخاصة بالعمل للبوليصة</span>
                  {transaction.agencyDocument ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مؤرشفة</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                      غير مؤرشفة بعد
                    </span>
                  )}
                </div>
                {transaction.agencyDocument ? (
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {transaction.agencyDocument.name} • {(transaction.agencyDocument.size / 1024).toFixed(1)} KB • {transaction.agencyDocument.date}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    يمكنك رفع وأرشفة ورقة الوكالة الخاصة بهذه البوليصة للرجوع إليها في أي وقت
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {transaction.agencyDocument && onViewArchive && (
                <button
                  type="button"
                  onClick={() => onViewArchive(transaction.agencyDocument!, `ورقة الوكالة - بوليصة ${transaction.billNo}`)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة ورقة الوكالة</span>
                </button>
              )}
              {onAttachAgencyToTransaction && (
                <button
                  type="button"
                  onClick={() => agencyInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{transaction.agencyDocument ? 'تحديث ورقة الوكالة' : 'أرشفة الوكالة'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Transport Trips & Carrier Details Section (نقل البضائع والنواقل البرية) */}
          {((transaction.transportTrips && transaction.transportTrips.length > 0) || transaction.transportDocument) && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">🚛</span>
                  <span>نقل البضائع والنواقل البرية ({transaction.transportTrips?.length || 0} نقلة)</span>
                </div>
                <div className="flex items-center gap-2">
                  {onEditTransaction && transaction.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => onEditTransaction(transaction)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      title="إضافة أو تعديل نقلات وشاحنات البوليصة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة / إدارة النقلات</span>
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
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة ورقة / وصل النقل العام</span>
                    </button>
                  )}
                </div>
              </div>

              {transaction.transportTrips && transaction.transportTrips.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="py-2 px-3">شركة النقل</th>
                        <th className="py-2 px-3">وجهة النقل</th>
                        <th className="py-2 px-3 text-center">الشاحنات</th>
                        <th className="py-2 px-3">السائق ورقم السيارة</th>
                        <th className="py-2 px-3">أجرة الناقل</th>
                        <th className="py-2 px-3 text-center">وصل النقلة</th>
                        <th className="py-2 px-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transaction.transportTrips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-bold text-white">{trip.carrierName || 'شركة نقل'}</td>
                          <td className="py-2 px-3 text-slate-300">{trip.destination || '—'}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-amber-300">
                            {trip.truckCount || 1} شاحنة
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-slate-200 font-semibold">{trip.driverName || '—'}</div>
                            <div className="text-[10px] font-mono text-cyan-300">
                              {trip.truckPlateNo || '—'} {trip.driverPhone ? `· ${trip.driverPhone}` : ''}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-amber-400" dir="ltr">
                            {formatCurrency(trip.carrierCost, trip.currency)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {trip.transportDocument && onViewArchive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onViewArchive(
                                    trip.transportDocument!,
                                    `وصل نقلة (${trip.destination}) - بوليصة ${transaction.billNo}`
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {onDeleteTrip && transaction.status !== 'cancelled' ? (
                              <button
                                type="button"
                                onClick={() => onDeleteTrip(transaction, trip)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition text-[11px] font-bold shadow-xs cursor-pointer"
                                title={`حذف نقلة (${trip.carrierName || 'الناقل'}) من البوليصة`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {(fin.totalCarrierCost || 0) > 0 && (
                      <tfoot className="border-t-2 border-slate-700 text-xs divide-y divide-slate-800/80 font-mono">
                        {/* 1. إجمالي أجور النقل */}
                        <tr className="bg-slate-900/90 font-bold">
                          <td colSpan={4} className="py-2.5 px-3 text-slate-300 font-sans">
                            إجمالي أجور النواقل (تكاليف تشغيلية للبوليصة):
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-400 font-bold" dir="ltr">
                            {formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}
                          </td>
                          <td colSpan={2} className="py-2.5 px-3 text-center text-[10px] text-slate-400 font-sans">
                            تكلفة متفق عليها
                          </td>
                        </tr>

                        {/* 2. المسدد للنواقل من الصندوق */}
                        {(fin.totalCarrierPaid || 0) > 0 && (
                          <tr className="bg-slate-900/60 font-semibold">
                            <td colSpan={4} className="py-2 px-3 text-emerald-300 font-sans flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className="text-emerald-400">✓</span>
                                <span>المسدد لشركة النقل (سندات صرف من الصندوق):</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({carrierPaymentsOnBill.length} سند صرف)
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-emerald-400 font-bold" dir="ltr">
                              - {formatCurrency(fin.totalCarrierPaid || 0, transaction.currency || 'IQD')}
                            </td>
                            <td colSpan={2} className="py-2 px-3 text-center text-[10px] text-emerald-400 font-sans font-bold">
                              مسدد نقداً
                            </td>
                          </tr>
                        )}

                        {/* 3. المتبقي المستحق للناقل */}
                        <tr className={`font-black ${
                          (fin.remainingCarrierDue || 0) > 0 
                            ? 'bg-amber-950/40 text-amber-300' 
                            : 'bg-emerald-950/40 text-emerald-300'
                        }`}>
                          <td colSpan={4} className="py-2.5 px-3 font-sans flex items-center gap-2">
                            <span>الأجور المستحقة المتبقية للناقل (الذمة الجارية):</span>
                            {(fin.remainingCarrierDue || 0) === 0 && (fin.totalCarrierCost || 0) > 0 && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                تم التسديد بالكامل ✅
                              </span>
                            )}
                          </td>
                          <td className={`py-2.5 px-3 font-mono font-black text-sm ${
                            (fin.remainingCarrierDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                          }`} dir="ltr">
                            {formatCurrency(
                              fin.remainingCarrierDue !== undefined 
                                ? fin.remainingCarrierDue 
                                : Math.max(0, (fin.totalCarrierCost || 0) - (fin.totalCarrierPaid || 0)), 
                              transaction.currency || 'IQD'
                            )}
                          </td>
                          <td colSpan={2} className="py-2.5 px-3 text-center text-[10px] font-sans font-bold">
                            {(fin.remainingCarrierDue || 0) > 0 ? (
                              <span className="text-amber-400 font-bold">مستحقة للنواقل</span>
                            ) : (
                              <span className="text-emerald-400 font-bold">خالصة الذمة</span>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bill Direct Operational Expenses Section (مصاريف البوليصة الكمركية والتشغيلية) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">💸</span>
                <span>المصاريف الكمركية والتشغيلية للبوليصة ({billDirectExpenses.length} سند صرف)</span>
                {billDirectExpenses.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono font-bold">
                    خصم مباشر من الصندوق
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onOpenAddExpense && transaction.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => onOpenAddExpense(transaction)}
                    className="px-3 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="تسجيل صرف رسوم كمركية أو موانئ أو فحص أو عمال على هذه البوليصة"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>صرف مصروف كمركي / تشغيلي</span>
                  </button>
                )}
              </div>
            </div>

            {billDirectExpenses.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-center text-xs flex flex-wrap items-center justify-between gap-2">
                <span>لا توجد مصاريف كمركية أو تشغيلية مسجلة من الصندوق على هذه البوليصة حتى الآن.</span>
                {onOpenAddExpense && transaction.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => onOpenAddExpense(transaction)}
                    className="text-purple-400 hover:text-purple-300 text-xs font-bold underline"
                  >
                    + إضافة أول مصروف الآن
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="py-2 px-3">رقم السند</th>
                      <th className="py-2 px-3">التصنيف</th>
                      <th className="py-2 px-3">الجهة المستلمة</th>
                      <th className="py-2 px-3">المبلغ والصندوق</th>
                      <th className="py-2 px-3">التاريخ والبيان</th>
                      <th className="py-2 px-3 text-center">المستند</th>
                      <th className="py-2 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {billDirectExpenses.map((exp) => {
                      const expCurr = exp.currency || 'IQD';
                      return (
                        <tr key={exp.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-mono font-bold text-purple-300">
                            {exp.voucherNo}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-200">
                            {exp.category}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {exp.partyName || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold" dir="ltr">
                            <span className={expCurr === 'USD' ? 'text-cyan-400' : 'text-purple-300'}>
                              - {formatCurrency(exp.amount, expCurr)}
                            </span>
                            <div className="text-[9px] font-sans text-slate-400">
                              {expCurr === 'USD' ? 'صندوق الدولار' : 'صندوق الدينار'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-400 max-w-[200px]">
                            <div className="font-mono text-[10px] text-slate-500">{exp.date}</div>
                            <div className="truncate text-[11px] text-slate-300">{exp.description || '—'}</div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {exp.attachment && onViewArchive ? (
                              <button
                                type="button"
                                onClick={() => onViewArchive(exp.attachment!, `وصل مصروف ${exp.voucherNo}`)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onEditExpense && transaction.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => onEditExpense(exp)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                                  title="تعديل المصروف"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                              {onDeleteExpense && transaction.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteExpense(exp)}
                                  className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                                  title="إلغاء واسترداد المبلغ إلى الصندوق"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 text-xs font-mono font-bold bg-slate-900/90">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-slate-300 font-sans">
                        إجمالي المصاريف الكمركية والتشغيلية المخصومة من الصندوق:
                      </td>
                      <td colSpan={4} className="py-2 px-3 font-mono text-purple-300 text-sm" dir="ltr">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>سجل الوصولات، الدفعات، والمصاريف الخاصة بالبوليصة ({billReceipts.length + carrierPaymentsOnBill.length + billDirectExpenses.length}):</span>
              </span>

              {fin.openAdvances > 0 && employee && (
                <button
                  onClick={() => onOpenQuickSettlement(employee.id)}
                  className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تصفية سلف المخلص</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3">رقم الوصل</th>
                    <th className="py-2.5 px-3">النوع</th>
                    <th className="py-2.5 px-3">المبلغ والعمولة</th>
                    <th className="py-2.5 px-3">الأثر على البوليصة / الصندوق</th>
                    <th className="py-2.5 px-3">التاريخ والملاحظات</th>
                    <th className="py-2.5 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {billReceipts.length === 0 && carrierPaymentsOnBill.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
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
                            <td className="py-2.5 px-3 font-mono font-bold">
                              <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>{r.receiptNo}</span>
                              {isCancelled && (
                                <span className="mr-1.5 text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                                  ملغي
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.type === 'payment' || r.type === 'deposit'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : r.type === 'advance'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {r.type === 'deposit' ? 'دفعة أولى' : r.type === 'payment' ? 'دفعة زبون' : r.type === 'advance' ? 'سلفة مخلص' : 'تسوية سلفة'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-100" dir="ltr">
                              {isCancelled ? (
                                <span className="line-through text-slate-500">{formatCurrency(r.amount, rCurr)}</span>
                              ) : (
                                <div className="flex flex-col">
                                  <span className={rCurr === 'USD' ? 'text-cyan-400' : 'text-emerald-400'}>
                                    {formatCurrency(r.amount, rCurr)}
                                  </span>
                                  {b.hasCommission && (
                                    <span className="text-[10px] text-amber-300 font-sans font-semibold mt-0.5">
                                      عمولة: {formatCurrency(b.commissionAmount, b.commissionCurrency)} ({b.commissionBearer === 'party' ? 'على الزبون' : 'على الشركة'})
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[11px]">
                              {isCancelled ? (
                                <span className="text-rose-400">تم تحييد الأثر</span>
                              ) : isCustomerPayment ? (
                                <div className="flex flex-col space-y-0.5">
                                  <span>
                                    <span className="text-slate-400">للبوليصة: </span>
                                    <strong className="font-mono text-emerald-400" dir="ltr">
                                      {formatCurrency(b.netCreditInBillCurrency, billCurr)}
                                    </strong>
                                    {rCurr !== billCurr && (
                                      <span className="text-[10px] text-cyan-300 mr-1">(تحويل عملة)</span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    الصندوق:{' '}
                                    <strong className="font-mono text-slate-200" dir="ltr">
                                      {b.hasCommission && b.commissionCurrency === rCurr
                                        ? `+${formatCurrency(Math.max(0, r.amount - b.commissionAmount), rCurr)} صافي`
                                        : `+${formatCurrency(r.amount, rCurr)}${b.hasCommission ? ` (-${formatCurrency(b.commissionAmount, b.commissionCurrency)})` : ''}`}
                                    </strong>
                                  </span>
                                </div>
                              ) : (
                                <span className="text-amber-300 font-mono" dir="ltr">
                                  {r.type === 'advance'
                                    ? `صرف من الصندوق: -${formatCurrency(r.amount, rCurr)}${b.hasCommission ? ` (وعمولة -${formatCurrency(b.commissionAmount, b.commissionCurrency)})` : ''}`
                                    : `تصفية سلفة: ${formatCurrency(r.amount, rCurr)}`}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-[200px]">
                              <div className="font-mono text-[10px] text-slate-500">{r.date}</div>
                              <div className="truncate text-[11px] text-slate-300">
                                {isCancelled ? `[ملغي: ${r.cancelReason || 'إلغاء دفتري'}]` : (r.notes || '—')}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {onDeleteReceipt && (
                                <button
                                  onClick={() => onDeleteReceipt(r)}
                                  title={isCancelled ? "حذف السند نهائياً" : "إلغاء السند دفترياً"}
                                  className={`p-1 rounded-lg transition ${
                                    isCancelled
                                      ? 'bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200'
                                      : 'bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                                  }`}
                                >
                                  {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Carrier Payments Linked to This Bill */}
                      {carrierPaymentsOnBill.map(t => {
                        const tCurr = t.currency || 'IQD';
                        return (
                          <tr key={t.id} className="hover:bg-slate-900/30 bg-amber-950/10">
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                              {t.voucherNo}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                🚛 دفعة ناقل
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-400" dir="ltr">
                              - {formatCurrency(t.amount, tCurr)}
                            </td>
                            <td className="py-2.5 px-3 text-[11px]">
                              <div className="flex flex-col space-y-0.5">
                                <span className="text-slate-200">
                                  صرف نقدي للناقل: <strong className="text-amber-300 font-bold">{t.partyName || 'شركة النقل'}</strong>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  خُصمت من استحقاق النقل للبوليصة
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-[200px]">
                              <div className="font-mono text-[10px] text-slate-500">{t.date}</div>
                              <div className="truncate text-[11px] text-slate-300">
                                {t.description || 'تسديد دفعة أجور نقل'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {t.attachment && onViewArchive ? (
                                <button
                                  type="button"
                                  onClick={() => onViewArchive(t.attachment!, `وصل دفعة الناقل ${t.voucherNo}`)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>معاينة</span>
                                </button>
                              ) : (
                                <span className="text-slate-500 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Direct Customs & Operational Bill Expenses from Treasury */}
                      {billDirectExpenses.map(t => {
                        const tCurr = t.currency || 'IQD';
                        return (
                          <tr key={t.id} className="hover:bg-slate-900/30 bg-purple-950/10">
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-300">
                              {t.voucherNo}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                                💸 مصروف كمركي / تشغيلي
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold" dir="ltr">
                              <span className={tCurr === 'USD' ? 'text-cyan-400' : 'text-purple-300'}>
                                - {formatCurrency(t.amount, tCurr)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px]">
                              <div className="flex flex-col space-y-0.5">
                                <span className="text-slate-200">
                                  خصم من {tCurr === 'USD' ? 'صندوق الدولار' : 'صندوق الدينار'}: <strong className="text-purple-300 font-bold">{t.partyName || '—'}</strong>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  بند: {t.category}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-[200px]">
                              <div className="font-mono text-[10px] text-slate-500">{t.date}</div>
                              <div className="truncate text-[11px] text-slate-300">
                                {t.description || '—'}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {t.attachment && onViewArchive && (
                                  <button
                                    type="button"
                                    onClick={() => onViewArchive(t.attachment!, `وصل مصروف ${t.voucherNo}`)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>معاينة</span>
                                  </button>
                                )}
                                {onDeleteExpense && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteExpense(t)}
                                    title="إلغاء المصروف واسترجاع المبلغ للصندوق"
                                    className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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

          {/* Notes */}
          {transaction.notes && (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400 block font-semibold text-xs">ملاحظات وشارات البوليصة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {CUSTOMS_PRESET_NOTES.filter(
                    (p) => transaction.notes.includes(p.fullText) || transaction.notes.includes(p.badgeLabel)
                  ).map((p) => (
                    <Badge key={p.id} variant={p.variant} className="text-[10px] py-0.5 px-2">
                      {p.badgeLabel}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-slate-200 text-xs whitespace-pre-line leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 font-sans">
                {transaction.notes}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenQuickAdvance}
              disabled={transaction.status === 'cancelled'}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 ${
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
                  className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 ${
                    isDisabled
                      ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                  title={transaction.status === 'cancelled' ? 'لا يمكن قبض مبالغ لبوليصة ملغاة' : isFullyPaid ? 'البوليصة مسددة بالكامل (خالصة)' : 'تسجيل دفعة من الزبون'}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>💳 دفعة من الزبون {transaction.status === 'cancelled' ? '(ملغاة)' : isFullyPaid ? '(خالصة)' : ''}</span>
                </button>
              );
            })()}

            {onOpenAddExpense && (
              <button
                type="button"
                onClick={() => onOpenAddExpense(transaction)}
                disabled={transaction.status === 'cancelled'}
                className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 ${
                  transaction.status === 'cancelled'
                    ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                    : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs'
                }`}
                title="صرف رسوم كمركية، موانئ، فحص، عمال، أو نثريات على البوليصة من الصندوق"
              >
                <span>💸</span>
                <span>صرف مصروف على البوليصة</span>
              </button>
            )}

            <button
              onClick={onOpenAttachments}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>📎 المرفقات ({billAttachments.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onEditTransaction && transaction.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => onEditTransaction(transaction)}
                className="px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold rounded-xl transition flex items-center gap-1.5"
                title="تعديل بيانات البوليصة والنقلات"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                <span>تعديل البوليصة</span>
              </button>
            )}

            <button
              onClick={onPrintBillFile}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>🖨️ طباعة ملف البوليصة</span>
            </button>

            <button
              onClick={onPrintInvoice}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>📄 طباعة فاتورة للعميل</span>
            </button>

            {onDeleteTransaction && (
              <button
                type="button"
                onClick={() => onDeleteTransaction(transaction)}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition flex items-center gap-1.5"
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
