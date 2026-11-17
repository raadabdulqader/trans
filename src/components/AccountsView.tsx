'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Coffee, 
  Building2, 
  Search, 
  Layers,
  Truck,
  Receipt
} from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment, Employee, AppUser, CompanyId } from '../types/customs';
import { formatCurrency, getTreasuryFinancialSummary } from '../utils/storage';
import { SubAccountType } from './modals/AccountExpenseModal';
import { AccountsHeaderCards } from './accounts/AccountsHeaderCards';
import { StaffPayrollRoster } from './accounts/StaffPayrollRoster';
import { AccountsLedgerTable, LedgerSubTab, ExtendedSubAccountType } from './accounts/AccountsLedgerTable';

interface AccountsViewProps {
  treasury: TreasuryTransaction[];
  receipts: any[];
  employees: Employee[];
  currentUser: AppUser;
  onOpenAddExpense: (subAccount: SubAccountType) => void;
  onEditExpense: (tx: TreasuryTransaction) => void;
  onDeleteExpense: (tx: TreasuryTransaction) => void;
  onViewArchive: (attachment: TreasuryAttachment, title?: string) => void;
  onPrintVoucher: (tx: TreasuryTransaction) => void;
  onNavigateToTreasury: () => void;
  onAddEmployee?: () => void;
  onPaySalary?: (emp: Employee) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  treasury = [],
  receipts = [],
  employees = [],
  currentUser,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onViewArchive,
  onPrintVoucher,
  onNavigateToTreasury,
  onAddEmployee,
  onPaySalary,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<LedgerSubTab>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId | 'shared'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Treasury Financial Summary to show live company balance
  const treasurySummary = useMemo(() => {
    return getTreasuryFinancialSummary(treasury, receipts);
  }, [treasury, receipts]);

  // Helper to determine sub-account type of any transaction
  const getSubAccountType = (tx: TreasuryTransaction): ExtendedSubAccountType => {
    if (tx.subAccount === 'bill_expenses' || (tx.relatedBillNo && !tx.carrierId && tx.subAccount !== 'carriers')) {
      return 'bill_expenses';
    }
    if (tx.subAccount === 'carriers' || tx.carrierId) return 'carriers';
    if (tx.subAccount) return tx.subAccount as ExtendedSubAccountType;
    const cat = (tx.category || '').toLowerCase();
    const desc = (tx.description || '').toLowerCase();

    if (cat.includes('نقل') || cat.includes('ناقل') || cat.includes('شاحن') || desc.includes('نقل')) {
      return 'carriers';
    }
    if (cat.includes('رواتب') || cat.includes('راتب') || cat.includes('أجور') || cat.includes('مكافأة') || desc.includes('راتب')) {
      return 'salaries';
    }
    if (cat.includes('إيجار') || cat.includes('ايجار') || cat.includes('مستودع') || cat.includes('عقار') || desc.includes('إيجار') || desc.includes('ايجار')) {
      return 'rents';
    }
    if (cat.includes('مصاريف') || cat.includes('يومية') || cat.includes('نثرية') || cat.includes('ضيافة') || cat.includes('وقود') || cat.includes('صيانة') || cat.includes('قرطاسية')) {
      return 'daily';
    }
    return 'daily'; // Default operational expenditure
  };

  // Filter only expense/withdrawal movements that belong to internal company Accounts (now including carrier expenses)
  const allAccountExpenses = useMemo(() => {
    return treasury.filter(tx => tx.type === 'withdrawal');
  }, [treasury]);

  // Sub-account filtered data
  const filteredExpenses = useMemo(() => {
    return allAccountExpenses.filter(tx => {
      // Company Filter
      if (companyFilter !== 'all') {
        const txCompany = tx.companyId || 'shared';
        if (txCompany !== companyFilter) {
          return false;
        }
      }

      // Sub-tab filter
      const type = getSubAccountType(tx);
      if (activeSubTab !== 'all' && type !== activeSubTab) {
        return false;
      }

      // Date Range Filter
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // Search Filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesParty = tx.partyName?.toLowerCase().includes(q);
        const matchesCategory = tx.category?.toLowerCase().includes(q);
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        const matchesVoucher = tx.voucherNo?.toLowerCase().includes(q);
        const matchesPeriod = tx.period?.toLowerCase().includes(q);
        if (!matchesParty && !matchesCategory && !matchesDesc && !matchesVoucher && !matchesPeriod) {
          return false;
        }
      }

      return true;
    });
  }, [allAccountExpenses, activeSubTab, companyFilter, startDate, endDate, searchTerm]);

  // Stats calculation separated by currency (IQD & USD)
  const {
    totalSalariesIQD,
    totalSalariesUSD,
    totalDailyIQD,
    totalDailyUSD,
    totalRentsIQD,
    totalRentsUSD,
    totalCarriersIQD,
    totalCarriersUSD,
  } = useMemo(() => {
    let sIQD = 0, sUSD = 0;
    let dIQD = 0, dUSD = 0;
    let rIQD = 0, rUSD = 0;
    let cIQD = 0, cUSD = 0;
    allAccountExpenses
      .filter(tx => tx.status !== 'cancelled')
      .forEach(tx => {
        const type = getSubAccountType(tx);
        const isUSD = tx.currency === 'USD';
        const amt = tx.amount || 0;
        if (type === 'salaries') {
          if (isUSD) sUSD += amt; else sIQD += amt;
        } else if (type === 'daily') {
          if (isUSD) dUSD += amt; else dIQD += amt;
        } else if (type === 'rents') {
          if (isUSD) rUSD += amt; else rIQD += amt;
        } else if (type === 'carriers') {
          if (isUSD) cUSD += amt; else cIQD += amt;
        }
      });
    return {
      totalSalariesIQD: sIQD,
      totalSalariesUSD: sUSD,
      totalDailyIQD: dIQD,
      totalDailyUSD: dUSD,
      totalRentsIQD: rIQD,
      totalRentsUSD: rUSD,
      totalCarriersIQD: cIQD,
      totalCarriersUSD: cUSD,
    };
  }, [allAccountExpenses]);

  const { totalFilteredIQD, totalFilteredUSD } = useMemo(() => {
    let fIQD = 0, fUSD = 0;
    filteredExpenses
      .filter(tx => tx.status !== 'cancelled')
      .forEach(tx => {
        if (tx.currency === 'USD') fUSD += tx.amount || 0;
        else fIQD += tx.amount || 0;
      });
    return { totalFilteredIQD: fIQD, totalFilteredUSD: fUSD };
  }, [filteredExpenses]);

  const companyStaff = useMemo(() => {
    return employees.filter(e => !e.category || e.category === 'staff' || e.category === 'both');
  }, [employees]);

  const getSubAccountBadge = (type: ExtendedSubAccountType) => {
    switch (type) {
      case 'salaries':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
            <Users className="w-3 h-3" />
            <span>رواتب وأجور</span>
          </span>
        );
      case 'daily':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
            <Coffee className="w-3 h-3" />
            <span>مصاريف يومية</span>
          </span>
        );
      case 'rents':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[11px]">
            <Building2 className="w-3 h-3" />
            <span>إيجارات ومرافق</span>
          </span>
        );
      case 'carriers':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
            <Truck className="w-3 h-3" />
            <span>أجور ونواقل النقل البري</span>
          </span>
        );
      case 'bill_expenses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold text-[11px]">
            <Receipt className="w-3 h-3" />
            <span>مصاريف بوالص كمركية</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
            <span>مصروف عام</span>
          </span>
        );
    }
  };

  const handlePrintCurrentTabReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Cards */}
      <AccountsHeaderCards
        currentUser={currentUser}
        treasurySummary={treasurySummary}
        onNavigateToTreasury={onNavigateToTreasury}
        onOpenAddExpense={onOpenAddExpense}
        onAddEmployee={onAddEmployee}
        onPrint={handlePrintCurrentTabReport}
        totalSalariesIQD={totalSalariesIQD}
        totalSalariesUSD={totalSalariesUSD}
        totalDailyIQD={totalDailyIQD}
        totalDailyUSD={totalDailyUSD}
        totalRentsIQD={totalRentsIQD}
        totalRentsUSD={totalRentsUSD}
        totalCarriersIQD={totalCarriersIQD}
        totalCarriersUSD={totalCarriersUSD}
      />

      {/* 2. Sub-tabs Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>كافة الحسابات (السجل العام)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-300 font-mono text-[10px]">
              {allAccountExpenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('salaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'salaries'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>الرواتب والأجور</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 font-mono text-[10px]">
              {allAccountExpenses.filter(t => getSubAccountType(t) === 'salaries').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'daily'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>المصاريف اليومية والنثرية</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-950/60 text-amber-300 font-mono text-[10px]">
              {allAccountExpenses.filter(t => getSubAccountType(t) === 'daily').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('rents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'rents'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>الإيجارات والمرافق</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 font-mono text-[10px]">
              {allAccountExpenses.filter(t => getSubAccountType(t) === 'rents').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('carriers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'carriers'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>أجور ونواقل النقل البري</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-950/60 text-amber-300 font-mono text-[10px]">
              {allAccountExpenses.filter(t => getSubAccountType(t) === 'carriers').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('bill_expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'bill_expenses'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-purple-400" />
            <span>مصاريف البوالص الكمركية</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950/60 text-purple-300 font-mono text-[10px]">
              {allAccountExpenses.filter(t => getSubAccountType(t) === 'bill_expenses').length}
            </span>
          </button>
        </div>

        {/* Current Tab Total Highlight */}
        <div className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <span>إجمالي المعروض:</span>
          <strong className="text-emerald-400 font-mono font-bold" dir="ltr">{formatCurrency(totalFilteredIQD, 'IQD')}</strong>
          {totalFilteredUSD > 0 && (
            <strong className="text-cyan-400 font-mono font-bold" dir="ltr">+ {formatCurrency(totalFilteredUSD, 'USD')}</strong>
          )}
        </div>
      </div>

      {/* 3. Quick Staff Payroll Roster (Shown when Salaries tab is active) */}
      {activeSubTab === 'salaries' && (
        <StaffPayrollRoster
          companyStaff={companyStaff}
          onAddEmployee={onAddEmployee}
          onPaySalary={onPaySalary}
        />
      )}

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالجهة، الموظف، البيان، أو رقم السند..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Company Filter */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>الشركة:</span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">🏢 جميع الشركات</option>
              <option value="naqaa_basra">🌿 شركة نقاء البصرة</option>
              <option value="sawt_aljanoub">⚓ شركة صوت الجنوب</option>
              <option value="shared">🏛️ مصاريف مشتركة / عامة</option>
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>من:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {(searchTerm || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-[11px]"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          عدد القيود: <strong className="text-white">{filteredExpenses.length}</strong> قيد
        </div>
      </div>

      {/* 5. Accounts Ledger Table */}
      <AccountsLedgerTable
        filteredExpenses={filteredExpenses}
        activeSubTab={activeSubTab}
        totalFilteredIQD={totalFilteredIQD}
        totalFilteredUSD={totalFilteredUSD}
        currentUser={currentUser}
        onOpenAddExpense={onOpenAddExpense}
        onPrintVoucher={onPrintVoucher}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        onViewArchive={onViewArchive}
        getSubAccountType={getSubAccountType}
        getSubAccountBadge={getSubAccountBadge}
      />
    </div>
  );
};
