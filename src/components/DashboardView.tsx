'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Coins, 
  Wallet, 
  ArrowUpRight, 
  Building,
  UserCheck,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { Customer, Employee, Transaction, Receipt, TreasuryTransaction, CompanyId, COMPANIES } from '../types/customs';
import { formatCurrency, getBillFinancials, getEmployeeAdvances, getTreasuryFinancialSummary, normalizeExchangeRate } from '../utils/storage';

interface DashboardViewProps {
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  treasury?: TreasuryTransaction[];
  exchangeRate?: number;
  onUpdateExchangeRate?: (newRate: number, silent?: boolean) => void;
  onOpenExchangeRate?: () => void;
  onOpenTreasury?: () => void;
  onViewAllTransactions: () => void;
  onOpenTransactionDetail: (tx: Transaction) => void;
  onOpenQuickAdvance: (tx: Transaction) => void;
  onOpenQuickPayment: (tx: Transaction) => void;
  onOpenQuickSettlement: (tx: Transaction, empId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  customers,
  employees,
  receipts,
  treasury = [],
  exchangeRate = 1500,
  onUpdateExchangeRate,
  onOpenExchangeRate,
  onOpenTreasury,
  onViewAllTransactions,
  onOpenTransactionDetail,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenQuickSettlement,
}) => {
  const [rateInput, setRateInput] = useState<string>(String(normalizeExchangeRate(exchangeRate, 1500)));

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setRateInput(prev => {
        if (Number(prev) >= 100 && normalizeExchangeRate(prev, 1500) === normalizedProp) {
          return prev;
        }
        return String(normalizedProp);
      });
    }
  }, [exchangeRate]);

  const activeRate = normalizeExchangeRate(rateInput, normalizeExchangeRate(exchangeRate, 1500));

  // Stats
  const activeTransactions = transactions.filter(t => t.status !== 'cancelled');
  const totalCount = transactions.length;
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const issueCount = transactions.filter(t => t.status === 'issue').length;
  const cancelledCount = transactions.filter(t => t.status === 'cancelled').length;

  // Financials separated by currency (IQD & USD)
  let totalRevenueIQD = 0, totalCollectedIQD = 0;
  let totalRevenueUSD = 0, totalCollectedUSD = 0;

  // Dual Company Breakdown (separated by IQD & USD)
  let naqaaRevIQD = 0, naqaaColIQD = 0, naqaaRevUSD = 0, naqaaColUSD = 0, naqaaCount = 0;
  let sawtRevIQD = 0, sawtColIQD = 0, sawtRevUSD = 0, sawtColUSD = 0, sawtCount = 0;

  activeTransactions.forEach(tx => {
    const fin = getBillFinancials(tx, receipts, activeRate);
    const isUSD = fin.currency === 'USD';

    if (isUSD) {
      totalRevenueUSD += fin.totalAmount;
      totalCollectedUSD += fin.totalCollected;
    } else {
      totalRevenueIQD += fin.totalAmount;
      totalCollectedIQD += fin.totalCollected;
    }

    const comp = tx.companyId || 'naqaa_basra';
    if (comp === 'sawt_aljanoub') {
      if (isUSD) {
        sawtRevUSD += fin.totalAmount;
        sawtColUSD += fin.totalCollected;
      } else {
        sawtRevIQD += fin.totalAmount;
        sawtColIQD += fin.totalCollected;
      }
      sawtCount++;
    } else {
      if (isUSD) {
        naqaaRevUSD += fin.totalAmount;
        naqaaColUSD += fin.totalCollected;
      } else {
        naqaaRevIQD += fin.totalAmount;
        naqaaColIQD += fin.totalCollected;
      }
      naqaaCount++;
    }
  });

  const naqaaRemIQD = Math.max(0, naqaaRevIQD - naqaaColIQD);
  const naqaaRemUSD = Math.max(0, naqaaRevUSD - naqaaColUSD);
  const sawtRemIQD = Math.max(0, sawtRevIQD - sawtColIQD);
  const sawtRemUSD = Math.max(0, sawtRevUSD - sawtColUSD);

  let totalAdvancesIQD = 0, totalSettledIQD = 0;
  let totalAdvancesUSD = 0, totalSettledUSD = 0;

  receipts.filter(r => r.status !== 'cancelled').forEach(r => {
    const isUSD = r.currency === 'USD';
    if (r.type === 'advance') {
      if (isUSD) totalAdvancesUSD += r.amount;
      else totalAdvancesIQD += r.amount;
    }
    if (r.type === 'settlement') {
      if (isUSD) totalSettledUSD += r.amount;
      else totalSettledIQD += r.amount;
    }
  });

  const totalRemainingIQD = Math.max(0, totalRevenueIQD - totalCollectedIQD);
  const totalRemainingUSD = Math.max(0, totalRevenueUSD - totalCollectedUSD);
  const netOpenAdvancesIQD = Math.max(0, totalAdvancesIQD - totalSettledIQD);
  const netOpenAdvancesUSD = Math.max(0, totalAdvancesUSD - totalSettledUSD);

  // Recent Transactions
  const recentTransactions = [...transactions].slice(0, 6);

  // Active employees with open advances (IQD or USD)
  const employeesWithOpenAdvances = employees.map(emp => {
    const adv = getEmployeeAdvances(emp.id, receipts);
    return {
      employee: emp,
      ...adv
    };
  }).filter(e => e.openIQD > 0 || e.openUSD > 0);

  const treasurySummary = getTreasuryFinancialSummary(treasury, receipts, activeRate);

  return (
    <div className="space-y-6">
      {/* Company Treasury Highlight Banner (Unified Capital Pool - IQD & USD) */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/60 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">صندوق الشركة المشترك (رأس المال الموحد)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  السيولة الحية (IQD & USD)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                رأس مال موحد مشترك بين <strong>شركة نقاء البصرة</strong> و <strong>شركة صوت الجنوب</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-right">
              <span className="text-[11px] text-emerald-300/80 block font-bold">🇮🇶 رصيد الصندوق (دينار عراقي):</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight" dir="ltr">
                {formatCurrency(treasurySummary.currentBalanceIQD, 'IQD')}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl px-4 py-2.5 text-right">
              <span className="text-[11px] text-cyan-300/80 block font-bold">🇺🇸 رصيد الصندوق (دولار أمريكي):</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight" dir="ltr">
                {formatCurrency(treasurySummary.currentBalanceUSD, 'USD')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5" dir="ltr">
                ≈ {formatCurrency(Math.round(treasurySummary.currentBalanceUSD * activeRate), 'IQD')}
              </div>
            </div>

            {onOpenTreasury && (
              <button
                onClick={onOpenTreasury}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>فتح الصندوق والسحب والإيداع</span>
                <span>&larr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Exchange Rate Control Bar inside Dashboard (لوحة التحكم) */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-bold text-cyan-300">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>تحويل العملة المعتمد في لوحة التحكم (1$ أو 100$):</span>
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-cyan-500/40 rounded-xl px-2.5 py-1">
              <input
                type="number"
                min="1"
                step="any"
                value={rateInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setRateInput(val);
                  const num = Number(val);
                  if (num >= 100 && onUpdateExchangeRate) {
                    onUpdateExchangeRate(normalizeExchangeRate(num, 1500), true);
                  }
                }}
                onBlur={() => {
                  const num = Number(rateInput);
                  if (num >= 100 && onUpdateExchangeRate) {
                    const norm = normalizeExchangeRate(num, 1500);
                    setRateInput(String(norm));
                    onUpdateExchangeRate(norm, false);
                  } else {
                    setRateInput(String(normalizeExchangeRate(exchangeRate, 1500)));
                  }
                }}
                className="w-24 bg-transparent text-cyan-300 font-mono font-black text-sm focus:outline-none text-center"
              />
              <span className="text-[11px] text-slate-400 font-bold">د.ع</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl" dir="ltr">
              1$ = {activeRate.toLocaleString('ar-IQ')} د.ع | 100$ = {Math.round(activeRate * 100).toLocaleString('ar-IQ')} د.ع
            </span>
            {onOpenExchangeRate && (
              <button
                type="button"
                onClick={onOpenExchangeRate}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition"
              >
                خيارات سريعة
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
            <span className="text-slate-400 text-[11px]">إجمالي السيولة المقومة بالدينار (IQD + USD):</span>
            <strong className="font-mono font-black text-sm text-amber-300" dir="ltr">
              {formatCurrency(Math.round(treasurySummary.totalEquivalentIQD), 'IQD')}
            </strong>
          </div>
        </div>
      </div>

      {/* Dual Company Comparative Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Naqaa Basra Card */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base">
                🌿
              </span>
              <div>
                <h4 className="font-bold text-sm text-white">{COMPANIES.naqaa_basra.name}</h4>
                <span className="text-[10px] text-emerald-400">{COMPANIES.naqaa_basra.slogan}</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs font-mono">
              {naqaaCount} بوليصة نشطة
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">إجمالي الفواتير</span>
              <span className="font-mono font-bold text-slate-200 block" dir="ltr">{formatCurrency(naqaaRevIQD, 'IQD')}</span>
              {naqaaRevUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaRevUSD, 'USD')}</span>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">المحصل للصندوق</span>
              <span className="font-mono font-bold text-emerald-400 block" dir="ltr">{formatCurrency(naqaaColIQD, 'IQD')}</span>
              {naqaaColUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaColUSD, 'USD')}</span>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">المتبقي بذمة الزبائن</span>
              <span className="font-mono font-bold text-amber-400 block" dir="ltr">{formatCurrency(naqaaRemIQD, 'IQD')}</span>
              {naqaaRemUSD > 0 && <span className="font-mono font-bold text-amber-300 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaRemUSD, 'USD')}</span>}
            </div>
          </div>
        </div>

        {/* Sawt Al-Janoub Card */}
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-base">
                ⚓
              </span>
              <div>
                <h4 className="font-bold text-sm text-white">{COMPANIES.sawt_aljanoub.name}</h4>
                <span className="text-[10px] text-cyan-400">{COMPANIES.sawt_aljanoub.slogan}</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs font-mono">
              {sawtCount} بوليصة نشطة
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">إجمالي الفواتير</span>
              <span className="font-mono font-bold text-slate-200 block" dir="ltr">{formatCurrency(sawtRevIQD, 'IQD')}</span>
              {sawtRevUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(sawtRevUSD, 'USD')}</span>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">المحصل للصندوق</span>
              <span className="font-mono font-bold text-emerald-400 block" dir="ltr">{formatCurrency(sawtColIQD, 'IQD')}</span>
              {sawtColUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(sawtColUSD, 'USD')}</span>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">المتبقي بذمة الزبائن</span>
              <span className="font-mono font-bold text-amber-400 block" dir="ltr">{formatCurrency(sawtRemIQD, 'IQD')}</span>
              {sawtRemUSD > 0 && <span className="font-mono font-bold text-amber-300 text-[11px] block" dir="ltr">+ {formatCurrency(sawtRemUSD, 'USD')}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{totalCount}</div>
            <div className="text-xs font-semibold text-blue-400">
              إجمالي البوالص {cancelledCount > 0 ? `(منها ${cancelledCount} ملغاة)` : ''}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            📋
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{completedCount}</div>
            <div className="text-xs font-semibold text-emerald-400">معاملات منجزة وخالصة</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            ✅
          </div>
        </div>

        {/* Pending */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{pendingCount}</div>
            <div className="text-xs font-semibold text-amber-400">قيد التنفيذ والمتابعة</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
            ⏳
          </div>
        </div>

        {/* Issues / Cancelled */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-3xl font-extrabold text-white mb-1">{issueCount + cancelledCount}</div>
            <div className="text-xs font-semibold text-rose-400">معاملات معلقة / ملغاة دفترياً</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl">
            ⚠️
          </div>
        </div>
      </div>

      {/* 4 Financial Summary Cards (Dual Currency IQD & USD + Live Exchange Rate Valuation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>💰</span> إجمالي الفواتير النشطة
          </div>
          <div className="text-lg font-black text-white font-mono" dir="ltr">
            {formatCurrency(totalRevenueIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalRevenueUSD, 'USD')}
          </div>
          {totalRevenueUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalRevenueIQD + Math.round(totalRevenueUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Collected */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>💵</span> المبالغ المحصلة من الزبائن
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono" dir="ltr">
            {formatCurrency(totalCollectedIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalCollectedUSD, 'USD')}
          </div>
          {totalCollectedUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalCollectedIQD + Math.round(totalCollectedUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Remaining */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>📤</span> الديون المتبقية بذمة الزبائن
          </div>
          <div className="text-lg font-black text-amber-400 font-mono" dir="ltr">
            {formatCurrency(totalRemainingIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-amber-300 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(totalRemainingUSD, 'USD')}
          </div>
          {totalRemainingUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(totalRemainingIQD + Math.round(totalRemainingUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>

        {/* Advances */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <span>🏦</span> السلف المفتوحة بذمة المخلصين
          </div>
          <div className="text-lg font-black text-rose-400 font-mono" dir="ltr">
            {formatCurrency(netOpenAdvancesIQD, 'IQD')}
          </div>
          <div className="text-sm font-black text-rose-300 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(netOpenAdvancesUSD, 'USD')}
          </div>
          {netOpenAdvancesUSD > 0 && (
            <div className="text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80" dir="ltr">
              المعادل الكلي: {formatCurrency(netOpenAdvancesIQD + Math.round(netOpenAdvancesUSD * activeRate), 'IQD')}
            </div>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions (2 cols on large) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>📋</span> آخر المعاملات والبوالص
            </h3>
            <button
              onClick={onViewAllTransactions}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
            >
              عرض الكل
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-2.5 px-3">رقم البوليصة</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">المبلغ الكلي</th>
                  <th className="py-2.5 px-3">المسدد</th>
                  <th className="py-2.5 px-3">المتبقي</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.map((tx) => {
                  const cust = customers.find(c => c.id === tx.customerId);
                  const fin = getBillFinancials(tx, receipts, activeRate);
                  const comp = COMPANIES[tx.companyId || 'naqaa_basra'];
                  const isCancelled = tx.status === 'cancelled';
                  
                  return (
                    <tr key={tx.id} className={`hover:bg-slate-800/40 transition ${isCancelled ? 'opacity-60 bg-rose-950/10' : ''}`}>
                      <td className="py-3 px-3 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold border shrink-0 ${comp.badgeColor}`}>
                            {comp.shortName}
                          </span>
                          <span className={isCancelled ? 'line-through text-slate-400' : 'text-emerald-400'}>{tx.billNo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {cust?.name || 'غير محدد'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200" dir="ltr">
                        <div>{formatCurrency(fin.totalAmount, fin.currency)}</div>
                        {fin.currency === 'USD' && fin.totalAmount > 0 && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            ≈ {formatCurrency(Math.round(fin.totalAmount * activeRate), 'IQD')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400" dir="ltr">
                        {formatCurrency(fin.totalCollected, fin.currency)}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-400" dir="ltr">
                        <div>{formatCurrency(fin.remainingAmount, fin.currency)}</div>
                        {fin.currency === 'USD' && fin.remainingAmount > 0 && (
                          <div className="text-[10px] text-amber-300/70 font-normal">
                            ≈ {formatCurrency(Math.round(fin.remainingAmount * activeRate), 'IQD')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {tx.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            ✅ منجزة
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            ⏳ قيد التنفيذ
                          </span>
                        )}
                        {tx.status === 'issue' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            ⚠️ معلقة
                          </span>
                        )}
                        {tx.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            ⛔ ملغاة دفترياً
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenTransactionDetail(tx)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Advances (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🏦</span> السلف المفتوحة للمخلصين
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">مبالغ بانتظار تقديم وصولات التصفية (بالدينار والدولار)</p>
          </div>

          <div className="space-y-3">
            {employeesWithOpenAdvances.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                لا توجد سلف معلقة حالياً، جميع الحسابات مصفاة بالكامل ✅
              </div>
            ) : (
              employeesWithOpenAdvances.map(({ employee, openIQD, advancesIQD, settledIQD, openUSD, advancesUSD, settledUSD }) => (
                <div key={employee.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      {employee.name}
                    </span>
                    <div className="text-left font-mono font-bold text-xs" dir="ltr">
                      {openIQD > 0 && <div className="text-rose-400">{formatCurrency(openIQD, 'IQD')}</div>}
                      {openUSD > 0 && <div className="text-amber-400">{formatCurrency(openUSD, 'USD')}</div>}
                    </div>
                  </div>

                  {advancesIQD > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1.5">
                      <span>سلف (د.ع): {formatCurrency(advancesIQD, 'IQD')}</span>
                      <span>مصفى: {formatCurrency(settledIQD, 'IQD')}</span>
                    </div>
                  )}
                  {advancesUSD > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-cyan-300/80 border-t border-slate-900 pt-1.5">
                      <span>سلف ($): {formatCurrency(advancesUSD, 'USD')}</span>
                      <span>مصفى: {formatCurrency(settledUSD, 'USD')}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
