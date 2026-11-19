'use client';

import React, { useState } from 'react';
import { Receipt, Transaction, Customer, Employee, AppUser, CompanyId, Currency } from '../types/customs';
import { ReceiptsMetricsCards } from './receipts/ReceiptsMetricsCards';
import { ReceiptsFilters } from './receipts/ReceiptsFilters';
import { ReceiptsTable } from './receipts/ReceiptsTable';

export interface ReceiptsViewProps {
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

  const activeCount = receipts.filter((r) => r.status !== 'cancelled').length;
  const cancelledCount = receipts.filter((r) => r.status === 'cancelled').length;

  const filteredReceipts = receipts.filter((r) => {
    const tx = transactions.find((t) => t.id === r.billId);
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

  // Financial metrics for receipts
  const activeReceiptsList = receipts.filter((r) => r.status !== 'cancelled');
  const totalCollectionsIQD = activeReceiptsList
    .filter((r) => {
      const tx = transactions.find((t) => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return (r.type === 'deposit' || r.type === 'payment') && curr === 'IQD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalCollectionsUSD = activeReceiptsList
    .filter((r) => {
      const tx = transactions.find((t) => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return (r.type === 'deposit' || r.type === 'payment') && curr === 'USD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalAdvancesIQD = activeReceiptsList
    .filter((r) => {
      const tx = transactions.find((t) => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return r.type === 'advance' && curr === 'IQD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  const totalAdvancesUSD = activeReceiptsList
    .filter((r) => {
      const tx = transactions.find((t) => t.id === r.billId);
      const curr = r.currency || tx?.currency || 'IQD';
      return r.type === 'advance' && curr === 'USD';
    })
    .reduce((s, r) => s + (r.amount || 0), 0);

  // Transfer & Exchange Commissions in Receipts
  const totalCommissionsCount = activeReceiptsList.filter(
    (r) => r.hasCommission && (r.commissionAmount || 0) > 0
  ).length;
  const totalCommissionsSumUSD = activeReceiptsList
    .filter((r) => r.hasCommission && (r.commissionCurrency || r.currency) === 'USD')
    .reduce((s, r) => s + (r.commissionAmount || 0), 0);
  const totalCommissionsSumIQD = activeReceiptsList
    .filter((r) => r.hasCommission && (r.commissionCurrency || r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.commissionAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Dual Currency & Commissions Metrics Overview */}
      <ReceiptsMetricsCards
        totalCollectionsIQD={totalCollectionsIQD}
        totalCollectionsUSD={totalCollectionsUSD}
        totalAdvancesIQD={totalAdvancesIQD}
        totalAdvancesUSD={totalAdvancesUSD}
        totalCommissionsCount={totalCommissionsCount}
        totalCommissionsSumUSD={totalCommissionsSumUSD}
        totalCommissionsSumIQD={totalCommissionsSumIQD}
        exchangeRate={exchangeRate}
      />

      {/* Header & Filters */}
      <ReceiptsFilters
        currentUser={currentUser}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        currencyFilter={currencyFilter}
        setCurrencyFilter={setCurrencyFilter}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        billFilter={billFilter}
        setBillFilter={setBillFilter}
        transactions={transactions}
        totalReceiptsCount={receipts.length}
        activeCount={activeCount}
        cancelledCount={cancelledCount}
        filteredCount={filteredReceipts.length}
        onAddReceipt={onAddReceipt}
      />

      {/* Receipts Table */}
      <ReceiptsTable
        filteredReceipts={filteredReceipts}
        transactions={transactions}
        customers={customers}
        employees={employees}
        currentUser={currentUser}
        exchangeRate={exchangeRate}
        onDeleteReceipt={onDeleteReceipt}
        onPrintVoucher={onPrintVoucher}
      />
    </div>
  );
};
