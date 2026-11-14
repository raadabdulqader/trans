import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  FileCheck2, 
  TrendingUp,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Customer, Employee, TreasuryAttachment, CompanyId } from '../../types/customs';
import { formatCurrency, getReceiptBreakdownForBill } from '../../utils/storage';
import { AnalyzedBill, BillsSummary } from '../../utils/reportCalculations';

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
      {/* Part A: Executive Summary of Total Bills (تقرير مجموع البوالص) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              أولاً: خلاصة مجموع البوالص الكلي ({filteredBillsSummary.count} بوليصة فعالة)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              إجمالي قيمة المقاولات الكمركية، المقبوضات، الديون المتبقية على الزبائن، سلف وتكاليف التخليص، وصافي الأرباح
            </p>
          </div>

          {/* Filters for Bill Table */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <select
              value={billCompanyFilter}
              onChange={(e) => setBillCompanyFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">جميع الشركات ({allAnalyzedBills.length})</option>
              <option value="naqaa_basra">شركة نقاء البصرة</option>
              <option value="sawt_aljanoub">شركة صوت الجنوب</option>
            </select>

            <select
              value={billCustomerFilter}
              onChange={(e) => setBillCustomerFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">جميع الزبائن</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={billStatusFilter}
              onChange={(e) => setBillStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">منجزة ({filteredBillsSummary.completedCount})</option>
              <option value="pending">قيد التنفيذ ({filteredBillsSummary.pendingCount})</option>
              <option value="issue">معلقة ({filteredBillsSummary.issueCount})</option>
            </select>
          </div>
        </div>

        {/* 5 Accounting Summary Columns for All Bills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Contracts */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>1. مجموع عقود البوالص</span>
              <span className="font-mono text-white">{filteredBillsSummary.count} بوليصة</span>
            </div>
            <div className="text-base font-black text-white font-mono" dir="ltr">
              {formatCurrency(filteredBillsSummary.contractIQD, 'IQD')}
            </div>
            {filteredBillsSummary.contractUSD > 0 && (
              <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
                + {formatCurrency(filteredBillsSummary.contractUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
              <span>المعادل بالدينار:</span>
              <strong className="text-slate-200" dir="ltr">{formatCurrency(filteredBillsSummary.contractEqIQD, 'IQD')}</strong>
            </div>
          </div>

          {/* 2. Total Collected */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>2. المقبوض من الزبائن</span>
              <span className="font-mono text-emerald-400">
                {filteredBillsSummary.contractEqIQD > 0
                  ? `${Math.round((filteredBillsSummary.collectedEqIQD / filteredBillsSummary.contractEqIQD) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="text-base font-black text-emerald-400 font-mono" dir="ltr">
              {formatCurrency(filteredBillsSummary.collectedIQD, 'IQD')}
            </div>
            {filteredBillsSummary.collectedUSD > 0 && (
              <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
                + {formatCurrency(filteredBillsSummary.collectedUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
              <span>المعادل بالدينار:</span>
              <strong className="text-emerald-300" dir="ltr">{formatCurrency(filteredBillsSummary.collectedEqIQD, 'IQD')}</strong>
            </div>
          </div>

          {/* 3. Remaining Customer Debt */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>3. الديون المتبقية بالسوق</span>
              <span className="text-amber-400">ذمم الزبائن</span>
            </div>
            <div className="text-base font-black text-amber-400 font-mono" dir="ltr">
              {formatCurrency(filteredBillsSummary.remainingIQD, 'IQD')}
            </div>
            {filteredBillsSummary.remainingUSD > 0 && (
              <div className="text-sm font-bold text-amber-300 font-mono" dir="ltr">
                + {formatCurrency(filteredBillsSummary.remainingUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
              <span>المعادل بالدينار:</span>
              <strong className="text-amber-300" dir="ltr">{formatCurrency(filteredBillsSummary.remainingEqIQD, 'IQD')}</strong>
            </div>
          </div>

          {/* 4. Total Bill Expenses & Broker Advances */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>4. تكاليف وسلف البوالص</span>
              <span className="text-rose-400">مصاريف التخليص</span>
            </div>
            <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
              -{formatCurrency(filteredBillsSummary.totalCostIQD, 'IQD')}
            </div>
            {filteredBillsSummary.totalCostUSD > 0 && (
              <div className="text-sm font-bold text-rose-300 font-mono" dir="ltr">
                - {formatCurrency(filteredBillsSummary.totalCostUSD, 'USD')}
              </div>
            )}
            <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 font-mono flex items-center justify-between">
              <span>مصفى بوصولات: {formatCurrency(filteredBillsSummary.settledEqIQD, 'IQD')}</span>
              <span className="text-amber-300">بذمة مخلص: {formatCurrency(filteredBillsSummary.openAdvEqIQD, 'IQD')}</span>
            </div>
          </div>

          {/* 5. Net Bill Profit */}
          <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>5. صافي ربح مجموع البوالص</span>
              <span>العقد − التكلفة</span>
            </div>
            <div className={`text-base font-black font-mono ${filteredBillsSummary.netProfitIQD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
              {filteredBillsSummary.netProfitIQD >= 0 ? '+' : ''}{formatCurrency(filteredBillsSummary.netProfitIQD, 'IQD')}
            </div>
            {(filteredBillsSummary.contractUSD > 0 || filteredBillsSummary.totalCostUSD > 0) && (
              <div className={`text-sm font-bold font-mono ${filteredBillsSummary.netProfitUSD >= 0 ? 'text-cyan-400' : 'text-rose-300'}`} dir="ltr">
                {filteredBillsSummary.netProfitUSD >= 0 ? '+ ' : ''}{formatCurrency(filteredBillsSummary.netProfitUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-emerald-300/90 pt-1.5 border-t border-emerald-500/20 font-mono flex items-center justify-between">
              <span>المعادل الكلي:</span>
              <strong dir="ltr">{formatCurrency(filteredBillsSummary.netProfitEqIQD, 'IQD')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Detailed Table of Profit & Cost per Bill (تقرير أرباح ومصاريف كل بوليصة) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              ثانياً: جدول أرباح ومصاريف كل بوليصة بالتفصيل المحاسبي الدقيق
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              انقر على زر <strong className="text-cyan-400">"كشف البوليصة"</strong> في أي سطر لفتح البطاقة التفصيلية الكاملة لكافة وصولات وسلف وعمولات البوليصة
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            إجمالي الحاويات: <strong className="text-cyan-400">{filteredBillsSummary.containers} حاوية</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                <th className="py-3.5 px-4">رقم البوليصة والشركة</th>
                <th className="py-3.5 px-4">الزبون / البضاعة / المخلص</th>
                <th className="py-3.5 px-4">مبلغ العقد (المقاولة)</th>
                <th className="py-3.5 px-4">المقبوض / المتبقي</th>
                <th className="py-3.5 px-4">سلف المخلص (المصروف والمصفى)</th>
                <th className="py-3.5 px-4">عمولات ومصاريف أخرى</th>
                <th className="py-3.5 px-4">إجمالي تكلفة البوليصة</th>
                <th className="py-3.5 px-4">صافي ربح البوليصة</th>
                <th className="py-3.5 px-4 text-center no-print">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد بوالص مطابقة للفلاتر الحالية
                  </td>
                </tr>
              ) : (
                filteredBills.map(b => {
                  const isExpanded = expandedBillId === b.tx.id;
                  const isProfitable = b.netContractProfit >= 0;

                  return (
                    <React.Fragment key={b.tx.id}>
                      <tr
                        className={`transition-colors ${
                          isExpanded ? 'bg-slate-800/70' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 1. Bill & Company */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-mono font-black text-sm text-emerald-400">{b.tx.billNo}</div>
                          <div className="text-[11px] font-semibold text-slate-300 mt-0.5">{b.comp.shortName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{b.tx.date}</div>
                        </td>

                        {/* 2. Customer, Goods, Broker */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-white">{b.cust?.name || '—'}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">
                            {b.tx.goodsType || 'بضاعة عامة'} · <span className="font-mono text-cyan-400">{b.tx.containers?.length || 0} حاوية</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            المخلص: <strong className="text-amber-300">{b.emp?.name || 'غير محدد'}</strong>
                          </div>
                        </td>

                        {/* 3. Contract Amount */}
                        <td className="py-3.5 px-4 align-top font-mono" dir="ltr">
                          <div className="font-bold text-sm text-white">
                            {formatCurrency(b.fin.totalAmount, b.billCurr)}
                          </div>
                          {b.billCurr === 'USD' && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ≈ {formatCurrency(b.contractEqIQD, 'IQD')}
                            </div>
                          )}
                        </td>

                        {/* 4. Collected & Remaining */}
                        <td className="py-3.5 px-4 align-top font-mono" dir="ltr">
                          <div className="text-emerald-400 font-bold">
                            المقبوض: {formatCurrency(b.fin.totalCollected, b.billCurr)}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${b.fin.remainingAmount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                            المتبقي: {b.fin.remainingAmount > 0 ? formatCurrency(b.fin.remainingAmount, b.billCurr) : '0 (خالص)'}
                          </div>
                          {b.customerCommissionInBillCurr > 0 && (
                            <div className="text-[10px] text-amber-300/80 mt-0.5 font-sans">
                              عمولة على الزبون: {formatCurrency(b.customerCommissionInBillCurr, b.billCurr)}
                            </div>
                          )}
                        </td>

                        {/* 5. Broker Advances (Disbursed vs Settled vs Open) */}
                        <td className="py-3.5 px-4 align-top text-[11px]">
                          <div className="space-y-0.5 font-mono" dir="ltr">
                            <div className="text-amber-300 font-bold">
                              سلف مصروفة: {formatCurrency(b.advancesDisbursedInBillCurr, b.billCurr)}
                            </div>
                            <div className="text-emerald-400/90 text-[10px]">
                              مصفى بوصولات: {formatCurrency(b.advancesSettledInBillCurr, b.billCurr)}
                            </div>
                            {b.openBrokerAdvanceInBillCurr > 0 && (
                              <div className="text-rose-400 text-[10px] font-bold">
                                بذمة المخلص: {formatCurrency(b.openBrokerAdvanceInBillCurr, b.billCurr)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Commissions & Direct Expenses */}
                        <td className="py-3.5 px-4 align-top text-[11px] font-mono" dir="ltr">
                          {b.companyCommissionInBillCurr > 0 || b.directWithdrawalsInBillCurr > 0 ? (
                            <div className="space-y-0.5">
                              {b.companyCommissionInBillCurr > 0 && (
                                <div className="text-rose-300">
                                  عمولة مكتب: -{formatCurrency(b.companyCommissionInBillCurr, b.billCurr)}
                                </div>
                              )}
                              {b.directWithdrawalsInBillCurr > 0 && (
                                <div className="text-rose-300">
                                  مصاريف مباشرة: -{formatCurrency(b.directWithdrawalsInBillCurr, b.billCurr)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-sans">لا توجد</span>
                          )}
                        </td>

                        {/* 7. Total Bill Cost */}
                        <td className="py-3.5 px-4 align-top font-mono" dir="ltr">
                          <div className="font-bold text-sm text-rose-400">
                            -{formatCurrency(b.totalBillCost, b.billCurr)}
                          </div>
                          {b.billCurr === 'USD' && b.totalBillCost > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ≈ -{formatCurrency(b.totalCostEqIQD, 'IQD')}
                            </div>
                          )}
                        </td>

                        {/* 8. Net Bill Profit */}
                        <td className="py-3.5 px-4 align-top font-mono" dir="ltr">
                          <div className={`font-black text-sm ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfitable ? '+' : ''}{formatCurrency(b.netContractProfit, b.billCurr)}
                          </div>
                          {b.billCurr === 'USD' && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ≈ {formatCurrency(b.netProfitEqIQD, 'IQD')}
                            </div>
                          )}
                          <div className="text-[10px] text-cyan-300 mt-0.5 font-sans">
                            الربح النقدي المحصل: <strong className="font-mono" dir="ltr">{formatCurrency(b.netCashFlowProfit, b.billCurr)}</strong> ({b.profitMarginPct}%)
                          </div>
                        </td>

                        {/* 9. Expand / Drill-Down Button */}
                        <td className="py-3.5 px-4 align-top text-center no-print">
                          <button
                            type="button"
                            onClick={() => setExpandedBillId(isExpanded ? null : b.tx.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 mx-auto ${
                              isExpanded
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                            }`}
                          >
                            <span>كشف البوليصة</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED DRILL-DOWN: Full Bill Financial & Voucher Sheet */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b-2 border-emerald-500/30">
                          <td colSpan={9} className="p-5">
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div>
                                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-400" />
                                    <span>بطاقة التشريح المالي وكشف الوصولات للبوليصة ({b.tx.billNo})</span>
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    الزبون: <strong className="text-white">{b.cust?.name}</strong> · المخلص: <strong className="text-amber-300">{b.emp?.name || '—'}</strong> · الحاويات: {b.tx.containers.join(' ، ') || 'لا توجد أرقام حاويات'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {b.tx.agencyDocument && onViewArchive && (
                                    <button
                                      type="button"
                                      onClick={() => onViewArchive(b.tx.agencyDocument!, `ورقة الوكالة - بوليصة ${b.tx.billNo}`)}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5"
                                    >
                                      <FileCheck2 className="w-3.5 h-3.5" />
                                      <span>معاينة ورقة الوكالة المؤرشفة</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Sub-table of all receipts on this bill */}
                              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                                <table className="w-full text-right text-xs">
                                  <thead>
                                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                      <th className="py-2.5 px-3">رقم السند</th>
                                      <th className="py-2.5 px-3">نوع الحركة</th>
                                      <th className="py-2.5 px-3">التاريخ</th>
                                      <th className="py-2.5 px-3">المبلغ الأصلي</th>
                                      <th className="py-2.5 px-3">العمولة وتأثيرها</th>
                                      <th className="py-2.5 px-3">الأثر على البوليصة / الصندوق</th>
                                      <th className="py-2.5 px-3">البيان والملاحظات</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60">
                                    {b.billReceipts.length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="py-6 text-center text-slate-500">
                                          لا توجد سندات مسجلة على هذه البوليصة بعد
                                        </td>
                                      </tr>
                                    ) : (
                                      b.billReceipts.map(r => {
                                        const rCurr = r.currency || b.billCurr;
                                        const brk = getReceiptBreakdownForBill(r, b.billCurr, activeRate);
                                        return (
                                          <tr key={r.id} className="hover:bg-slate-900/50">
                                            <td className="py-2.5 px-3 font-mono font-bold text-white">{r.receiptNo}</td>
                                            <td className="py-2.5 px-3 font-semibold">
                                              {r.type === 'deposit' ? (
                                                <span className="text-cyan-400">دفعة أولى من الزبون</span>
                                              ) : r.type === 'payment' ? (
                                                <span className="text-emerald-400">دفعة تسديد من الزبون</span>
                                              ) : r.type === 'advance' ? (
                                                <span className="text-amber-400">صرف سلفة للمخلص</span>
                                              ) : (
                                                <span className="text-purple-400">تصفية وصولات المخلص</span>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-400">{r.date}</td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-white" dir="ltr">
                                              {formatCurrency(r.amount, rCurr)}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[11px]">
                                              {brk.hasCommission ? (
                                                <span className="text-amber-300">
                                                  {formatCurrency(brk.commissionAmount, brk.commissionCurrency)} ({brk.commissionBearer === 'company' ? 'على الشركة' : 'على الزبون'})
                                                </span>
                                              ) : (
                                                <span className="text-slate-500">بدون عمولة</span>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[11px]" dir="ltr">
                                              {r.type === 'deposit' || r.type === 'payment'
                                                ? `يُحتسب للبوليصة: +${formatCurrency(brk.netCreditInBillCurrency, b.billCurr)}`
                                                : r.type === 'advance'
                                                ? `سحب سلفة: -${formatCurrency(r.amount, rCurr)}`
                                                : `تصفية عهدة: ${formatCurrency(r.amount, rCurr)}`}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-300">{r.notes || '—'}</td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {filteredBills.length > 0 && (
              <tfoot>
                <tr className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs">
                  <td colSpan={2} className="py-4 px-4 text-white">
                    المجموع الكلي المعتمد ({filteredBillsSummary.count} بوليصة):
                  </td>
                  <td className="py-4 px-4 font-mono text-white" dir="ltr">
                    <div>{formatCurrency(filteredBillsSummary.contractIQD, 'IQD')}</div>
                    {filteredBillsSummary.contractUSD > 0 && <div className="text-cyan-400">+{formatCurrency(filteredBillsSummary.contractUSD, 'USD')}</div>}
                  </td>
                  <td className="py-4 px-4 font-mono" dir="ltr">
                    <div className="text-emerald-400">مقبوض: {formatCurrency(filteredBillsSummary.collectedEqIQD, 'IQD')}</div>
                    <div className="text-amber-400">متبقي: {formatCurrency(filteredBillsSummary.remainingEqIQD, 'IQD')}</div>
                  </td>
                  <td className="py-4 px-4 font-mono" dir="ltr">
                    <div className="text-amber-300">سلف: {formatCurrency(filteredBillsSummary.advancesEqIQD, 'IQD')}</div>
                    <div className="text-emerald-400 text-[11px]">مصفى: {formatCurrency(filteredBillsSummary.settledEqIQD, 'IQD')}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-rose-300" dir="ltr">
                    -{formatCurrency(filteredBillsSummary.commissionsEqIQD + filteredBillsSummary.directExpEqIQD, 'IQD')}
                  </td>
                  <td className="py-4 px-4 font-mono text-rose-400" dir="ltr">
                    -{formatCurrency(filteredBillsSummary.totalCostEqIQD, 'IQD')}
                  </td>
                  <td colSpan={2} className="py-4 px-4 font-mono text-emerald-400 text-sm" dir="ltr">
                    <div>صافي الربح المعادل: {formatCurrency(filteredBillsSummary.netProfitEqIQD, 'IQD')}</div>
                    <div className="text-[11px] text-cyan-300">النقدي المحصل: {formatCurrency(filteredBillsSummary.netCashProfitEqIQD, 'IQD')}</div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
