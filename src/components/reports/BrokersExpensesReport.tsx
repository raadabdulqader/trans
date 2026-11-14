import React from 'react';
import { TreasuryTransaction } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { BrokerReportSummary } from '../../utils/reportCalculations';

interface BrokersExpensesReportProps {
  brokerSummaries: BrokerReportSummary[];
  adminWithdrawals: TreasuryTransaction[];
  expenseSubTab: 'brokers' | 'admin_expenses';
  setExpenseSubTab: (tab: 'brokers' | 'admin_expenses') => void;
  expenseCategoryFilter: string;
  setExpenseCategoryFilter: (cat: string) => void;
  uniqueExpenseCategories: (string | undefined)[];
}

export const BrokersExpensesReport: React.FC<BrokersExpensesReportProps> = ({
  brokerSummaries,
  adminWithdrawals,
  expenseSubTab,
  setExpenseSubTab,
  expenseCategoryFilter,
  setExpenseCategoryFilter,
  uniqueExpenseCategories,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpenseSubTab('brokers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              expenseSubTab === 'brokers'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            أولاً: كشف سلف وعهد المخلصين الكمركيين
          </button>
          <button
            type="button"
            onClick={() => setExpenseSubTab('admin_expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              expenseSubTab === 'admin_expenses'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ثانياً: كشف المصاريف الإدارية والرواتب والإيجارات ({adminWithdrawals.length})
          </button>
        </div>
      </div>

      {expenseSubTab === 'brokers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-white text-sm">
              خلاصة ذمم وعهد المخلصين الكمركيين (السلف المصروفة مقابل المسدد بالوصولات)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                  <th className="py-3.5 px-4">اسم المخلص الكمركي</th>
                  <th className="py-3.5 px-4 text-center">البوالص المستلمة</th>
                  <th className="py-3.5 px-4">إجمالي السلف المصروفة له</th>
                  <th className="py-3.5 px-4">المسدد الفعلي بالوصولات</th>
                  <th className="py-3.5 px-4">السلف المفتوحة المتبقية بذمته</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {brokerSummaries.map(bs => (
                  <tr key={bs.employee.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{bs.employee.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{bs.employee.phone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-400">{bs.billsCount}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold" dir="ltr">
                      <div>{formatCurrency(bs.adv.advancesIQD, 'IQD')}</div>
                      {bs.adv.advancesUSD > 0 && <div className="text-cyan-400">+{formatCurrency(bs.adv.advancesUSD, 'USD')}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold" dir="ltr">
                      <div>{formatCurrency(bs.adv.settledIQD, 'IQD')}</div>
                      {bs.adv.settledUSD > 0 && <div className="text-cyan-400">+{formatCurrency(bs.adv.settledUSD, 'USD')}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-rose-400" dir="ltr">
                      {bs.adv.openIQD > 0 || bs.adv.openUSD > 0 ? (
                        <>
                          {bs.adv.openIQD > 0 && <div>{formatCurrency(bs.adv.openIQD, 'IQD')}</div>}
                          {bs.adv.openUSD > 0 && <div>+{formatCurrency(bs.adv.openUSD, 'USD')}</div>}
                        </>
                      ) : (
                        <span className="text-emerald-400">0 (مصفاة بالكامل)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-white text-sm">
              سجل المصاريف الإدارية والتشغيلية والرواتب والإيجارات ({adminWithdrawals.length} قيد صرف)
            </h3>
            <select
              value={expenseCategoryFilter}
              onChange={(e) => setExpenseCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white no-print"
            >
              <option value="all">جميع بنود المصاريف</option>
              {uniqueExpenseCategories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                  <th className="py-3.5 px-4">رقم السند</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4">الشركة</th>
                  <th className="py-3.5 px-4">بند المصروف</th>
                  <th className="py-3.5 px-4">المستفيد</th>
                  <th className="py-3.5 px-4">المبلغ</th>
                  <th className="py-3.5 px-4">البيان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {adminWithdrawals.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">{t.voucherNo}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.date}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.companyId === 'naqaa_basra' ? 'نقاء البصرة' : t.companyId === 'sawt_aljanoub' ? 'صوت الجنوب' : 'مشترك للمكتب'}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-300">{t.category}</td>
                    <td className="py-3 px-4 font-semibold text-white">{t.partyName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-400" dir="ltr">
                      -{formatCurrency(t.amount, t.currency || 'IQD')}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{t.description || '—'}</td>
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
