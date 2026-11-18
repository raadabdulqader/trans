'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Edit2, 
  Trash2, 
  Boxes, 
  Wallet, 
  Coins, 
  Clock, 
  Calendar,
  CheckCircle2, 
  AlertTriangle,
  Eye,
  CheckCheck,
  Building2,
  HardHat,
  Ship,
  FileCheck2,
  Truck,
  ChevronDown
} from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, AppUser, CompanyId, COMPANIES, TreasuryAttachment } from '../types/customs';
import { formatCurrency, getBillFinancials } from '../utils/storage';
import { Badge } from './ui/badge';
import { CUSTOMS_PRESET_NOTES } from '../utils/customsNotes';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './ui/popover';

interface TransactionsViewProps {
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  currentUser: AppUser;
  searchTerm: string;
  selectedCustomerId?: string;
  exchangeRate?: number;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onOpenTransactionDetail: (tx: Transaction) => void;
  onOpenQuickAdvance: (tx: Transaction) => void;
  onOpenQuickPayment: (tx: Transaction) => void;
  onOpenQuickSettlement: (tx: Transaction, empId: string) => void;
  onOpenAddExpense?: (tx: Transaction) => void;
  onTryChangeStatus: (tx: Transaction, newStatus: Transaction['status']) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  customers,
  employees,
  receipts,
  currentUser,
  searchTerm,
  selectedCustomerId,
  exchangeRate = 1500,
  onViewArchive,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenTransactionDetail,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenQuickSettlement,
  onOpenAddExpense,
  onTryChangeStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'issue' | 'cancelled'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>(selectedCustomerId || 'all');
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId>('all');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTransactions = transactions.filter(t => {
    // Company Filter
    if (companyFilter !== 'all' && (t.companyId || 'naqaa_basra') !== companyFilter) return false;

    // Status Filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Customer Filter
    if (customerFilter !== 'all' && t.customerId !== customerFilter) return false;

    // Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const cust = customers.find(c => c.id === t.customerId);
      const emp = employees.find(e => e.id === t.employeeId);
      const matchesBill = t.billNo.toLowerCase().includes(q);
      const matchesJob = (t.jobNumber || '').toLowerCase().includes(q);
      const matchesDestination = (t.containerDestination || '').toLowerCase().includes(q);
      const matchesGoods = t.goodsType?.toLowerCase().includes(q);
      const matchesCustomer = cust?.name.toLowerCase().includes(q);
      const matchesEmp = emp?.name.toLowerCase().includes(q);
      const matchesContainers = t.containers.some(c => c.toLowerCase().includes(q));
      const matchesCreated = (t.createdAt || '').toLowerCase().includes(q);
      const matchesNotes = (t.notes || '').toLowerCase().includes(q);

      if (!matchesBill && !matchesJob && !matchesDestination && !matchesGoods && !matchesCustomer && !matchesEmp && !matchesContainers && !matchesCreated && !matchesNotes) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          {currentUser.permissions.editTx && (
            <button
              onClick={onAddTransaction}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>بوليصة / فاتورة جديدة</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">🏢 جميع الشركات</option>
              <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
              <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">⏳ قيد التنفيذ</option>
              <option value="completed">✅ منجزة</option>
              <option value="issue">⚠️ معلقة</option>
              <option value="cancelled">❌ ملغاة دفترياً</option>
            </select>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition max-w-[200px]"
            >
              <option value="all">جميع الزبائن</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          إجمالي النتائج: <strong className="text-emerald-400">{filteredTransactions.length}</strong> بوليصة
        </div>
      </div>

      {/* Transactions Table - 2 Rows per Declaration */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3.5 px-4 w-[28%]">البوليصة والبيانات الأساسية</th>
                <th className="py-3.5 px-4 w-[20%]">الزبون التجاري / المخلص</th>
                <th className="py-3.5 px-4 w-[13%]">المبلغ الكلي</th>
                <th className="py-3.5 px-4 w-[13%]">المسدد الإجمالي</th>
                <th className="py-3.5 px-4 w-[12%]">المتبقي المستحق</th>
                <th className="py-3.5 px-4 text-center w-[14%]">إجراءات المعاملة</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-xl mx-auto">
                        📋
                      </div>
                      <div className="text-slate-300 font-bold">لا توجد بوالص مطابقة للفلاتر الحالية</div>
                      <p className="text-[11px] text-slate-500">جرب تغيير حالة المعاملة أو خيارات البحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const cust = customers.find(c => c.id === tx.customerId);
                  const emp = employees.find(e => e.id === tx.employeeId);
                  const fin = getBillFinancials(tx, receipts, exchangeRate);
                  const comp = COMPANIES[tx.companyId || 'naqaa_basra'];

                  return (
                    <React.Fragment key={tx.id}>
                      {/* الصف الأول (Row 1): هوية البوليصة، الزبون، الحسابات المالية، وأزرار الإجراءات */}
                      <tr className="bg-slate-900 hover:bg-slate-850/80 transition-colors border-b border-slate-800/80">
                        {/* Col 1: رقم البوليصة + شارة الشركة + محفز البوب أوفر التفاعلي لعرض كافة معلومات ومراحل البوليصة */}
                        <td className="pt-3.5 pb-2 px-4 align-top">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* شارة الشركة التابعة */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border shrink-0 ${comp.badgeColor}`}>
                              {comp.shortName}
                            </span>

                            {/* محفز البوب أوفر التفاعلي - رقم البوليصة فقط بدون أي نصوص إضافية */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-750 hover:border-emerald-500/50 font-mono font-black text-sm transition cursor-pointer shadow-xs group select-none"
                                  title="انقر لعرض كافة معلومات ومراحل البوليصة"
                                >
                                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>{tx.billNo}</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
                                </button>
                              </PopoverTrigger>

                              <PopoverContent
                                align="start"
                                alignOffset={-16}
                                side="bottom"
                                sideOffset={8}
                                className="w-[95vw] md:w-[860px] lg:w-[910px] xl:w-[920px] max-w-[95vw] p-3 sm:p-3.5 bg-slate-900 border border-slate-750 shadow-2xl rounded-2xl text-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto"
                                dir="rtl"
                              >
                                {/* 1. رأس بطاقة البوب أوفر الأفقي: الشركة + رقم البوليصة + Job No + الحالة التشغيلية */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border shrink-0 ${comp.badgeColor}`}>
                                      {comp.shortName}
                                    </span>
                                    <span className="font-mono font-black text-sm text-emerald-400">
                                      {tx.billNo}
                                    </span>
                                    {tx.jobNumber && (
                                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                                        Job: {tx.jobNumber}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-400 font-medium">الحالة التشغيلية:</span>
                                      <select
                                        value={tx.status}
                                        disabled={!currentUser.permissions.editTx}
                                        onChange={(e) => onTryChangeStatus(tx, e.target.value as any)}
                                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer ${
                                          tx.status === 'completed'
                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                            : tx.status === 'pending'
                                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                            : tx.status === 'cancelled'
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                        }`}
                                      >
                                        <option value="pending" className="bg-slate-900 text-amber-400">⏳ قيد التنفيذ</option>
                                        <option value="completed" className="bg-slate-900 text-emerald-400">✅ منجزة</option>
                                        <option value="issue" className="bg-slate-900 text-rose-400">⚠️ معلقة</option>
                                        <option value="cancelled" className="bg-slate-900 text-rose-300">❌ ملغاة دفترياً</option>
                                      </select>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                      معلومات الشحنة والفاتورة
                                    </span>
                                  </div>
                                </div>

                                {/* 2. الجسم الرئيسي للبوب أوفر - شبكة أفقية ثلاثية الأعمدة لتوزيع متوازن ومضغوط عمودياً */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 items-stretch">
                                  {/* العمود الأيمن (العمود 1): هوية البضاعة، التواريخ، المخلص المسؤول والحاويات */}
                                  <div className="space-y-2 flex flex-col justify-between">
                                    {/* بطاقة نوع البضاعة والتواريخ */}
                                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                                          <span>📦</span>
                                          <span>نوع البضاعة والوصف:</span>
                                        </span>
                                        <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs truncate max-w-[170px]" title={tx.goodsType || 'بضاعة عامة'}>
                                          {tx.goodsType || 'بضاعة عامة'}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                                        <span className="flex items-center gap-1 font-mono">
                                          <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                                          <span>إنشاء: <strong className="text-slate-200">{tx.createdAt || tx.date || '—'}</strong></span>
                                        </span>
                                        <span className="flex items-center gap-1 font-mono">
                                          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                                          <span>استلام: <strong className="text-slate-200">{tx.date || '—'}</strong></span>
                                        </span>
                                      </div>
                                    </div>

                                    {/* بطاقة المخلص والحاويات والوجهة */}
                                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                                          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                          <span>المخلص المسؤول:</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-white">{emp?.name || 'غير محدد'}</span>
                                          {emp?.phone && <span className="text-[10px] text-slate-400 font-mono" dir="ltr">({emp.phone})</span>}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 flex-wrap gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                          <span className="text-slate-300 font-bold text-[11px]">{tx.containers.length} حاويات</span>
                                          {tx.containerDestination && (
                                            <span className="text-cyan-300 bg-cyan-950/40 px-2 py-0.2 rounded border border-cyan-800/60 text-[10px] font-bold">
                                              📍 {tx.containerDestination}
                                            </span>
                                          )}
                                        </div>
                                        {tx.containers.length > 0 && (
                                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                                            {tx.containers.slice(0, 3).map((cnt, i) => (
                                              <span key={i} className="px-1.5 py-0.2 bg-slate-900 border border-slate-700/80 rounded text-slate-300">
                                                {cnt}
                                              </span>
                                            ))}
                                            {tx.containers.length > 3 && (
                                              <span className="px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                                                +{tx.containers.length - 3}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* العمود الأوسط (العمود 2): المراحل والتواريخ التشغيلية الأربعة وفترة السماح */}
                                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between">
                                    <div className="text-[11px] text-slate-300 font-bold flex items-center justify-between">
                                      <span className="flex items-center gap-1 text-slate-200">
                                        <span>⏱️</span>
                                        <span>المراحل والتواريخ التشغيلية:</span>
                                      </span>
                                      {tx.freeTimeDays && (
                                        <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                                          ⏳ فترة السماح: {tx.freeTimeDays} يوم
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                                      <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.deliveryOrderDate ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                                        <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                                          <span>📄</span>
                                          <span>أمر التسليم:</span>
                                        </span>
                                        <span className="font-bold text-slate-200">{tx.deliveryOrderDate || 'غير محدد'}</span>
                                      </div>

                                      <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.clearanceDate ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                                        <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                                          <span>🏛️</span>
                                          <span>التخليص الكمركي:</span>
                                        </span>
                                        <span className="font-bold text-slate-200">{tx.clearanceDate || 'غير محدد'}</span>
                                      </div>

                                      <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.exitDate ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                                        <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                                          <span>🚛</span>
                                          <span>خروج الشحنة:</span>
                                        </span>
                                        <span className="font-bold text-slate-200">{tx.exitDate || 'غير محدد'}</span>
                                      </div>

                                      <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.containerReturnDate ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                                        <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                                          <span>🔄</span>
                                          <span>إعادة الحاوية:</span>
                                        </span>
                                        <span className="font-bold text-slate-200">{tx.containerReturnDate || 'غير محدد'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* العمود الأيسر (العمود 3): أجور النقل والشاحنات + الملاحظات والوكالة */}
                                  <div className="space-y-2 flex flex-col justify-between">
                                    {/* بطاقة أجور النقل البري والنواقل */}
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-amber-300 font-black text-xs flex items-center gap-1.5">
                                          <Truck className="w-4 h-4 text-amber-400" />
                                          <span>أجور نقل البضائع والشاحنات:</span>
                                        </span>
                                        <span className="font-mono font-black text-xs sm:text-sm text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40" dir="ltr">
                                          {(fin.totalCarrierCost || 0) > 0 ? formatCurrency(fin.totalCarrierCost || 0, tx.currency || 'IQD') : '0 (لا توجد أجور نقل)'}
                                        </span>
                                      </div>

                                      {tx.transportTrips && tx.transportTrips.length > 0 ? (
                                        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-amber-500/20">
                                          <span>عدد الشاحنات: <strong className="text-white font-mono">{tx.transportTrips.reduce((s, t) => s + (Number(t.truckCount) || 1), 0)} شاحنة</strong> ({tx.transportTrips.length} نقلة)</span>
                                          {(tx.transportDocument || tx.transportTrips?.some(t => t.transportDocument)) && onViewArchive && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const doc = tx.transportDocument || tx.transportTrips?.find(t => t.transportDocument)?.transportDocument;
                                                if (doc) onViewArchive(doc, `وصل استلام النقل - بوليصة ${tx.billNo}`);
                                              }}
                                              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer"
                                            >
                                              <Eye className="w-3 h-3" />
                                              <span>معاينة وصل النقل</span>
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-slate-400">لا توجد نقلات أو شاحنات برية مسجلة لهذه البوليصة.</div>
                                      )}
                                    </div>

                                    {/* بطاقة الملاحظات والوكالة */}
                                    {(tx.notes || tx.agencyDocument || tx.cancelReason) ? (
                                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-[11px]">
                                        {tx.status === 'cancelled' && tx.cancelReason && (
                                          <div className="text-rose-400 font-bold">
                                            ⚠️ سبب الإلغاء: {tx.cancelReason}
                                          </div>
                                        )}
                                        {tx.notes && (
                                          <div className="text-slate-300">
                                            <span className="text-slate-400 font-bold block mb-0.5">💬 ملاحظات وتوجيهات:</span>
                                            <p className="line-clamp-2 text-slate-200">{tx.notes}</p>
                                          </div>
                                        )}
                                        {tx.agencyDocument && (
                                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                                            <span className="text-indigo-300 font-bold flex items-center gap-1">
                                              <FileCheck2 className="w-3.5 h-3.5" />
                                              <span>ورقة الوكالة الرسمية مؤرشفة</span>
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => onViewArchive && onViewArchive(tx.agencyDocument!, `ورقة الوكالة - بوليصة ${tx.billNo}`)}
                                              className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-500/40 cursor-pointer"
                                            >
                                              معاينة الوكالة
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 text-[10px] text-slate-500 flex items-center gap-1.5">
                                        <span>💬</span>
                                        <span>لا توجد ملاحظات أو توجيهات مسجلة</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>

                            {/* شارة رقم المعاملة الداخلي (Job No) */}
                            {tx.jobNumber && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shrink-0" title={`رقم المعاملة الداخلي: ${tx.jobNumber}`}>
                                Job: {tx.jobNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Col 2: الزبون (الشركة) */}
                        <td className="pt-3.5 pb-1.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{cust?.name || 'غير محدد'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate" dir="ltr">
                            {cust?.phone || cust?.contact || '—'}
                          </div>
                        </td>

                        {/* Col 3: المبلغ الكلي */}
                        <td className="pt-3.5 pb-1.5 px-4 align-top">
                          <div className="text-[10px] text-slate-400 font-semibold mb-0.5">
                            المبلغ الكلي
                          </div>
                          <div className="font-mono font-bold text-slate-100 text-sm" dir="ltr">
                            {tx.isMixedCurrency ? (
                              <div className="flex flex-col text-xs leading-tight">
                                <span>{formatCurrency(fin.totalAmount || 0, 'IQD')}</span>
                                <span className="text-cyan-300">+{formatCurrency(fin.totalAmountUSD || 0, 'USD')}</span>
                              </div>
                            ) : (
                              formatCurrency(fin.totalAmount, tx.currency || 'IQD')
                            )}
                          </div>
                          {tx.currency === 'USD' && !tx.isMixedCurrency && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalAmount * exchangeRate))} د.ع
                            </div>
                          )}
                          {tx.isMixedCurrency && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                              ≈ {new Intl.NumberFormat('ar-IQ').format((fin.totalAmount || 0) + ((fin.totalAmountUSD || 0) * exchangeRate))} د.ع
                            </div>
                          )}
                        </td>

                        {/* Col 4: المسدد الإجمالي */}
                        <td className="pt-3.5 pb-1.5 px-4 align-top">
                          <div className="text-[10px] text-slate-400 font-semibold mb-0.5">المسدد من الزبون</div>
                          <div className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">
                            {tx.isMixedCurrency ? (
                              <div className="flex flex-col text-xs leading-tight">
                                <span>{formatCurrency(fin.totalCollected, 'IQD')}</span>
                                <span className="text-cyan-300">+{formatCurrency(fin.totalCollectedUSD || 0, 'USD')}</span>
                              </div>
                            ) : (
                              formatCurrency(fin.totalCollected, tx.currency || 'IQD')
                            )}
                          </div>
                          {/* Show actual currencies received if cross-currency or dual payment occurred */}
                          {!tx.isMixedCurrency &&
                            (((tx.currency === 'USD' && (fin.collectedInIQD || 0) > 0) ||
                              ((tx.currency || 'IQD') === 'IQD' && (fin.collectedInUSD || 0) > 0) ||
                              ((fin.collectedInUSD || 0) > 0 && (fin.collectedInIQD || 0) > 0))) && (
                            <div className="text-[10px] text-cyan-300 font-mono mt-0.5" dir="ltr">
                              {(fin.collectedInUSD || 0) > 0 ? `$${(fin.collectedInUSD || 0).toLocaleString()}` : ''}
                              {(fin.collectedInUSD || 0) > 0 && (fin.collectedInIQD || 0) > 0 ? ' + ' : ''}
                              {(fin.collectedInIQD || 0) > 0 ? `${new Intl.NumberFormat('ar-IQ').format(fin.collectedInIQD || 0)} د.ع` : ''}
                            </div>
                          )}
                          {/* Show commissions if any */}
                          {((fin.commissionsUSD || 0) > 0 || (fin.commissionsIQD || 0) > 0) && (
                            <div className="text-[10px] text-amber-300 font-mono mt-0.5 flex flex-wrap items-center gap-1">
                              <span className="bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded font-sans">
                                عمولات:{' '}
                                {(fin.commissionsUSD || 0) > 0 ? `$${fin.commissionsUSD}` : ''}
                                {(fin.commissionsUSD || 0) > 0 && (fin.commissionsIQD || 0) > 0 ? ' + ' : ''}
                                {(fin.commissionsIQD || 0) > 0 ? `${new Intl.NumberFormat('ar-IQ').format(fin.commissionsIQD || 0)} د.ع` : ''}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Col 5: المتبقي المستحق */}
                        <td className="pt-3.5 pb-1.5 px-4 align-top">
                          <div className="text-[10px] text-slate-400 font-semibold mb-0.5">المتبقي على الزبون</div>
                          <div className="font-mono font-bold text-sm" dir="ltr">
                            {tx.isMixedCurrency ? (
                              (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0) ? (
                                <div className="flex flex-col text-xs leading-tight text-amber-400">
                                  <span>{formatCurrency(fin.remainingAmount, 'IQD')}</span>
                                  <span className="text-cyan-400">+{formatCurrency(fin.remainingAmountUSD || 0, 'USD')}</span>
                                </div>
                              ) : (
                                <span className="text-emerald-400 font-semibold">0 (خالص)</span>
                              )
                            ) : fin.remainingAmount > 0 ? (
                              <span className="text-amber-400">{formatCurrency(fin.remainingAmount, tx.currency || 'IQD')}</span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">0 (خالص)</span>
                            )}
                          </div>
                          {tx.currency === 'USD' && fin.remainingAmount > 0 && !tx.isMixedCurrency && (
                            <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                              ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.remainingAmount * exchangeRate))} د.ع
                            </div>
                          )}
                          {(fin.customerCommissionInBillCurr || 0) > 0 && (
                            <div className="text-[9px] text-amber-300/90 mt-0.5">
                              شامل عمولة على الزبون ({formatCurrency(fin.customerCommissionInBillCurr || 0, tx.currency || 'IQD')})
                            </div>
                          )}
                        </td>

                        {/* Col 6: الإجراءات السريعة */}
                        <td className="pt-3.5 pb-1.5 px-4 text-center align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenTransactionDetail(tx)}
                              title="عرض تفاصيل البوليصة"
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {(currentUser.role === 'admin' || currentUser.permissions.disburseAdvance !== false) && (
                              <button
                                onClick={() => onOpenQuickAdvance(tx)}
                                title="صرف سلفة للمخلص على هذه البوليصة"
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                              >
                                <Coins className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(() => {
                              const isFullyPaid = tx.isMixedCurrency
                                ? (fin.remainingAmount <= 0 && (fin.remainingAmountUSD || 0) <= 0)
                                : fin.remainingAmount <= 0;
                              return (
                                (currentUser.role === 'admin' || currentUser.permissions.createReceipts !== false) && (
                                  <button
                                    onClick={() => onOpenQuickPayment(tx)}
                                    disabled={isFullyPaid}
                                    title={isFullyPaid ? 'البوليصة مسددة بالكامل (خالصة)' : 'تسجيل دفعة جديدة من الزبون'}
                                    className={`p-1.5 rounded-xl transition ${
                                      isFullyPaid
                                        ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                                    }`}
                                  >
                                    <Wallet className="w-3.5 h-3.5" />
                                  </button>
                                )
                              );
                            })()}

                            {/* زر صرف مصروف كمركي / تشغيلي على البوليصة */}
                            {onOpenAddExpense && (
                              <button
                                onClick={() => onOpenAddExpense(tx)}
                                disabled={tx.status === 'cancelled'}
                                title="صرف مصروف كمركي أو تشغيلي على هذه البوليصة (رسوم، موانئ، سونار، فحص، عمال، نثريات)"
                                className={`p-1.5 rounded-xl transition ${
                                  tx.status === 'cancelled'
                                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                                    : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30'
                                }`}
                              >
                                <span className="text-xs">💸</span>
                              </button>
                            )}

                            {(currentUser.role === 'admin' || currentUser.permissions.editTx) && (
                              <button
                                onClick={() => onEditTransaction(tx)}
                                title="تعديل البوليصة"
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteTransaction(tx)}
                              title="حذف البوليصة"
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* الصف الثاني (Row 2): مخفي تماماً افتراضياً ويظهر فقط عند الرغبة في توسيع الصف من البوب أوفر */}
                      {expandedRowIds.has(tx.id) && (
                        <tr className="bg-slate-950/60 hover:bg-slate-850/60 transition-colors border-b border-slate-800/80 text-[11px] animate-in fade-in">
                          {/* Cell 1: تاريخ الإنشاء + تاريخ الاستلام */}
                          <td className="pt-1 pb-3 px-4">
                            <div className="flex flex-wrap items-center gap-2 text-slate-400">
                              <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
                                <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="text-slate-400">إنشاء:</span>
                                <span className="font-semibold text-slate-200">{tx.createdAt || tx.date || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-400">استلام:</span>
                                <span className="text-slate-300">{tx.date || '—'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Cell 2: المخلص الكمركي المسؤول */}
                          <td className="pt-1 pb-3 px-4">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-semibold text-slate-200">{emp?.name || 'غير محدد'}</span>
                            </div>
                            {emp?.phone && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5" dir="ltr">
                                {emp.phone}
                              </div>
                            )}
                          </td>

                          {/* Cell 3 & 4: الحاويات وأرقامها الفعلية + النقل البري (تمتد لعمودين colSpan={2}) */}
                          <td colSpan={2} className="pt-1 pb-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-lg font-bold text-[10px] shrink-0">
                                <Ship className="w-3 h-3" />
                                <span>{tx.containers.length} حاويات</span>
                              </div>
                              {tx.containerDestination && (
                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 text-cyan-300 px-2 py-0.5 rounded-lg text-[10px] shrink-0 font-medium" title={`وجهة الحاوية: ${tx.containerDestination}`}>
                                  <span>📍</span>
                                  <span>{tx.containerDestination}</span>
                                </div>
                              )}
                              {tx.containers.length > 0 ? (
                                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                                  {tx.containers.slice(0, 4).map((cnt, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700/80 rounded text-slate-300">
                                      {cnt}
                                    </span>
                                  ))}
                                  {tx.containers.length > 4 && (
                                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-semibold">
                                      +{tx.containers.length - 4} أخرى
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-normal">لا توجد أرقام حاويات</span>
                              )}

                              {tx.transportTrips && tx.transportTrips.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold text-[10px] shrink-0">
                                  <Truck className="w-3 h-3" />
                                  <span>
                                    نقل بري: {tx.transportTrips.reduce((s, t) => s + (Number(t.truckCount) || 1), 0)} شاحنة
                                  </span>
                                </div>
                              )}

                              {(tx.transportDocument || tx.transportTrips?.some(t => t.transportDocument)) && onViewArchive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const doc = tx.transportDocument || tx.transportTrips?.find(t => t.transportDocument)?.transportDocument;
                                    if (doc) onViewArchive(doc, `وصل استلام النقل - بوليصة ${tx.billNo}`);
                                  }}
                                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-lg font-bold text-[10px] transition"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>وصل النقل</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Cell 5 & 6: حالة المعاملة والملاحظات (تمتد لعمودين colSpan={2}) */}
                          <td colSpan={2} className="pt-1 pb-3 px-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-medium">الحالة:</span>
                                <select
                                  value={tx.status}
                                  disabled={!currentUser.permissions.editTx}
                                  onChange={(e) => onTryChangeStatus(tx, e.target.value as any)}
                                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                                    tx.status === 'completed'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : tx.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      : tx.status === 'cancelled'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  }`}
                                >
                                  <option value="pending" className="bg-slate-900 text-amber-400">⏳ قيد التنفيذ</option>
                                  <option value="completed" className="bg-slate-900 text-emerald-400">✅ منجزة</option>
                                  <option value="issue" className="bg-slate-900 text-rose-400">⚠️ معلقة</option>
                                  <option value="cancelled" className="bg-slate-900 text-rose-300">❌ ملغاة دفترياً</option>
                                </select>
                              </div>

                              {tx.status === 'cancelled' && tx.cancelReason ? (
                                <div className="text-[10px] text-rose-400 truncate max-w-[200px]" title={tx.cancelReason}>
                                  ⚠️ سبب الإلغاء: {tx.cancelReason}
                                </div>
                              ) : tx.notes ? (
                                <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={tx.notes}>
                                  💬 {tx.notes}
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
