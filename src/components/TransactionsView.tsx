'use client';

import React, { useState } from 'react';
import { Transaction, Customer, Employee, Receipt, AppUser, CompanyId, TreasuryAttachment } from '../types/customs';
import { TransactionsFilters } from './transactions/TransactionsFilters';
import { TransactionsTable } from './transactions/TransactionsTable';

export interface TransactionsViewProps {
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
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    // Company Filter
    if (companyFilter !== 'all' && (t.companyId || 'naqaa_basra') !== companyFilter) return false;

    // Status Filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Customer Filter
    if (customerFilter !== 'all' && t.customerId !== customerFilter) return false;

    // Search Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const cust = customers.find((c) => c.id === t.customerId);
      const emp = employees.find((e) => e.id === t.employeeId);
      const matchesBill = t.billNo.toLowerCase().includes(q);
      const matchesJob = (t.jobNumber || '').toLowerCase().includes(q);
      const matchesDestination = (t.containerDestination || '').toLowerCase().includes(q);
      const matchesGoods = t.goodsType?.toLowerCase().includes(q);
      const matchesCustomer = cust?.name.toLowerCase().includes(q);
      const matchesEmp = emp?.name.toLowerCase().includes(q);
      const matchesContainers = t.containers.some((c) => c.toLowerCase().includes(q));
      const matchesCreated = (t.createdAt || '').toLowerCase().includes(q);
      const matchesNotes = (t.notes || '').toLowerCase().includes(q);

      if (
        !matchesBill &&
        !matchesJob &&
        !matchesDestination &&
        !matchesGoods &&
        !matchesCustomer &&
        !matchesEmp &&
        !matchesContainers &&
        !matchesCreated &&
        !matchesNotes
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <TransactionsFilters
        currentUser={currentUser}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        customers={customers}
        filteredCount={filteredTransactions.length}
        onAddTransaction={onAddTransaction}
      />

      {/* Transactions Table */}
      <TransactionsTable
        filteredTransactions={filteredTransactions}
        customers={customers}
        employees={employees}
        receipts={receipts}
        currentUser={currentUser}
        exchangeRate={exchangeRate}
        expandedRowIds={expandedRowIds}
        toggleRowExpand={toggleRowExpand}
        onViewArchive={onViewArchive}
        onOpenTransactionDetail={onOpenTransactionDetail}
        onOpenQuickAdvance={onOpenQuickAdvance}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenAddExpense={onOpenAddExpense}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onTryChangeStatus={onTryChangeStatus}
      />
    </div>
  );
};
