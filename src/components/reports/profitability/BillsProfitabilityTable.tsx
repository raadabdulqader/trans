import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { AnalyzedBill, BillsSummary } from '../../../utils/reportCalculations';
import { BillDrillDownCard } from './BillDrillDownCard';

interface BillsProfitabilityTableProps {
  filteredBills: AnalyzedBill[];
  filteredBillsSummary: BillsSummary;
  expandedBillId: string | null;
  setExpandedBillId: (id: string | null) => void;
  activeRate: number;
  onViewArchive?: (attachment: TreasuryAttachment, title: string) => void;
}

export const BillsProfitabilityTable: React.FC<BillsProfitabilityTableProps> = ({
  filteredBills,
  filteredBillsSummary,
  expandedBillId,
  setExpandedBillId,
  activeRate,
  onViewArchive,
}) => {
  return (
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

                      {/* 5. Broker Advances */}
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

                      {/* 9. Expand Button */}
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

                    {/* Drill-down Card */}
                    {isExpanded && (
                      <BillDrillDownCard
                        b={b}
                        activeRate={activeRate}
                        onViewArchive={onViewArchive}
                      />
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
  );
};
