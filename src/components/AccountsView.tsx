'use client';

import React, { useState, useMemo } from 'react';
import { TreasuryTransaction, TreasuryAttachment, Employee, AppUser, CompanyId } from '../types/customs';
import { getTreasuryFinancialSummary } from '../utils/storage';
import { SubAccountType } from './modals/AccountExpenseModal';
import { AccountsHeaderCards } from './accounts/AccountsHeaderCards';
import { StaffPayrollRoster } from './accounts/StaffPayrollRoster';
import { AccountsLedgerTable, LedgerSubTab } from './accounts/AccountsLedgerTable';
import { getSubAccountType, getSubAccountBadge } from './accounts/accountHelpers';
import { AccountsSubTabsBar } from './accounts/AccountsSubTabsBar';
import { AccountsFiltersBar } from './accounts/AccountsFiltersBar';

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
      <AccountsSubTabsBar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        allAccountExpenses={allAccountExpenses}
        totalFilteredIQD={totalFilteredIQD}
        totalFilteredUSD={totalFilteredUSD}
      />

      {/* 3. Quick Staff Payroll Roster (Shown when Salaries tab is active) */}
      {activeSubTab === 'salaries' && (
        <StaffPayrollRoster
          companyStaff={companyStaff}
          onAddEmployee={onAddEmployee}
          onPaySalary={onPaySalary}
        />
      )}

      {/* 4. Filter and Search Bar */}
      <AccountsFiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filteredCount={filteredExpenses.length}
      />

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
