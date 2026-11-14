'use client';

import React, { useState } from 'react';
import { 
  TreasuryTransaction, 
  Receipt, 
  Transaction, 
  Customer, 
  Employee, 
  AppUser, 
  TreasuryAttachment, 
  CompanyId 
} from '../types/customs';
import { UnifiedRecord } from '../types/treasuryUnified';
import { getTreasuryFinancialSummary } from '../utils/storage';
import { TreasuryMetricsCards } from './treasury/TreasuryMetricsCards';
import { TreasuryFilters } from './treasury/TreasuryFilters';
import { TreasuryTable } from './treasury/TreasuryTable';

// Re-export for backward compatibility
export type { UnifiedRecord } from '../types/treasuryUnified';

interface TreasuryViewProps {
  treasury?: TreasuryTransaction[];
  receipts?: Receipt[];
  transactions?: Transaction[];
  customers?: Customer[];
  employees?: Employee[];
  currentUser: AppUser;
  exchangeRate?: number;
  onOpenExchangeRate?: () => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onEditTransaction: (tx: TreasuryTransaction) => void;
  onDeleteTransaction: (tx: TreasuryTransaction) => void;
  onViewArchive: (attachment: TreasuryAttachment, title: string) => void;
  onAttachReceiptToTreasury: (tx: TreasuryTransaction, file: File) => void;
  onAttachReceiptToBillReceipt: (rcpt: Receipt, file: File) => void;
  onPrintVoucher: (tx: TreasuryTransaction) => void;
  onPrintStatement: () => void;
  onDeleteReceipt?: (rcpt: Receipt) => void;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({
  treasury = [],
  receipts = [],
  transactions = [],
  customers = [],
  employees = [],
  currentUser,
  exchangeRate = 1500,
  onOpenExchangeRate,
  onOpenDeposit,
  onOpenWithdrawal,
  onEditTransaction,
  onDeleteTransaction,
  onViewArchive,
  onAttachReceiptToTreasury,
  onAttachReceiptToBillReceipt,
  onPrintVoucher,
  onPrintStatement,
  onDeleteReceipt,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'bill_payments' | 'broker_advances' | 'archived' | 'cancelled'>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId | 'shared'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'IQD' | 'USD'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Shadcn Collapsible State for Treasury Cards Overview
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true;
      const saved = localStorage.getItem('treasury_metrics_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleToggleMetrics = (open: boolean) => {
    setIsMetricsOpen(open);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('treasury_metrics_open', JSON.stringify(open));
      } catch (_) {}
    }
  };

  const summary = getTreasuryFinancialSummary(treasury, receipts, exchangeRate);

  // Build Unified Records combining direct Treasury, all Bill Receipts, and Transactions initial deposits
  const unifiedRecords: UnifiedRecord[] = [];

  // 1. Direct Treasury Movements
  (treasury || []).forEach(t => {
    unifiedRecords.push({
      id: t.id,
      source: 'treasury',
      rawTreasury: t,
      voucherNo: t.voucherNo,
      type: t.type,
      date: t.date || t.createdAt || new Date().toISOString().split('T')[0],
      partyName: t.partyName || 'طرف مالي',
      category: t.category || (t.type === 'deposit' ? 'إيداع نقدي' : 'سحب نقدي'),
      description: t.description || '',
      amount: t.amount || 0,
      currency: t.currency || 'IQD',
      exchangeRate: t.exchangeRate || summary.exchangeRate,
      attachment: t.attachment,
      recordedBy: t.recordedBy || 'أمين الصندوق',
      relatedBillNo: t.relatedBillNo,
      companyId: t.companyId || 'shared',
      status: t.status || 'active',
      cancelledAt: t.cancelledAt,
      cancelledBy: t.cancelledBy,
      cancelReason: t.cancelReason,
      hasCommission: t.hasCommission,
      commissionAmount: t.commissionAmount,
      commissionCurrency: t.commissionCurrency,
      commissionBearer: t.commissionBearer,
    });
  });

  // 2. All Receipts (Customer Payments, Deposits, Broker Advances, Broker Settlements)
  (receipts || []).forEach(r => {
    const bill = (transactions || []).find(t => t.id === r.billId);
    const cust = (customers || []).find(c => c.id === r.customerId || (bill && c.id === bill.customerId));
    const emp = (employees || []).find(e => e.id === r.employeeId || (bill && e.id === bill.employeeId));
    const resolvedCompany: CompanyId = r.companyId || (bill ? bill.companyId : null) || 'naqaa_basra';

    if (r.type === 'deposit' || r.type === 'payment') {
      unifiedRecords.push({
        id: r.id,
        source: 'bill_payment',
        rawReceipt: r,
        voucherNo: r.receiptNo || `REC-${r.id.slice(-4)}`,
        type: 'deposit', // Customer payment enters company treasury
        date: r.date || r.createdAt || new Date().toISOString().split('T')[0],
        partyName: cust?.name || 'زبون (شركة تجارية)',
        category: r.type === 'deposit' ? 'دفعة أولى (بوليصة كمركية)' : 'دفعة زبون (تحصيل بوليصة)',
        description: r.notes || `قبض دفعة نقدية للبوليصة ${bill?.billNo || ''}`,
        amount: r.amount || 0,
        currency: r.currency || 'IQD',
        exchangeRate: r.exchangeRate || summary.exchangeRate,
        attachment: r.attachment,
        recordedBy: 'المحاسبة والتحصيل',
        relatedBillNo: bill?.billNo,
        companyId: resolvedCompany,
        status: r.status || 'active',
        cancelledAt: r.cancelledAt,
        cancelledBy: r.cancelledBy,
        cancelReason: r.cancelReason,
        hasCommission: r.hasCommission,
        commissionAmount: r.commissionAmount,
        commissionCurrency: r.commissionCurrency,
        commissionBearer: r.commissionBearer,
      });
    } else if (r.type === 'advance') {
      unifiedRecords.push({
        id: r.id,
        source: 'broker_advance',
        rawReceipt: r,
        voucherNo: r.receiptNo || `ADV-${r.id.slice(-4)}`,
        type: 'withdrawal', // Broker advance leaves company treasury
        date: r.date || r.createdAt || new Date().toISOString().split('T')[0],
        partyName: emp?.name ? `المخلص: ${emp.name}` : 'مخلص كمركي',
        category: 'صرف سلفة لمخلص كمركي',
        description: r.notes || `سلفة مصاريف كمركية وأرضيات للبوليصة ${bill?.billNo || 'عامة'}`,
        amount: r.amount || 0,
        currency: r.currency || 'IQD',
        exchangeRate: r.exchangeRate || summary.exchangeRate,
        attachment: r.attachment,
        recordedBy: 'أمين الصندوق',
        relatedBillNo: bill?.billNo,
        companyId: resolvedCompany,
        status: r.status || 'active',
        cancelledAt: r.cancelledAt,
        cancelledBy: r.cancelledBy,
        cancelReason: r.cancelReason,
        hasCommission: r.hasCommission,
        commissionAmount: r.commissionAmount,
        commissionCurrency: r.commissionCurrency,
        commissionBearer: r.commissionBearer,
      });
    } else if (r.type === 'settlement') {
      unifiedRecords.push({
        id: r.id,
        source: 'broker_settlement',
        rawReceipt: r,
        voucherNo: r.receiptNo || `SET-${r.id.slice(-4)}`,
        type: 'deposit', // Settlement / voucher clearance
        date: r.date || r.createdAt || new Date().toISOString().split('T')[0],
        partyName: emp?.name ? `المخلص: ${emp.name}` : 'مخلص كمركي',
        category: 'تصفية وتسوية سلفة بالوصولات الكمركية',
        description: r.notes || `تسوية وصولات كمركية رسمية للبوليصة ${bill?.billNo || ''}`,
        amount: r.amount || 0,
        currency: r.currency || 'IQD',
        exchangeRate: r.exchangeRate || summary.exchangeRate,
        attachment: r.attachment,
        recordedBy: 'المحاسبة والتدقيق',
        relatedBillNo: bill?.billNo,
        companyId: resolvedCompany,
        status: r.status || 'active',
        cancelledAt: r.cancelledAt,
        cancelledBy: r.cancelledBy,
        cancelReason: r.cancelReason,
        hasCommission: r.hasCommission,
        commissionAmount: r.commissionAmount,
        commissionCurrency: r.commissionCurrency,
        commissionBearer: r.commissionBearer,
      });
    } else {
      // General receipt catch-all
      unifiedRecords.push({
        id: r.id,
        source: 'treasury',
        rawReceipt: r,
        voucherNo: r.receiptNo || `RC-${r.id.slice(-4)}`,
        type: 'deposit',
        date: r.date || r.createdAt || new Date().toISOString().split('T')[0],
        partyName: cust?.name || emp?.name || 'طرف مالي',
        category: 'سند مالي',
        description: r.notes || '',
        amount: r.amount || 0,
        currency: r.currency || 'IQD',
        exchangeRate: r.exchangeRate || summary.exchangeRate,
        attachment: r.attachment,
        recordedBy: 'المحاسبة',
        relatedBillNo: bill?.billNo,
        companyId: resolvedCompany,
        status: r.status || 'active',
        cancelledAt: r.cancelledAt,
        cancelledBy: r.cancelledBy,
        cancelReason: r.cancelReason,
      });
    }
  });

  // 3. Transactions with initialPaid not already covered by a deposit receipt
  (transactions || []).forEach(t => {
    if (t.initialPaid && t.initialPaid > 0 && t.status !== 'cancelled') {
      const alreadyHasReceipt = (receipts || []).some(
        r => r.billId === t.id && (r.type === 'deposit' || r.amount === t.initialPaid)
      );
      if (!alreadyHasReceipt) {
        const cust = (customers || []).find(c => c.id === t.customerId);
        unifiedRecords.push({
          id: `init-${t.id}`,
          source: 'initial_deposit',
          voucherNo: `INIT-${t.billNo}`,
          type: 'deposit',
          date: t.date || t.createdAt || new Date().toISOString().split('T')[0],
          partyName: cust?.name || 'زبون (شركة)',
          category: 'دفعة أولى عند فتح المعاملة',
          description: `دفعة أولى نقدية للبوليصة ${t.billNo}`,
          amount: t.initialPaid,
          currency: t.currency || 'IQD',
          exchangeRate: t.exchangeRate || summary.exchangeRate,
          recordedBy: 'قسم العمليات',
          relatedBillNo: t.billNo,
          companyId: t.companyId || 'naqaa_basra',
        });
      }
    }
  });

  // Sort unified records by date descending
  unifiedRecords.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });

  // Filter records
  const filteredRecords = unifiedRecords.filter(item => {
    if (companyFilter !== 'all' && (item.companyId || 'shared') !== companyFilter) return false;
    if (currencyFilter !== 'all' && (item.currency || 'IQD') !== currencyFilter) return false;
    if (filterTab === 'direct' && item.source !== 'treasury') return false;
    if (filterTab === 'bill_payments' && item.source !== 'bill_payment' && item.source !== 'initial_deposit') return false;
    if (filterTab === 'broker_advances' && item.source !== 'broker_advance' && item.source !== 'broker_settlement') return false;
    if (filterTab === 'archived' && !item.attachment) return false;
    if (filterTab === 'cancelled' && item.status !== 'cancelled') return false;

    if (fromDate && item.date < fromDate) return false;
    if (toDate && item.date > toDate) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchParty = item.partyName.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchVoucher = item.voucherNo.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchBill = item.relatedBillNo?.toLowerCase().includes(q);
      if (!matchParty && !matchDesc && !matchVoucher && !matchCat && !matchBill) return false;
    }

    return true;
  });

  const totalArchivedCount = unifiedRecords.filter(t => !!t.attachment).length;
  const cancelledRecordsCount = unifiedRecords.filter(t => t.status === 'cancelled').length;

  // Dual-Company Financial Breakdown
  const activeRecords = unifiedRecords.filter(r => r.status !== 'cancelled');
  const getRecordIQD = (r: UnifiedRecord) => (r.currency === 'USD' ? r.amount * (summary.exchangeRate || r.exchangeRate || 1500) : r.amount);
  const getCommissionIQD = (r: UnifiedRecord) => {
    if (!r.hasCommission || !(r.commissionAmount && r.commissionAmount > 0)) return 0;
    const commCurr = r.commissionCurrency || r.currency || 'IQD';
    return commCurr === 'USD' ? r.commissionAmount * (summary.exchangeRate || r.exchangeRate || 1500) : r.commissionAmount;
  };

  const naqaaInflow = activeRecords.filter(r => r.type === 'deposit' && r.source !== 'broker_settlement' && r.companyId === 'naqaa_basra').reduce((sum, r) => sum + getRecordIQD(r), 0);
  const naqaaOutflow = activeRecords.filter(r => r.companyId === 'naqaa_basra').reduce((sum, r) => sum + (r.type === 'withdrawal' ? getRecordIQD(r) : 0) + getCommissionIQD(r), 0);
  const naqaaNet = naqaaInflow - naqaaOutflow;

  const sawtInflow = activeRecords.filter(r => r.type === 'deposit' && r.source !== 'broker_settlement' && r.companyId === 'sawt_aljanoub').reduce((sum, r) => sum + getRecordIQD(r), 0);
  const sawtOutflow = activeRecords.filter(r => r.companyId === 'sawt_aljanoub').reduce((sum, r) => sum + (r.type === 'withdrawal' ? getRecordIQD(r) : 0) + getCommissionIQD(r), 0);
  const sawtNet = sawtInflow - sawtOutflow;

  const sharedInflow = activeRecords.filter(r => r.type === 'deposit' && r.source !== 'broker_settlement' && (!r.companyId || r.companyId === 'shared')).reduce((sum, r) => sum + getRecordIQD(r), 0);
  const sharedOutflow = activeRecords.filter(r => !r.companyId || r.companyId === 'shared').reduce((sum, r) => sum + (r.type === 'withdrawal' ? getRecordIQD(r) : 0) + getCommissionIQD(r), 0);

  return (
    <div className="space-y-6">
      {/* 1. Metrics Cards Overview */}
      <TreasuryMetricsCards
        isMetricsOpen={isMetricsOpen}
        onToggleMetrics={handleToggleMetrics}
        summary={summary}
        onOpenExchangeRate={onOpenExchangeRate}
        naqaaInflow={naqaaInflow}
        naqaaOutflow={naqaaOutflow}
        naqaaNet={naqaaNet}
        sawtInflow={sawtInflow}
        sawtOutflow={sawtOutflow}
        sawtNet={sawtNet}
        sharedInflow={sharedInflow}
        sharedOutflow={sharedOutflow}
        totalArchivedCount={totalArchivedCount}
      />

      {/* 2. Actions & Filters */}
      <TreasuryFilters
        currentUser={currentUser}
        onOpenDeposit={onOpenDeposit}
        onOpenWithdrawal={onOpenWithdrawal}
        onPrintStatement={onPrintStatement}
        filteredCount={filteredRecords.length}
        totalCount={unifiedRecords.length}
        directTreasuryCount={treasury.length}
        totalArchivedCount={totalArchivedCount}
        cancelledRecordsCount={cancelledRecordsCount}
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        currencyFilter={currencyFilter}
        setCurrencyFilter={setCurrencyFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* 3. Table */}
      <TreasuryTable
        filteredRecords={filteredRecords}
        summary={summary}
        currentUser={currentUser}
        onViewArchive={onViewArchive}
        onPrintVoucher={onPrintVoucher}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onDeleteReceipt={onDeleteReceipt}
        onAttachReceiptToTreasury={onAttachReceiptToTreasury}
        onAttachReceiptToBillReceipt={onAttachReceiptToBillReceipt}
      />
    </div>
  );
};
