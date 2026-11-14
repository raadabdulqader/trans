'use client';

import React, { useState } from 'react';
import { Plus, Receipt as ReceiptIcon, Trash2, Printer, Filter, Ban, Info, ShieldAlert, CheckCircle2, DollarSign, Coins } from 'lucide-react';
import { Receipt, Transaction, Customer, Employee, AppUser, CompanyId, COMPANIES, Currency } from '../types/customs';
import { formatCurrency } from '../utils/storage';

interface ReceiptsViewProps {
  receipts: Receipt[];
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  currentUser: AppUser;
  exchangeRate?: number;
  onAddReceipt: () => void;
  onDeleteReceipt: (rcpt: Receipt) => void;
  onPrintVoucher: (rcpt: Receipt) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  transactions,
  customers,
  employees,
  currentUser,
  exchangeRate = 1500,
  onAddReceipt,
  onDeleteReceipt,
  onPrintVoucher,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [billFilter, setBillFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'IQD' | 'USD'>('all');

  const activeCount = receipts.filter(r => r.status !== 'cancelled').length;
  const cancelledCount = receipts.filter(r => r.status === 'cancelled').length;

  const filteredReceipts = receipts.filter(r => {
    const tx = transactions.find(t => t.id === r.billId);
    const receiptCompany = r.companyId || (tx ? tx.companyId : null) || 'naqaa_basra';
    const receiptCurrency: Currency = r.currency || (tx ? tx.currency : undefined) || 'IQD';

    if (companyFilter !== 'all' && receiptCompany !== companyFilter) return false;
    if (currencyFilter !== 'all' && receiptCurrency !== currencyFilter) return false;
    if (statusFilter === 'active' && r.status === 'cancelled') return false;
    if (statusFilter === 'cancelled' && r.status !== 'cancelled') return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (billFilter !== 'all' && r.billId !== billFilter) return false;
    return true;
  });

  const getTypeLabel = (type: Receipt['type']) => {
    switch (type) {
      case 'deposit':
        return { text: 'دفعة أولى (مقدم)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'payment':
        return { text: 'دفعة من الزبون', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'advance':
        return { text: 'سلفة للمخلص', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'settlement':
        return { text: 'تسوية حساب سلفة', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
  };

  // Financial metrics for receipts
  const activeReceiptsList = receipts.filter(r => r.status !== 'cancelled');
  const totalCollectionsIQD = activeReceiptsList
    .filter(r => {
      const tx = transactions.find(t => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return (r.type === 'deposit' || r.type === 'payment') && curr === 'IQD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalCollectionsUSD = activeReceiptsList
    .filter(r => {
      const tx = transactions.find(t => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return (r.type === 'deposit' || r.type === 'payment') && curr === 'USD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalAdvancesIQD = activeReceiptsList
    .filter(r => {
      const tx = transactions.find(t => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return r.type === 'advance' && curr === 'IQD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalAdvancesUSD = activeReceiptsList
    .filter(r => {
      const tx = transactions.find(t => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return r.type === 'advance' && curr === 'USD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  // Transfer & Exchange Commissions in Receipts
  const totalCommissionsCount = activeReceiptsList.filter(r => r.hasCommission && (r.commissionAmount || 0) > 0).length;
  const totalCommissionsSumUSD = activeReceiptsList
    .filter(r => r.hasCommission && (r.commissionCurrency || r.currency) === 'USD')
    .reduce((s, r) => s + (r.commissionAmount || 0), 0);
  const totalCommissionsSumIQD = activeReceiptsList
    .filter(r => r.hasCommission && (r.commissionCurrency || r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.commissionAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Dual Currency & Commissions Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IQD Collections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>مقبوضات الزبائن (دينار عراقي)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              IQD
            </span>
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2 font-mono" dir="ltr">
            {formatCurrency(totalCollectionsIQD, 'IQD')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            دفعات أولى وسداد حسابات بالدينار
          </div>
        </div>

        {/* USD Collections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>مقبوضات الزبائن (دولار أمريكي)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
              USD $
            </span>
          </div>
          <div className="text-xl font-black text-cyan-400 mt-2 font-mono" dir="ltr">
            {formatCurrency(totalCollectionsUSD, 'USD')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>المعادل:</span>
            <strong className="text-cyan-300 font-mono">
              ≈ {new Intl.NumberFormat('ar-IQ').format(totalCollectionsUSD * exchangeRate)} د.ع
            </strong>
          </div>
        </div>

        {/* Advances */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <ReceiptIcon className="w-4 h-4 text-amber-400" />
              <span>إجمالي سلف المخلصين الميدانية</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              سلف كمركية
            </span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-2 font-mono" dir="ltr">
            {formatCurrency(totalAdvancesIQD, 'IQD')}
            {totalAdvancesUSD > 0 && (
              <span className="text-sm font-bold text-cyan-300 mr-2"> + ${totalAdvancesUSD.toLocaleString()}</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            سلف مصروفة لأجور الكمرك والموانئ
          </div>
        </div>

        {/* Commissions Card */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <span className="text-amber-400">🏷️</span>
              <span>عمولات التحويل والصرافة</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {totalCommissionsCount} حركة
            </span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-2 font-mono" dir="ltr">
            {totalCommissionsSumUSD > 0 ? (
              <div className="flex flex-col">
                <span>${totalCommissionsSumUSD.toLocaleString()}</span>
                {totalCommissionsSumIQD > 0 && (
                  <span className="text-xs text-slate-300 font-normal">
                    + {formatCurrency(totalCommissionsSumIQD, 'IQD')}
                  </span>
                )}
              </div>
            ) : totalCommissionsSumIQD > 0 ? (
              formatCurrency(totalCommissionsSumIQD, 'IQD')
            ) : (
              '0 د.ع'
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            إجمالي عمولات الحوالات والصيرفة
          </div>
        </div>
      </div>

      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          {(currentUser.role === 'admin' || currentUser.permissions.createReceipts !== false) && (
            <button
              onClick={onAddReceipt}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سند / وصل جديد</span>
            </button>
          )}

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل ({receipts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              النشطة ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ban className="w-3 h-3 text-rose-400" />
              الملغاة دفترياً ({cancelledCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Filter */}
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-semibold"
            >
              <option value="all">💵 كافة العملات</option>
              <option value="IQD">🇮🇶 دينار عراقي (IQD)</option>
              <option value="USD">🇺🇸 دولار أمريكي (USD)</option>
            </select>

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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">جميع أنواع الوصولات</option>
              <option value="deposit">دفعة أولى (مقدم)</option>
              <option value="payment">دفعة من الزبون</option>
              <option value="advance">سلفة للمخلص</option>
              <option value="settlement">تسوية سلفة</option>
            </select>

            <select
              value={billFilter}
              onChange={(e) => setBillFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition max-w-[200px]"
            >
              <option value="all">جميع البوالص</option>
              {transactions.map(t => (
                <option key={t.id} value={t.id}>{t.billNo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          المعروض: <strong className="text-emerald-400">{filteredReceipts.length}</strong>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3.5 px-4">رقم الوصل</th>
                <th className="py-3.5 px-4">نوع السند</th>
                <th className="py-3.5 px-4">رقم البوليصة</th>
                <th className="py-3.5 px-4">الطرف (الزبون / المخلص)</th>
                <th className="py-3.5 px-4">المبلغ والعملة</th>
                <th className="py-3.5 px-4">الحالة الدفترية</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">ملاحظات وسبب الإلغاء</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد وصولات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcpt) => {
                  const tx = transactions.find(t => t.id === rcpt.billId);
                  const cust = rcpt.customerId ? customers.find(c => c.id === rcpt.customerId) : null;
                  const emp = rcpt.employeeId ? employees.find(e => e.id === rcpt.employeeId) : null;
                  const badge = getTypeLabel(rcpt.type);
                  const isCancelled = rcpt.status === 'cancelled';
                  const receiptCompany = rcpt.companyId || (tx ? tx.companyId : null) || 'naqaa_basra';
                  const comp = COMPANIES[receiptCompany];
                  const receiptCurrency: Currency = rcpt.currency || (tx ? tx.currency : undefined) || 'IQD';

                  return (
                    <tr 
                      key={rcpt.id} 
                      className={`transition ${
                        isCancelled 
                          ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-l-rose-500 text-slate-400' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border shrink-0 ${comp.badgeColor}`}>
                            {comp.shortName}
                          </span>
                          <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>
                            {rcpt.receiptNo}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {tx?.billNo || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {cust ? cust.name : emp ? `المخلص: ${emp.name}` : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm" dir="ltr">
                        {isCancelled ? (
                          <div className="flex flex-col">
                            <span className="line-through text-slate-500">{formatCurrency(rcpt.amount, receiptCurrency)}</span>
                            <span className="text-[10px] text-rose-400 font-normal font-sans">تم تحييد الأثر المالي</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className={receiptCurrency === 'USD' ? 'text-cyan-400 font-extrabold text-sm' : 'text-emerald-400 text-sm'}>
                                {formatCurrency(rcpt.amount, receiptCurrency)}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold border shrink-0 ${
                                receiptCurrency === 'USD' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {receiptCurrency === 'USD' ? '$ دولار' : 'د.ع'}
                              </span>
                            </div>
                            {receiptCurrency === 'USD' && (
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(rcpt.amount * (exchangeRate || rcpt.exchangeRate || 1500)))} د.ع
                              </span>
                            )}
                            {rcpt.hasCommission && (rcpt.commissionAmount || 0) > 0 && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                                <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded font-sans font-bold">
                                  عمولة: {formatCurrency(rcpt.commissionAmount || 0, rcpt.commissionCurrency || receiptCurrency)}
                                </span>
                                <span className="text-[9px] text-slate-400 font-sans">
                                  ({rcpt.commissionBearer === 'company' ? 'المكتب' : 'الطرف'})
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <Ban className="w-3 h-3 text-rose-400" />
                            <span>ملغي دفترياً</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>قيد ساري</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {rcpt.date}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 max-w-[220px]">
                        {isCancelled ? (
                          <div className="space-y-0.5">
                            <div className="text-rose-300 font-semibold text-[11px] flex items-center gap-1">
                              <Info className="w-3 h-3 shrink-0" />
                              <span className="truncate">السبب: {rcpt.cancelReason || 'إلغاء دفتري'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              بواسطة: {rcpt.cancelledBy || 'المسؤول'} • {rcpt.cancelledAt?.split('T')[0] || ''}
                            </div>
                          </div>
                        ) : (
                          <span className="truncate block">{rcpt.notes || '—'}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
                            <button
                              onClick={() => onPrintVoucher(rcpt)}
                              title={isCancelled ? "طباعة السند مع ختم الإلغاء" : "طباعة سند القبض / الصرف"}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteReceipt(rcpt)}
                            title={isCancelled ? "إجراءات السند الملغي / حذف نهائي" : "إلغاء السند دفترياً"}
                            className={`p-1.5 rounded-lg transition ${
                              isCancelled
                                ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                            }`}
                          >
                            {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
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
