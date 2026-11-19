import React, { useState } from 'react';
import { Customer, Employee, TreasuryAttachment, CompanyId } from '../../types/customs';
import { AnalyzedBill, BillsSummary } from '../../utils/reportCalculations';
import { BillsProfitabilitySummary } from './profitability/BillsProfitabilitySummary';
import { BillsProfitabilityTable } from './profitability/BillsProfitabilityTable';

interface BillsProfitabilityReportProps {
  allAnalyzedBills: AnalyzedBill[];
  filteredBills: AnalyzedBill[];
  filteredBillsSummary: BillsSummary;
  customers: Customer[];
  employees: Employee[];
  billCompanyFilter: 'all' | CompanyId;
  setBillCompanyFilter: (val: 'all' | CompanyId) => void;
  billCustomerFilter: string;
  setBillCustomerFilter: (val: string) => void;
  billStatusFilter: string;
  setBillStatusFilter: (val: string) => void;
  activeRate: number;
  onViewArchive?: (attachment: TreasuryAttachment, title: string) => void;
}

export const BillsProfitabilityReport: React.FC<BillsProfitabilityReportProps> = ({
  allAnalyzedBills,
  filteredBills,
  filteredBillsSummary,
  customers,
  billCompanyFilter,
  setBillCompanyFilter,
  billCustomerFilter,
  setBillCustomerFilter,
  billStatusFilter,
  setBillStatusFilter,
  activeRate,
  onViewArchive,
}) => {
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Part A: Executive Summary of Total Bills */}
      <BillsProfitabilitySummary
        allAnalyzedBills={allAnalyzedBills}
        filteredBillsSummary={filteredBillsSummary}
        customers={customers}
        billCompanyFilter={billCompanyFilter}
        setBillCompanyFilter={setBillCompanyFilter}
        billCustomerFilter={billCustomerFilter}
        setBillCustomerFilter={setBillCustomerFilter}
        billStatusFilter={billStatusFilter}
        setBillStatusFilter={setBillStatusFilter}
      />

      {/* Part B: Detailed Table of Profit & Cost per Bill */}
      <BillsProfitabilityTable
        filteredBills={filteredBills}
        filteredBillsSummary={filteredBillsSummary}
        expandedBillId={expandedBillId}
        setExpandedBillId={setExpandedBillId}
        activeRate={activeRate}
        onViewArchive={onViewArchive}
      />
    </div>
  );
};
