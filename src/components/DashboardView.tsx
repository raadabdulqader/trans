'use client';

import React, { useState, useEffect } from 'react';
import { Customer, Employee, Transaction, Receipt, TreasuryTransaction } from '../types/customs';
import { getBillFinancials, getEmployeeAdvances, getTreasuryFinancialSummary, normalizeExchangeRate } from '../utils/storage';
import { TreasuryHeroBanner } from './dashboard/TreasuryHeroBanner';
import { CompaniesComparisonCards } from './dashboard/CompaniesComparisonCards';
import { DashboardMetricsCards } from './dashboard/DashboardMetricsCards';
import { RecentTransactionsTable } from './dashboard/RecentTransactionsTable';
import { BrokerAdvancesSidebar } from './dashboard/BrokerAdvancesSidebar';

export interface DashboardViewProps {
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
}) => {
  const [rateInput, setRateInput] = useState<string>(String(normalizeExchangeRate(exchangeRate, 1500)));

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setRateInput((prev) => {
        if (Number(prev) >= 100 && normalizeExchangeRate(prev, 1500) === normalizedProp) {
          return prev;
        }
        return String(normalizedProp);
      });
    }
  }, [exchangeRate]);

  const activeRate = normalizeExchangeRate(rateInput, normalizeExchangeRate(exchangeRate, 1500));

  // Stats
  const activeTransactions = transactions.filter((t) => t.status !== 'cancelled');
  const totalCount = transactions.length;
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const issueCount = transactions.filter((t) => t.status === 'issue').length;
  const cancelledCount = transactions.filter((t) => t.status === 'cancelled').length;

  // Financials separated by currency (IQD & USD)
  let totalRevenueIQD = 0, totalCollectedIQD = 0;
  let totalRevenueUSD = 0, totalCollectedUSD = 0;

  // Dual Company Breakdown (separated by IQD & USD)
  let naqaaRevIQD = 0, naqaaColIQD = 0, naqaaRevUSD = 0, naqaaColUSD = 0, naqaaCount = 0;
  let sawtRevIQD = 0, sawtColIQD = 0, sawtRevUSD = 0, sawtColUSD = 0, sawtCount = 0;

  activeTransactions.forEach((tx) => {
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

  receipts.filter((r) => r.status !== 'cancelled').forEach((r) => {
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
  const employeesWithOpenAdvances = employees
    .map((emp) => {
      const adv = getEmployeeAdvances(emp.id, receipts);
      return {
        employee: emp,
        ...adv,
      };
    })
    .filter((e) => e.openIQD > 0 || e.openUSD > 0);

  const treasurySummary = getTreasuryFinancialSummary(treasury, receipts, activeRate);

  return (
    <div className="space-y-6">
      {/* Company Treasury Highlight Banner */}
      <TreasuryHeroBanner
        treasurySummary={treasurySummary}
        activeRate={activeRate}
        rateInput={rateInput}
        setRateInput={setRateInput}
        onUpdateExchangeRate={onUpdateExchangeRate}
        onOpenExchangeRate={onOpenExchangeRate}
        onOpenTreasury={onOpenTreasury}
        exchangeRate={exchangeRate}
      />

      {/* Dual Company Comparative Overview Cards */}
      <CompaniesComparisonCards
        naqaaCount={naqaaCount}
        naqaaRevIQD={naqaaRevIQD}
        naqaaColIQD={naqaaColIQD}
        naqaaRemIQD={naqaaRemIQD}
        naqaaRevUSD={naqaaRevUSD}
        naqaaColUSD={naqaaColUSD}
        naqaaRemUSD={naqaaRemUSD}
        sawtCount={sawtCount}
        sawtRevIQD={sawtRevIQD}
        sawtColIQD={sawtColIQD}
        sawtRemIQD={sawtRemIQD}
        sawtRevUSD={sawtRevUSD}
        sawtColUSD={sawtColUSD}
        sawtRemUSD={sawtRemUSD}
      />

      {/* Status & Financial Summary Cards */}
      <DashboardMetricsCards
        totalCount={totalCount}
        completedCount={completedCount}
        pendingCount={pendingCount}
        issueCount={issueCount}
        cancelledCount={cancelledCount}
        totalRevenueIQD={totalRevenueIQD}
        totalRevenueUSD={totalRevenueUSD}
        totalCollectedIQD={totalCollectedIQD}
        totalCollectedUSD={totalCollectedUSD}
        totalRemainingIQD={totalRemainingIQD}
        totalRemainingUSD={totalRemainingUSD}
        netOpenAdvancesIQD={netOpenAdvancesIQD}
        netOpenAdvancesUSD={netOpenAdvancesUSD}
        activeRate={activeRate}
      />

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactionsTable
          recentTransactions={recentTransactions}
          customers={customers}
          receipts={receipts}
          activeRate={activeRate}
          onViewAllTransactions={onViewAllTransactions}
          onOpenTransactionDetail={onOpenTransactionDetail}
        />

        <BrokerAdvancesSidebar
          employeesWithOpenAdvances={employeesWithOpenAdvances}
        />
      </div>
    </div>
  );
};
