import React from 'react';
import { CompanyId, COMPANIES } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { CompanyFinancialStatement } from '../../utils/reportCalculations';

interface CompanyDetailedReportProps {
  selectedCompany: CompanyId;
  setSelectedCompany: (company: CompanyId) => void;
  naqaaStatement: CompanyFinancialStatement;
  sawtStatement: CompanyFinancialStatement;
  singleCompanyStatement: CompanyFinancialStatement;
}

export const CompanyDetailedReport: React.FC<CompanyDetailedReportProps> = ({
  selectedCompany,
  setSelectedCompany,
  naqaaStatement,
  sawtStatement,
  singleCompanyStatement,
}) => {
  return (
    <div className="space-y-6">
      {/* Company Selector Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
        <button
          type="button"
          onClick={() => setSelectedCompany('naqaa_basra')}
          className={`p-5 rounded-3xl border text-right transition flex items-center justify-between ${
            selectedCompany === 'naqaa_basra'
              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-xl'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div>
            <div className="text-base font-black text-emerald-400">{COMPANIES.naqaa_basra.fullName}</div>
            <div className="text-xs text-slate-300 mt-1">
              البوالص: <strong className="font-mono text-white">{naqaaStatement.billsAgg.count}</strong> · صافي الربح:{' '}
              <strong className="font-mono text-emerald-300" dir="ltr">
                {formatCurrency(naqaaStatement.finalNetProfitEqIQD, 'IQD')}
              </strong>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedCompany === 'naqaa_basra' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {selectedCompany === 'naqaa_basra' ? 'معروض الآن' : 'عرض التقرير'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCompany('sawt_aljanoub')}
          className={`p-5 rounded-3xl border text-right transition flex items-center justify-between ${
            selectedCompany === 'sawt_aljanoub'
              ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-xl'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div>
            <div className="text-base font-black text-cyan-400">{COMPANIES.sawt_aljanoub.fullName}</div>
            <div className="text-xs text-slate-300 mt-1">
              البوالص: <strong className="font-mono text-white">{sawtStatement.billsAgg.count}</strong> · صافي الربح:{' '}
              <strong className="font-mono text-cyan-300" dir="ltr">
                {formatCurrency(sawtStatement.finalNetProfitEqIQD, 'IQD')}
              </strong>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedCompany === 'sawt_aljanoub' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {selectedCompany === 'sawt_aljanoub' ? 'معروض الآن' : 'عرض التقرير'}
          </span>
        </button>
      </div>

      {/* Company Statement Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white">
              التقرير المالي والتشغيلي المعتمد — {COMPANIES[selectedCompany].fullName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {COMPANIES[selectedCompany].address} · {COMPANIES[selectedCompany].regNo}
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-slate-300">
            عدد البوالص: <strong className="text-white">{singleCompanyStatement.billsAgg.count}</strong> · الحاويات:{' '}
            <strong className="text-cyan-400">{singleCompanyStatement.billsAgg.containers}</strong>
          </div>
        </div>

        {/* 4 Key Company Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">1. عقود وبوالص الشركة:</span>
            <div className="text-base font-black text-white font-mono" dir="ltr">
              {formatCurrency(singleCompanyStatement.billsAgg.contractIQD, 'IQD')}
            </div>
            {singleCompanyStatement.billsAgg.contractUSD > 0 && (
              <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
                + {formatCurrency(singleCompanyStatement.billsAgg.contractUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
              المعادل: {formatCurrency(singleCompanyStatement.billsAgg.contractEqIQD, 'IQD')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">2. المقبوض والديون المتبقية:</span>
            <div className="text-base font-black text-emerald-400 font-mono" dir="ltr">
              مقبوض: {formatCurrency(singleCompanyStatement.billsAgg.collectedEqIQD, 'IQD')}
            </div>
            <div className="text-sm font-bold text-amber-400 font-mono" dir="ltr">
              متبقي: {formatCurrency(singleCompanyStatement.billsAgg.remainingEqIQD, 'IQD')}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              نسبة التحصيل:{' '}
              {singleCompanyStatement.billsAgg.contractEqIQD > 0
                ? Math.round(
                    (singleCompanyStatement.billsAgg.collectedEqIQD / singleCompanyStatement.billsAgg.contractEqIQD) * 100
                  )
                : 0}
              %
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">3. تكاليف البوالص والمصاريف الإدارية:</span>
            <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
              -{formatCurrency(singleCompanyStatement.grandTotalExpensesEqIQD, 'IQD')}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
              سلف وتكاليف بوالص: {formatCurrency(singleCompanyStatement.billsAgg.totalCostEqIQD, 'IQD')}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              مصاريف إدارية للشركة: {formatCurrency(singleCompanyStatement.totalAdminExpensesEqIQD, 'IQD')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <span className="text-xs text-emerald-300 font-bold">4. صافي ربح الشركة النهائي:</span>
            <div className="text-base font-black text-emerald-400 font-mono" dir="ltr">
              {formatCurrency(singleCompanyStatement.finalNetProfitEqIQD, 'IQD')}
            </div>
            <div className="text-[11px] text-cyan-300 pt-1 border-t border-emerald-500/20 font-mono">
              الربح النقدي المحصل: {formatCurrency(singleCompanyStatement.finalCashProfitEqIQD, 'IQD')}
            </div>
          </div>
        </div>

        {/* Company Bills Table */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs">
            كشف بوالص وتكاليف وأرباح {COMPANIES[selectedCompany].name} ({singleCompanyStatement.scopedBills.length} بوليصة)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">رقم البوليصة</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">المخلص</th>
                  <th className="py-2.5 px-3">قيمة العقد</th>
                  <th className="py-2.5 px-3">المقبوض</th>
                  <th className="py-2.5 px-3">المتبقي</th>
                  <th className="py-2.5 px-3">سلف وتكاليف البوليصة</th>
                  <th className="py-2.5 px-3">صافي ربح البوليصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {singleCompanyStatement.scopedBills.map(b => (
                  <tr key={b.tx.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{b.tx.billNo}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{b.cust?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-amber-300">{b.emp?.name || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-white" dir="ltr">
                      {formatCurrency(b.fin.totalAmount, b.billCurr)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400" dir="ltr">
                      {formatCurrency(b.fin.totalCollected, b.billCurr)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-400" dir="ltr">
                      {b.fin.remainingAmount > 0 ? formatCurrency(b.fin.remainingAmount, b.billCurr) : '0 (خالص)'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-400" dir="ltr">
                      -{formatCurrency(b.totalBillCost, b.billCurr)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400" dir="ltr">
                      {b.netContractProfit >= 0 ? '+' : ''}
                      {formatCurrency(b.netContractProfit, b.billCurr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
