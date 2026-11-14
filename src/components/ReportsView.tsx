'use client';

import React, { useState } from 'react';
import { Customer, Employee, Transaction, Receipt, AppUser, TreasuryTransaction, TreasuryAttachment, CompanyId } from '../types/customs';
import { getTreasuryFinancialSummary, getEmployeeAdvances } from '../utils/storage';
import { 
  analyzeBill, 
  aggregateBills, 
  buildCompanyFinancialStatement, 
  CustomerReportSummary, 
  BrokerReportSummary 
} from '../utils/reportCalculations';
import { ReportsNavigation, MainReportSection } from './reports/ReportsNavigation';
import { BillsProfitabilityReport } from './reports/BillsProfitabilityReport';
import { CombinedStatementReport } from './reports/CombinedStatementReport';
import { CompanyDetailedReport } from './reports/CompanyDetailedReport';
import { CustomersLedgerReport } from './reports/CustomersLedgerReport';
import { BrokersExpensesReport } from './reports/BrokersExpensesReport';

interface ReportsViewProps {
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  treasury?: TreasuryTransaction[];
  currentUser: AppUser;
  exchangeRate?: number;
  onPrintReport?: (title: string, contentHtml: string) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  customers,
  employees,
  receipts,
  treasury = [],
  currentUser,
  exchangeRate = 1500,
  onViewArchive,
}) => {
  const [activeSection, setActiveSection] = useState<MainReportSection>('bills_profitability');
  const [selectedCompany, setSelectedCompany] = useState<CompanyId>('naqaa_basra');

  // Global Date & Search Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Section-specific Filters
  const [billCompanyFilter, setBillCompanyFilter] = useState<'all' | CompanyId>('all');
  const [billCustomerFilter, setBillCustomerFilter] = useState<string>('all');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('all');
  const [expenseSubTab, setExpenseSubTab] = useState<'brokers' | 'admin_expenses'>('brokers');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');

  const activeRate = exchangeRate && exchangeRate > 0 ? exchangeRate : 1500;

  // Date filter helper
  const inDateRange = (dateStr?: string) => {
    if (!dateStr) return true;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    return true;
  };

  // 1. Analyze all active bills
  const activeTransactions = transactions.filter(t => t.status !== 'cancelled' && inDateRange(t.date));
  const allAnalyzedBills = activeTransactions.map(tx =>
    analyzeBill(tx, receipts, activeRate, customers, employees, treasury)
  );

  // Filtered bills for Section 1
  const filteredBills = allAnalyzedBills.filter(b => {
    if (billCompanyFilter !== 'all' && (b.tx.companyId || 'naqaa_basra') !== billCompanyFilter) return false;
    if (billCustomerFilter !== 'all' && b.tx.customerId !== billCustomerFilter) return false;
    if (billStatusFilter !== 'all' && b.tx.status !== billStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBill = b.tx.billNo.toLowerCase().includes(q);
      const matchCust = b.cust?.name.toLowerCase().includes(q);
      const matchEmp = b.emp?.name.toLowerCase().includes(q);
      const matchGoods = b.tx.goodsType?.toLowerCase().includes(q);
      if (!matchBill && !matchCust && !matchEmp && !matchGoods) return false;
    }
    return true;
  });

  const filteredBillsSummary = aggregateBills(filteredBills);

  // 2. Company Statements
  const naqaaStatement = buildCompanyFinancialStatement('naqaa_basra', allAnalyzedBills, treasury, activeTransactions, activeRate, inDateRange);
  const sawtStatement = buildCompanyFinancialStatement('sawt_aljanoub', allAnalyzedBills, treasury, activeTransactions, activeRate, inDateRange);
  const sharedStatement = buildCompanyFinancialStatement('shared', allAnalyzedBills, treasury, activeTransactions, activeRate, inDateRange);
  const combinedStatement = buildCompanyFinancialStatement('all', allAnalyzedBills, treasury, activeTransactions, activeRate, inDateRange);
  const singleCompanyStatement = selectedCompany === 'naqaa_basra' ? naqaaStatement : sawtStatement;

  const treasurySummary = getTreasuryFinancialSummary(treasury, receipts, activeRate);

  // 3. Customer Summaries
  const customerSummaries: CustomerReportSummary[] = customers.map(cust => {
    const custBills = allAnalyzedBills.filter(b => b.tx.customerId === cust.id);
    const agg = aggregateBills(custBills);
    const custReceipts = receipts.filter(
      r => r.status !== 'cancelled' && (r.type === 'deposit' || r.type === 'payment') && (r.customerId === cust.id || custBills.some(b => b.tx.id === r.billId))
    );
    return {
      customer: cust,
      bills: custBills,
      receipts: custReceipts,
      agg,
    };
  }).filter(cs => {
    if (selectedCustomerId !== 'all' && cs.customer.id !== selectedCustomerId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!cs.customer.name.toLowerCase().includes(q) && !(cs.customer.phone || '').includes(q)) return false;
    }
    return true;
  });

  // 4. Broker Summaries
  const brokerSummaries: BrokerReportSummary[] = employees
    .filter(e => !e.category || e.category === 'broker' || e.category === 'both')
    .map(emp => {
      const adv = getEmployeeAdvances(emp.id, receipts);
      const empBills = allAnalyzedBills.filter(b => b.tx.employeeId === emp.id);
      const empReceipts = receipts.filter(
        r => r.status !== 'cancelled' && (r.type === 'advance' || r.type === 'settlement') && r.employeeId === emp.id && inDateRange(r.date)
      );
      return {
        employee: emp,
        adv,
        billsCount: empBills.length,
        receipts: empReceipts,
      };
    })
    .filter(bs => {
      if (selectedBrokerId !== 'all' && bs.employee.id !== selectedBrokerId) return false;
      return true;
    });

  // 5. Admin withdrawals
  const adminWithdrawals = (treasury || []).filter(t => {
    if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
    if (t.category?.includes('تصريف وتحويل عملة')) return false;
    if (!inDateRange(t.date)) return false;
    if (expenseCategoryFilter !== 'all' && t.category !== expenseCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (
        !t.voucherNo.toLowerCase().includes(q) &&
        !t.partyName.toLowerCase().includes(q) &&
        !t.category.toLowerCase().includes(q) &&
        !(t.description || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const uniqueExpenseCategories = Array.from(
    new Set((treasury || []).filter(t => t.status !== 'cancelled' && t.type === 'withdrawal').map(t => t.category))
  );

  return (
    <div className="space-y-6">
      {/* Navigation and Global Filters */}
      <ReportsNavigation
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeRate={activeRate}
        totalBillsCount={allAnalyzedBills.length}
        customersCount={customers.length}
        brokersCount={brokerSummaries.length}
        adminExpensesCount={adminWithdrawals.length}
      />

      {/* Section 1: Bills Profitability */}
      {activeSection === 'bills_profitability' && (
        <BillsProfitabilityReport
          allAnalyzedBills={allAnalyzedBills}
          filteredBills={filteredBills}
          filteredBillsSummary={filteredBillsSummary}
          customers={customers}
          employees={employees}
          billCompanyFilter={billCompanyFilter}
          setBillCompanyFilter={setBillCompanyFilter}
          billCustomerFilter={billCustomerFilter}
          setBillCustomerFilter={setBillCustomerFilter}
          billStatusFilter={billStatusFilter}
          setBillStatusFilter={setBillStatusFilter}
          activeRate={activeRate}
          onViewArchive={onViewArchive}
        />
      )}

      {/* Section 2: Combined Companies Statement */}
      {activeSection === 'combined_statement' && (
        <CombinedStatementReport
          naqaaStatement={naqaaStatement}
          sawtStatement={sawtStatement}
          sharedStatement={sharedStatement}
          combinedStatement={combinedStatement}
          treasurySummary={treasurySummary}
        />
      )}

      {/* Section 3: Single Company Report */}
      {activeSection === 'company_report' && (
        <CompanyDetailedReport
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          naqaaStatement={naqaaStatement}
          sawtStatement={sawtStatement}
          singleCompanyStatement={singleCompanyStatement}
        />
      )}

      {/* Section 4: Customers Ledger */}
      {activeSection === 'customers_ledger' && (
        <CustomersLedgerReport
          customerSummaries={customerSummaries}
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
        />
      )}

      {/* Section 5: Brokers & Admin Expenses */}
      {activeSection === 'brokers_expenses' && (
        <BrokersExpensesReport
          brokerSummaries={brokerSummaries}
          adminWithdrawals={adminWithdrawals}
          expenseSubTab={expenseSubTab}
          setExpenseSubTab={setExpenseSubTab}
          expenseCategoryFilter={expenseCategoryFilter}
          setExpenseCategoryFilter={setExpenseCategoryFilter}
          uniqueExpenseCategories={uniqueExpenseCategories}
        />
      )}

      {/* Official Print Footer Signatures */}
      <div className="hidden print:block pt-8 mt-12 border-t-2 border-slate-900 text-xs">
        <div className="grid grid-cols-3 gap-8 text-center text-slate-900 font-bold">
          <div className="space-y-12">
            <span>توقيع أمين الصندوق والخزينة</span>
            <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
          </div>
          <div className="space-y-12">
            <span>توقيع محاسب التدقيق</span>
            <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
          </div>
          <div className="space-y-12">
            <span>مصادقة المدير العام</span>
            <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
