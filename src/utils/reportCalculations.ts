import { 
  Customer, 
  Employee, 
  Transaction, 
  Receipt, 
  TreasuryTransaction, 
  CompanyId, 
  COMPANIES, 
  Currency
} from '../types/customs';
import { getBillFinancials, getEmployeeAdvances, BillFinancials } from './storage';

export interface AnalyzedBill {
  tx: Transaction;
  fin: BillFinancials;
  billCurr: Currency;
  cust: Customer | undefined;
  emp: Employee | undefined;
  comp: typeof COMPANIES['naqaa_basra'];
  billReceipts: Receipt[];
  customerPayments: Receipt[];
  directWithdrawals: TreasuryTransaction[];
  advancesDisbursedInBillCurr: number;
  advancesSettledInBillCurr: number;
  openBrokerAdvanceInBillCurr: number;
  companyCommissionInBillCurr: number;
  customerCommissionInBillCurr: number;
  directWithdrawalsInBillCurr: number;
  totalBillCost: number;
  settledBillCost: number;
  netContractProfit: number;
  netCashFlowProfit: number;
  contractEqIQD: number;
  collectedEqIQD: number;
  remainingEqIQD: number;
  advancesEqIQD: number;
  settledEqIQD: number;
  openAdvEqIQD: number;
  companyCommEqIQD: number;
  directExpEqIQD: number;
  totalCostEqIQD: number;
  netProfitEqIQD: number;
  netCashProfitEqIQD: number;
  profitMarginPct: number;
  collectionPct: number;
  advancesIQD: number;
  advancesUSD: number;
  settledIQD: number;
  settledUSD: number;
}

export interface BillsSummary {
  count: number;
  completedCount: number;
  pendingCount: number;
  issueCount: number;
  containers: number;
  profitableBillsCount: number;
  lossBillsCount: number;
  contractIQD: number;
  contractUSD: number;
  collectedIQD: number;
  collectedUSD: number;
  remainingIQD: number;
  remainingUSD: number;
  advancesIQD: number;
  advancesUSD: number;
  settledIQD: number;
  settledUSD: number;
  openAdvIQD: number;
  openAdvUSD: number;
  commissionsIQD: number;
  commissionsUSD: number;
  directExpIQD: number;
  directExpUSD: number;
  totalCostIQD: number;
  totalCostUSD: number;
  netProfitIQD: number;
  netProfitUSD: number;
  netCashProfitIQD: number;
  netCashProfitUSD: number;
  contractEqIQD: number;
  collectedEqIQD: number;
  remainingEqIQD: number;
  advancesEqIQD: number;
  settledEqIQD: number;
  openAdvEqIQD: number;
  commissionsEqIQD: number;
  directExpEqIQD: number;
  totalCostEqIQD: number;
  netProfitEqIQD: number;
  netCashProfitEqIQD: number;
}

export interface CompanyFinancialStatement {
  scope: CompanyId | 'shared' | 'all';
  scopedBills: AnalyzedBill[];
  scopedTreasury: TreasuryTransaction[];
  billsAgg: BillsSummary;
  capitalDepositsIQD: number;
  capitalDepositsUSD: number;
  salariesIQD: number;
  salariesUSD: number;
  rentsIQD: number;
  rentsUSD: number;
  dailyExpensesIQD: number;
  dailyExpensesUSD: number;
  carriersExpensesIQD: number;
  carriersExpensesUSD: number;
  adminCommissionsIQD: number;
  adminCommissionsUSD: number;
  totalAdminExpensesIQD: number;
  totalAdminExpensesUSD: number;
  totalAdminExpensesEqIQD: number;
  grandTotalExpensesIQD: number;
  grandTotalExpensesUSD: number;
  grandTotalExpensesEqIQD: number;
  finalNetProfitIQD: number;
  finalNetProfitUSD: number;
  finalNetProfitEqIQD: number;
  finalCashProfitEqIQD: number;
}

export interface CustomerReportSummary {
  customer: Customer;
  bills: AnalyzedBill[];
  receipts: Receipt[];
  agg: BillsSummary;
}

export interface BrokerReportSummary {
  employee: Employee;
  adv: ReturnType<typeof getEmployeeAdvances>;
  billsCount: number;
  receipts: Receipt[];
}

export function analyzeBill(
  tx: Transaction,
  receipts: Receipt[],
  activeRate: number,
  customers: Customer[],
  employees: Employee[],
  treasury: TreasuryTransaction[] = []
): AnalyzedBill {
  const fin = getBillFinancials(tx, receipts, activeRate);
  const billCurr: Currency = fin.currency === 'USD' ? 'USD' : 'IQD';
  const rate = activeRate > 0 ? activeRate : 1500;

  const cust = customers.find(c => c.id === tx.customerId);
  const emp = employees.find(e => e.id === tx.employeeId);
  const comp = COMPANIES[tx.companyId || 'naqaa_basra'];

  // Active receipts for this bill
  const billReceipts = receipts.filter(r => r.billId === tx.id && r.status !== 'cancelled');

  // Customer Payments Breakdown
  const customerPayments = billReceipts.filter(r => r.type === 'deposit' || r.type === 'payment');

  let advancesDisbursedInBillCurr = 0;
  let advancesSettledInBillCurr = 0;
  let advancesIQD = 0, advancesUSD = 0;
  let settledIQD = 0, settledUSD = 0;

  let companyCommissionInBillCurr = 0;
  let customerCommissionInBillCurr = 0;

  billReceipts.forEach(r => {
    const rCurr: Currency = r.currency || billCurr;
    const rRate = r.exchangeRate || rate;

    const toBillCurr = (amt: number, fromCurr: Currency) => {
      if (fromCurr === billCurr) return amt;
      return billCurr === 'USD' ? amt / rRate : amt * rRate;
    };

    if (r.type === 'advance') {
      if (rCurr === 'USD') advancesUSD += r.amount;
      else advancesIQD += r.amount;
      advancesDisbursedInBillCurr += toBillCurr(r.amount, rCurr);
    } else if (r.type === 'settlement') {
      if (rCurr === 'USD') settledUSD += r.amount;
      else settledIQD += r.amount;
      advancesSettledInBillCurr += toBillCurr(r.amount, rCurr);
    }

    if (r.hasCommission && (r.commissionAmount || 0) > 0) {
      const cAmt = Number(r.commissionAmount) || 0;
      const cCurr: Currency = r.commissionCurrency || rCurr;
      const cInBill = toBillCurr(cAmt, cCurr);
      if (r.commissionBearer === 'company') {
        companyCommissionInBillCurr += cInBill;
      } else {
        customerCommissionInBillCurr += cInBill;
      }
    }
  });

  const openBrokerAdvanceInBillCurr = Math.max(0, Math.round((advancesDisbursedInBillCurr - advancesSettledInBillCurr) * 100) / 100);

  // Direct Treasury Withdrawals linked to this Bill No (excluding carrier payments to avoid duplicate counting with carrier cost)
  const directWithdrawals = (treasury || []).filter(
    t => t.status !== 'cancelled' && t.type === 'withdrawal' && t.relatedBillNo && t.relatedBillNo.trim() === tx.billNo.trim() && !t.carrierId && t.subAccount !== 'carriers'
  );
  let directWithdrawalsInBillCurr = 0;
  directWithdrawals.forEach(t => {
    const tCurr: Currency = t.currency || 'IQD';
    const tRate = t.exchangeRate || rate;
    if (tCurr === billCurr) directWithdrawalsInBillCurr += t.amount;
    else directWithdrawalsInBillCurr += billCurr === 'USD' ? t.amount / tRate : t.amount * tRate;
  });

  advancesDisbursedInBillCurr = Math.round(advancesDisbursedInBillCurr * 100) / 100;
  advancesSettledInBillCurr = Math.round(advancesSettledInBillCurr * 100) / 100;
  companyCommissionInBillCurr = Math.round(companyCommissionInBillCurr * 100) / 100;
  customerCommissionInBillCurr = Math.round(customerCommissionInBillCurr * 100) / 100;
  directWithdrawalsInBillCurr = Math.round(directWithdrawalsInBillCurr * 100) / 100;
  const carrierCostInBillCurr = fin.totalCarrierCost || 0;

  const totalBillCost = Math.round((advancesDisbursedInBillCurr + companyCommissionInBillCurr + directWithdrawalsInBillCurr + carrierCostInBillCurr) * 100) / 100;
  const settledBillCost = Math.round((advancesSettledInBillCurr + companyCommissionInBillCurr + directWithdrawalsInBillCurr + carrierCostInBillCurr) * 100) / 100;

  const netContractProfit = Math.round((fin.totalAmount - totalBillCost) * 100) / 100;
  const netCashFlowProfit = Math.round((fin.totalCollected - totalBillCost) * 100) / 100;

  const toIQD = (val: number) => (billCurr === 'USD' ? Math.round(val * rate) : Math.round(val));

  const contractEqIQD = toIQD(fin.totalAmount);
  const collectedEqIQD = toIQD(fin.totalCollected);
  const remainingEqIQD = toIQD(fin.remainingAmount);
  const advancesEqIQD = toIQD(advancesDisbursedInBillCurr);
  const settledEqIQD = toIQD(advancesSettledInBillCurr);
  const openAdvEqIQD = toIQD(openBrokerAdvanceInBillCurr);
  const companyCommEqIQD = toIQD(companyCommissionInBillCurr);
  const directExpEqIQD = toIQD(directWithdrawalsInBillCurr);
  const totalCostEqIQD = toIQD(totalBillCost);
  const netProfitEqIQD = contractEqIQD - totalCostEqIQD;
  const netCashProfitEqIQD = collectedEqIQD - totalCostEqIQD;

  const profitMarginPct = fin.totalAmount > 0 ? Math.round((netContractProfit / fin.totalAmount) * 100) : 0;
  const collectionPct = fin.totalAmount > 0 ? Math.min(100, Math.round((fin.totalCollected / fin.totalAmount) * 100)) : 0;

  return {
    tx,
    fin,
    billCurr,
    cust,
    emp,
    comp,
    billReceipts,
    customerPayments,
    directWithdrawals,
    advancesDisbursedInBillCurr,
    advancesSettledInBillCurr,
    openBrokerAdvanceInBillCurr,
    companyCommissionInBillCurr,
    customerCommissionInBillCurr,
    directWithdrawalsInBillCurr,
    totalBillCost,
    settledBillCost,
    netContractProfit,
    netCashFlowProfit,
    contractEqIQD,
    collectedEqIQD,
    remainingEqIQD,
    advancesEqIQD,
    settledEqIQD,
    openAdvEqIQD,
    companyCommEqIQD,
    directExpEqIQD,
    totalCostEqIQD,
    netProfitEqIQD,
    netCashProfitEqIQD,
    profitMarginPct,
    collectionPct,
    advancesIQD,
    advancesUSD,
    settledIQD,
    settledUSD,
  };
}

export function aggregateBills(list: AnalyzedBill[]): BillsSummary {
  return list.reduce(
    (acc, b) => {
      acc.count++;
      acc.containers += b.tx.containers?.length || 0;
      if (b.tx.status === 'completed') acc.completedCount++;
      else if (b.tx.status === 'pending') acc.pendingCount++;
      else if (b.tx.status === 'issue') acc.issueCount++;

      if (b.billCurr === 'USD') {
        acc.contractUSD += b.fin.totalAmount;
        acc.collectedUSD += b.fin.totalCollected;
        acc.remainingUSD += b.fin.remainingAmount;
        acc.advancesUSD += b.advancesDisbursedInBillCurr;
        acc.settledUSD += b.advancesSettledInBillCurr;
        acc.openAdvUSD += b.openBrokerAdvanceInBillCurr;
        acc.commissionsUSD += b.companyCommissionInBillCurr;
        acc.directExpUSD += b.directWithdrawalsInBillCurr;
        acc.totalCostUSD += b.totalBillCost;
        acc.netProfitUSD += b.netContractProfit;
        acc.netCashProfitUSD += b.netCashFlowProfit;
      } else {
        acc.contractIQD += b.fin.totalAmount;
        acc.collectedIQD += b.fin.totalCollected;
        acc.remainingIQD += b.fin.remainingAmount;
        acc.advancesIQD += b.advancesDisbursedInBillCurr;
        acc.settledIQD += b.advancesSettledInBillCurr;
        acc.openAdvIQD += b.openBrokerAdvanceInBillCurr;
        acc.commissionsIQD += b.companyCommissionInBillCurr;
        acc.directExpIQD += b.directWithdrawalsInBillCurr;
        acc.totalCostIQD += b.totalBillCost;
        acc.netProfitIQD += b.netContractProfit;
        acc.netCashProfitIQD += b.netCashFlowProfit;
      }

      acc.contractEqIQD += b.contractEqIQD;
      acc.collectedEqIQD += b.collectedEqIQD;
      acc.remainingEqIQD += b.remainingEqIQD;
      acc.advancesEqIQD += b.advancesEqIQD;
      acc.settledEqIQD += b.settledEqIQD;
      acc.openAdvEqIQD += b.openAdvEqIQD;
      acc.commissionsEqIQD += b.companyCommEqIQD;
      acc.directExpEqIQD += b.directExpEqIQD;
      acc.totalCostEqIQD += b.totalCostEqIQD;
      acc.netProfitEqIQD += b.netProfitEqIQD;
      acc.netCashProfitEqIQD += b.netCashProfitEqIQD;

      if (b.netContractProfit > 0) acc.profitableBillsCount++;
      else if (b.netContractProfit < 0) acc.lossBillsCount++;

      return acc;
    },
    {
      count: 0,
      completedCount: 0,
      pendingCount: 0,
      issueCount: 0,
      containers: 0,
      profitableBillsCount: 0,
      lossBillsCount: 0,
      contractIQD: 0,
      contractUSD: 0,
      collectedIQD: 0,
      collectedUSD: 0,
      remainingIQD: 0,
      remainingUSD: 0,
      advancesIQD: 0,
      advancesUSD: 0,
      settledIQD: 0,
      settledUSD: 0,
      openAdvIQD: 0,
      openAdvUSD: 0,
      commissionsIQD: 0,
      commissionsUSD: 0,
      directExpIQD: 0,
      directExpUSD: 0,
      totalCostIQD: 0,
      totalCostUSD: 0,
      netProfitIQD: 0,
      netProfitUSD: 0,
      netCashProfitIQD: 0,
      netCashProfitUSD: 0,
      contractEqIQD: 0,
      collectedEqIQD: 0,
      remainingEqIQD: 0,
      advancesEqIQD: 0,
      settledEqIQD: 0,
      openAdvEqIQD: 0,
      commissionsEqIQD: 0,
      directExpEqIQD: 0,
      totalCostEqIQD: 0,
      netProfitEqIQD: 0,
      netCashProfitEqIQD: 0,
    }
  );
}

export function buildCompanyFinancialStatement(
  scope: CompanyId | 'shared' | 'all',
  allAnalyzedBills: AnalyzedBill[],
  treasury: TreasuryTransaction[],
  activeTransactions: Transaction[],
  activeRate: number,
  inDateRange: (dateStr?: string) => boolean
): CompanyFinancialStatement {
  const scopedBills = allAnalyzedBills.filter(b => {
    if (scope === 'all') return true;
    if (scope === 'shared') return false;
    return (b.tx.companyId || 'naqaa_basra') === scope;
  });

  const billsAgg = aggregateBills(scopedBills);

  const scopedTreasury = (treasury || []).filter(t => {
    if (t.status === 'cancelled') return false;
    if (!inDateRange(t.date)) return false;
    const tComp = t.companyId || 'shared';
    if (scope === 'all') return true;
    return tComp === scope;
  });

  let capitalDepositsIQD = 0, capitalDepositsUSD = 0;
  let salariesIQD = 0, salariesUSD = 0;
  let rentsIQD = 0, rentsUSD = 0;
  let dailyExpensesIQD = 0, dailyExpensesUSD = 0;
  let carriersExpensesIQD = 0, carriersExpensesUSD = 0;
  let adminCommissionsIQD = 0, adminCommissionsUSD = 0;

  scopedTreasury.forEach(t => {
    if (t.category?.includes('تصريف وتحويل عملة')) return;
    const isDirectBillExp = t.relatedBillNo && activeTransactions.some(tx => tx.billNo.trim() === t.relatedBillNo?.trim());
    if (isDirectBillExp) return;

    const tCurr: Currency = t.currency || 'IQD';
    if (t.type === 'deposit') {
      if (tCurr === 'USD') capitalDepositsUSD += t.amount;
      else capitalDepositsIQD += t.amount;
    } else if (t.type === 'withdrawal') {
      const isSalary = t.subAccount === 'salaries' || t.category?.includes('رواتب');
      const isRent = t.subAccount === 'rents' || t.category?.includes('إيجار');
      const isCarrier = t.subAccount === 'carriers' || !!t.carrierId || t.category?.includes('نقل') || t.category?.includes('ناقل');
      if (isSalary) {
        if (tCurr === 'USD') salariesUSD += t.amount;
        else salariesIQD += t.amount;
      } else if (isRent) {
        if (tCurr === 'USD') rentsUSD += t.amount;
        else rentsIQD += t.amount;
      } else if (isCarrier) {
        if (tCurr === 'USD') carriersExpensesUSD += t.amount;
        else carriersExpensesIQD += t.amount;
      } else {
        if (tCurr === 'USD') dailyExpensesUSD += t.amount;
        else dailyExpensesIQD += t.amount;
      }

      if (t.hasCommission && (t.commissionAmount || 0) > 0 && t.commissionBearer === 'company') {
        const cCurr = t.commissionCurrency || tCurr;
        if (cCurr === 'USD') adminCommissionsUSD += t.commissionAmount || 0;
        else adminCommissionsIQD += t.commissionAmount || 0;
      }
    }
  });

  const totalAdminExpensesIQD = salariesIQD + rentsIQD + dailyExpensesIQD + carriersExpensesIQD + adminCommissionsIQD;
  const totalAdminExpensesUSD = salariesUSD + rentsUSD + dailyExpensesUSD + carriersExpensesUSD + adminCommissionsUSD;
  const totalAdminExpensesEqIQD = totalAdminExpensesIQD + Math.round(totalAdminExpensesUSD * activeRate);

  const grandTotalExpensesIQD = billsAgg.totalCostIQD + totalAdminExpensesIQD;
  const grandTotalExpensesUSD = billsAgg.totalCostUSD + totalAdminExpensesUSD;
  const grandTotalExpensesEqIQD = billsAgg.totalCostEqIQD + totalAdminExpensesEqIQD;

  const finalNetProfitIQD = billsAgg.netProfitIQD - totalAdminExpensesIQD;
  const finalNetProfitUSD = billsAgg.netProfitUSD - totalAdminExpensesUSD;
  const finalNetProfitEqIQD = billsAgg.netProfitEqIQD - totalAdminExpensesEqIQD;
  const finalCashProfitEqIQD = billsAgg.collectedEqIQD - grandTotalExpensesEqIQD;

  return {
    scope,
    scopedBills,
    scopedTreasury,
    billsAgg,
    capitalDepositsIQD,
    capitalDepositsUSD,
    salariesIQD,
    salariesUSD,
    rentsIQD,
    rentsUSD,
    dailyExpensesIQD,
    dailyExpensesUSD,
    carriersExpensesIQD,
    carriersExpensesUSD,
    adminCommissionsIQD,
    adminCommissionsUSD,
    totalAdminExpensesIQD,
    totalAdminExpensesUSD,
    totalAdminExpensesEqIQD,
    grandTotalExpensesIQD,
    grandTotalExpensesUSD,
    grandTotalExpensesEqIQD,
    finalNetProfitIQD,
    finalNetProfitUSD,
    finalNetProfitEqIQD,
    finalCashProfitEqIQD,
  };
}
