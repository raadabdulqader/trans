import React from 'react';
import { Customer } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { CustomerReportSummary } from '../../utils/reportCalculations';

interface CustomersLedgerReportProps {
  customerSummaries: CustomerReportSummary[];
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

export const CustomersLedgerReport: React.FC<CustomersLedgerReportProps> = ({
  customerSummaries,
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            كشف ذمم وحسابات الزبائن (الشركات التجارية والديون المستحقة)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            يبين لكل زبون عدد بوالصه، إجمالي قيمة العقود، إجمالي المسدد، والرصيد المتبقي بذمته
          </p>
        </div>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold min-w-[240px] focus:outline-none focus:border-emerald-500 no-print"
        >
          <option value="all">-- عرض جميع الزبائن والشركات ({customers.length}) --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                <th className="py-3.5 px-4">اسم الشركة / الزبون</th>
                <th className="py-3.5 px-4 text-center">عدد البوالص</th>
                <th className="py-3.5 px-4">إجمالي العقود</th>
                <th className="py-3.5 px-4">إجمالي المسدد</th>
                <th className="py-3.5 px-4">الدين المتبقي بذمته</th>
                <th className="py-3.5 px-4">صافي ربح المكتب من الزبون</th>
                <th className="py-3.5 px-4 text-center no-print">كشف تفصيلي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {customerSummaries.map(cs => (
                <tr key={cs.customer.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{cs.customer.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {cs.customer.phone || cs.customer.contact || '—'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-400">{cs.agg.count}</td>
                  <td className="py-3.5 px-4 font-mono text-white font-bold" dir="ltr">
                    {cs.agg.contractIQD > 0 && <div>{formatCurrency(cs.agg.contractIQD, 'IQD')}</div>}
                    {cs.agg.contractUSD > 0 && <div className="text-cyan-400">+{formatCurrency(cs.agg.contractUSD, 'USD')}</div>}
                    {cs.agg.contractIQD === 0 && cs.agg.contractUSD === 0 && '0'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold" dir="ltr">
                    {cs.agg.collectedIQD > 0 && <div>{formatCurrency(cs.agg.collectedIQD, 'IQD')}</div>}
                    {cs.agg.collectedUSD > 0 && <div className="text-cyan-400">+{formatCurrency(cs.agg.collectedUSD, 'USD')}</div>}
                    {cs.agg.collectedIQD === 0 && cs.agg.collectedUSD === 0 && '0'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-amber-400" dir="ltr">
                    {cs.agg.remainingIQD > 0 && <div>{formatCurrency(cs.agg.remainingIQD, 'IQD')}</div>}
                    {cs.agg.remainingUSD > 0 && <div>+{formatCurrency(cs.agg.remainingUSD, 'USD')}</div>}
                    {cs.agg.remainingIQD === 0 && cs.agg.remainingUSD === 0 && <span className="text-emerald-400">0 (خالص)</span>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-300 font-bold" dir="ltr">
                    ≈ {formatCurrency(cs.agg.netProfitEqIQD, 'IQD')}
                  </td>
                  <td className="py-3.5 px-4 text-center no-print">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerId(selectedCustomerId === cs.customer.id ? 'all' : cs.customer.id)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold"
                    >
                      {selectedCustomerId === cs.customer.id ? 'عرض الكل' : 'كشف البوالص'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* If a single customer is selected, show their detailed bills & receipts */}
      {selectedCustomerId !== 'all' && customerSummaries[0] && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h4 className="font-bold text-white text-sm">
            تفصيل بوالص وسندات الزبون: {customerSummaries[0].customer.name}
          </h4>
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">رقم البوليصة</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">نوع البضاعة</th>
                  <th className="py-2.5 px-3">مبلغ العقد</th>
                  <th className="py-2.5 px-3">المسدد</th>
                  <th className="py-2.5 px-3">المتبقي بذمته</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerSummaries[0].bills.map(b => (
                  <tr key={b.tx.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{b.tx.billNo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{b.tx.date}</td>
                    <td className="py-2.5 px-3 text-slate-200">{b.tx.goodsType || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-white" dir="ltr">
                      {formatCurrency(b.fin.totalAmount, b.billCurr)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400" dir="ltr">
                      {formatCurrency(b.fin.totalCollected, b.billCurr)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400" dir="ltr">
                      {formatCurrency(b.fin.remainingAmount, b.billCurr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
