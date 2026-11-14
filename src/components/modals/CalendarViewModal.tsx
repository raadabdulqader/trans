import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  FileText, 
  Coins, 
  Wallet, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import { Transaction, Receipt, TreasuryTransaction, Customer, Employee, CompanyId, COMPANIES } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { Calendar, formatArabicDate, toDateString } from '../ui/calendar';

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  receipts: Receipt[];
  treasury: TreasuryTransaction[];
  customers: Customer[];
  employees: Employee[];
  onSelectTransaction?: (tx: Transaction) => void;
}

export const CalendarViewModal: React.FC<CalendarViewModalProps> = ({
  isOpen,
  onClose,
  transactions,
  receipts,
  treasury,
  customers,
  employees,
  onSelectTransaction,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(toDateString(new Date()));
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'bills' | 'receipts' | 'treasury'>('all');

  // Filter items for the selected date
  const dayTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (companyFilter !== 'all' && (t.companyId || 'naqaa_basra') !== companyFilter) return false;
      const tDate = t.date || (t.createdAt ? t.createdAt.split('T')[0] : '');
      return tDate === selectedDate;
    });
  }, [transactions, selectedDate, companyFilter]);

  const dayReceipts = useMemo(() => {
    return receipts.filter(r => {
      const bill = transactions.find(t => t.id === r.billId);
      const rComp = r.companyId || bill?.companyId || 'naqaa_basra';
      if (companyFilter !== 'all' && rComp !== companyFilter) return false;
      return r.date === selectedDate;
    });
  }, [receipts, transactions, selectedDate, companyFilter]);

  const dayTreasury = useMemo(() => {
    return treasury.filter(t => {
      if (companyFilter !== 'all' && t.companyId !== 'shared' && t.companyId !== companyFilter) return false;
      return t.date === selectedDate;
    });
  }, [treasury, selectedDate, companyFilter]);

  // Aggregate day financials
  const dayCollected = dayReceipts
    .filter(r => (r.type === 'deposit' || r.type === 'payment') && r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const dayAdvances = dayReceipts
    .filter(r => r.type === 'advance' && r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const dayTreasuryDeposits = dayTreasury
    .filter(t => t.type === 'deposit' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const dayTreasuryWithdrawals = dayTreasury
    .filter(t => t.type === 'withdrawal' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  التقويم الكمركي والمالي اليومي
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Shadcn Calendar View
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة مواعيد استلام البوالص، سندات القبض، سلف المخلصين، وحركات الصندوق حسب اليوم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Company Filter */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">🏢 جميع الشركات</option>
              <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
              <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Calendar on Left/Right + Selected Date Agenda on the other) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Calendar Picker Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                showPresets={true}
                showYearDropdown={true}
                className="w-full"
              />
            </div>

            {/* Quick KPI for the day */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">مقبوضات اليوم:</span>
                <strong className="text-emerald-400 font-mono font-bold text-sm" dir="ltr">
                  {formatCurrency(dayCollected + dayTreasuryDeposits)}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">مصروفات وسلف اليوم:</span>
                <strong className="text-rose-400 font-mono font-bold text-sm" dir="ltr">
                  {formatCurrency(dayAdvances + dayTreasuryWithdrawals)}
                </strong>
              </div>
            </div>
          </div>

          {/* Day's Agenda & Detailed Records (7 cols) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            
            {/* Header of selected day */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">سجل المعاملات والعمليات ليوم:</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-400">📅</span>
                  <span>{formatArabicDate(selectedDate)}</span>
                  <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {selectedDate}
                  </span>
                </h3>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2 py-1 rounded-lg transition ${
                    activeCategory === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الكل ({dayTransactions.length + dayReceipts.length + dayTreasury.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('bills')}
                  className={`px-2 py-1 rounded-lg transition ${
                    activeCategory === 'bills' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  بوالص ({dayTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('receipts')}
                  className={`px-2 py-1 rounded-lg transition ${
                    activeCategory === 'receipts' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  وصولات ({dayReceipts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('treasury')}
                  className={`px-2 py-1 rounded-lg transition ${
                    activeCategory === 'treasury' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الصندوق ({dayTreasury.length})
                </button>
              </div>
            </div>

            {/* List of items */}
            <div className="flex-1 max-h-[460px] overflow-y-auto space-y-2.5 pr-1 text-xs">
              
              {/* Transactions */}
              {(activeCategory === 'all' || activeCategory === 'bills') && dayTransactions.map(tx => {
                const cust = customers.find(c => c.id === tx.customerId);
                const emp = employees.find(e => e.id === tx.employeeId);
                const comp = COMPANIES[tx.companyId || 'naqaa_basra'];

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      onSelectTransaction?.(tx);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                        🚢
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition">
                            {tx.billNo}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${comp.badgeClass}`}>
                            {comp.shortName}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            tx.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {tx.status === 'completed' ? 'منجزة' : tx.status === 'cancelled' ? 'ملغاة' : 'قيد الإجراء'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          الزبون: <strong className="text-slate-300">{cust?.name || '—'}</strong> • المخلص: {emp?.name || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <div className="font-bold text-slate-200">{formatCurrency(tx.totalAmount)}</div>
                      <div className="text-[10px] text-slate-500">حاويات: {tx.containers.length}</div>
                    </div>
                  </div>
                );
              })}

              {/* Receipts */}
              {(activeCategory === 'all' || activeCategory === 'receipts') && dayReceipts.map(rcpt => {
                const bill = transactions.find(t => t.id === rcpt.billId);
                const isDeposit = rcpt.type === 'deposit' || rcpt.type === 'payment';

                return (
                  <div
                    key={rcpt.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isDeposit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isDeposit ? <Wallet className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{rcpt.receiptNo}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400">
                            {rcpt.type === 'payment' ? 'دفعة زبون' : rcpt.type === 'deposit' ? 'دفعة أولى' : rcpt.type === 'advance' ? 'سلفة مخلص' : 'تسوية'}
                          </span>
                          {bill && (
                            <span className="text-[10px] font-mono text-cyan-400">
                              بوليصة: {bill.billNo}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                          {rcpt.notes || 'سند مسجل في النظام'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <div className={`font-bold ${isDeposit ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatCurrency(rcpt.amount)}
                      </div>
                      {rcpt.status === 'cancelled' && (
                        <div className="text-[10px] text-rose-400 font-bold">ملغي دفترياً</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Treasury Transactions */}
              {(activeCategory === 'all' || activeCategory === 'treasury') && dayTreasury.map(tr => {
                const isDeposit = tr.type === 'deposit';

                return (
                  <div
                    key={tr.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isDeposit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{tr.voucherNo}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                            {tr.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {tr.description} (الجهة: {tr.partyName || 'صندوق الشركة'})
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <div className={`font-bold ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(tr.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {dayTransactions.length === 0 && dayReceipts.length === 0 && dayTreasury.length === 0 && (
                <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl text-slate-500 space-y-2 my-auto">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs font-semibold text-slate-400">
                    لا توجد بوالص أو وصولات أو حركات صندوق مسجلة بتاريخ {selectedDate}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    يمكنك اختيار يوم آخر من التقويم بالأعلى أو الانتقال إلى اليوم عبر زر "اليوم"
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
