import React from 'react';
import { Scale } from 'lucide-react';
import { formatCurrency } from '../../utils/storage';
import { CompanyFinancialStatement } from '../../utils/reportCalculations';

interface CombinedStatementReportProps {
  naqaaStatement: CompanyFinancialStatement;
  sawtStatement: CompanyFinancialStatement;
  sharedStatement: CompanyFinancialStatement;
  combinedStatement: CompanyFinancialStatement;
  treasurySummary: {
    currentBalanceIQD: number;
    currentBalanceUSD: number;
  };
}

export const CombinedStatementReport: React.FC<CombinedStatementReportProps> = ({
  naqaaStatement,
  sawtStatement,
  sharedStatement,
  combinedStatement,
  treasurySummary,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Unified Treasury Cash Pool & Group Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>الميزانية الموحدة وقائمة الدخل للشركتين (نقاء البصرة + صوت الجنوب)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تقرير شامل يجمع إيرادات ومصاريف وأرباح الشركتين مع مطابقة السيولة الفعلية في الصندوق المشترك
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 ml-1">رصيد صندوق الدينار الفعلي:</span>
              <strong className="text-emerald-400 font-mono text-sm" dir="ltr">
                {formatCurrency(treasurySummary.currentBalanceIQD, 'IQD')}
              </strong>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400 ml-1">رصيد صندوق الدولار الفعلي:</span>
              <strong className="text-cyan-400 font-mono text-sm" dir="ltr">
                {formatCurrency(treasurySummary.currentBalanceUSD, 'USD')}
              </strong>
            </div>
          </div>
        </div>

        {/* 4 Key Group Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">
              إجمالي عقود الشركتين ({combinedStatement.billsAgg.count} بوليصة):
            </span>
            <div className="text-base font-black text-white font-mono" dir="ltr">
              {formatCurrency(combinedStatement.billsAgg.contractIQD, 'IQD')}
            </div>
            {combinedStatement.billsAgg.contractUSD > 0 && (
              <div className="text-sm font-bold text-cyan-400 font-mono" dir="ltr">
                + {formatCurrency(combinedStatement.billsAgg.contractUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
              المعادل الكلي: {formatCurrency(combinedStatement.billsAgg.contractEqIQD, 'IQD')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">
              تكاليف البوالص المباشرة (سلف وعمولات):
            </span>
            <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
              -{formatCurrency(combinedStatement.billsAgg.totalCostIQD, 'IQD')}
            </div>
            {combinedStatement.billsAgg.totalCostUSD > 0 && (
              <div className="text-sm font-bold text-rose-300 font-mono" dir="ltr">
                - {formatCurrency(combinedStatement.billsAgg.totalCostUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-800 font-mono">
              مجمل ربح البوالص: {formatCurrency(combinedStatement.billsAgg.netProfitEqIQD, 'IQD')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">
              المصاريف الإدارية (رواتب/إيجار/نثرية):
            </span>
            <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
              -{formatCurrency(combinedStatement.totalAdminExpensesIQD, 'IQD')}
            </div>
            {combinedStatement.totalAdminExpensesUSD > 0 && (
              <div className="text-sm font-bold text-rose-300 font-mono" dir="ltr">
                - {formatCurrency(combinedStatement.totalAdminExpensesUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
              رواتب: {formatCurrency(combinedStatement.salariesIQD, 'IQD')} | إيجار ونثرية:{' '}
              {formatCurrency(combinedStatement.rentsIQD + combinedStatement.dailyExpensesIQD, 'IQD')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <span className="text-xs text-emerald-300 font-bold">
              صافي الربح النهائي للشركتين (بعد المصاريف):
            </span>
            <div
              className={`text-base font-black font-mono ${
                combinedStatement.finalNetProfitIQD >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
              dir="ltr"
            >
              {combinedStatement.finalNetProfitIQD >= 0 ? '+' : ''}
              {formatCurrency(combinedStatement.finalNetProfitIQD, 'IQD')}
            </div>
            {(combinedStatement.billsAgg.contractUSD > 0 || combinedStatement.grandTotalExpensesUSD > 0) && (
              <div
                className={`text-sm font-bold font-mono ${
                  combinedStatement.finalNetProfitUSD >= 0 ? 'text-cyan-400' : 'text-rose-300'
                }`}
                dir="ltr"
              >
                {combinedStatement.finalNetProfitUSD >= 0 ? '+ ' : ''}
                {formatCurrency(combinedStatement.finalNetProfitUSD, 'USD')}
              </div>
            )}
            <div className="text-[11px] text-emerald-300 pt-1 border-t border-emerald-500/20 font-mono">
              صافي الربح المعادل: {formatCurrency(combinedStatement.finalNetProfitEqIQD, 'IQD')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Accounting Statement Table (مقارنة وجمع الشركتين) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm sm:text-base">
            كشف قائمة الدخل والمقارنة التفصيلية بين (شركة نقاء البصرة) و (شركة صوت الجنوب)
          </h3>
          <span className="text-xs text-slate-400">مرتب حسب المعايير المحاسبية لمكاتب التخليص</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                <th className="py-3.5 px-4 w-[28%]">البيان المحاسبي</th>
                <th className="py-3.5 px-4 text-emerald-400 w-[20%]">شركة نقاء البصرة</th>
                <th className="py-3.5 px-4 text-cyan-400 w-[20%]">شركة صوت الجنوب</th>
                <th className="py-3.5 px-4 text-slate-400 w-[14%]">المكتب (مشترك)</th>
                <th className="py-3.5 px-4 text-amber-300 w-[18%]">المجموع الموحد للشركتين</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {/* Section Header 1 */}
              <tr className="bg-slate-950/50">
                <td colSpan={5} className="py-2 px-4 font-bold text-emerald-400 text-[11px]">
                  أولاً: النشاط التشغيلي وإيرادات عقود البوالص
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">عدد البوالص الكمركية والحاويات</td>
                <td className="py-3 px-4 font-mono text-slate-200">
                  {naqaaStatement.billsAgg.count} بوليصة ({naqaaStatement.billsAgg.containers} حاوية)
                </td>
                <td className="py-3 px-4 font-mono text-slate-200">
                  {sawtStatement.billsAgg.count} بوليصة ({sawtStatement.billsAgg.containers} حاوية)
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono font-bold text-white">
                  {combinedStatement.billsAgg.count} بوليصة ({combinedStatement.billsAgg.containers} حاوية)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">إجمالي عقود البوالص (الإيرادات الدفترية)</td>
                <td className="py-3 px-4 font-mono font-bold text-white" dir="ltr">
                  <div>{formatCurrency(naqaaStatement.billsAgg.contractIQD, 'IQD')}</div>
                  {naqaaStatement.billsAgg.contractUSD > 0 && (
                    <div className="text-cyan-400">+{formatCurrency(naqaaStatement.billsAgg.contractUSD, 'USD')}</div>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-white" dir="ltr">
                  <div>{formatCurrency(sawtStatement.billsAgg.contractIQD, 'IQD')}</div>
                  {sawtStatement.billsAgg.contractUSD > 0 && (
                    <div className="text-cyan-400">+{formatCurrency(sawtStatement.billsAgg.contractUSD, 'USD')}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono font-black text-white" dir="ltr">
                  <div>{formatCurrency(combinedStatement.billsAgg.contractIQD, 'IQD')}</div>
                  {combinedStatement.billsAgg.contractUSD > 0 && (
                    <div className="text-cyan-400">+{formatCurrency(combinedStatement.billsAgg.contractUSD, 'USD')}</div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">المقبوض النقدي الفعلي من الزبائن</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold" dir="ltr">
                  {formatCurrency(naqaaStatement.billsAgg.collectedEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold" dir="ltr">
                  {formatCurrency(sawtStatement.billsAgg.collectedEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-black" dir="ltr">
                  {formatCurrency(combinedStatement.billsAgg.collectedEqIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">الديون المتبقية بذمة الزبائن (الذمم المدينة)</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold" dir="ltr">
                  {formatCurrency(naqaaStatement.billsAgg.remainingEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold" dir="ltr">
                  {formatCurrency(sawtStatement.billsAgg.remainingEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-black" dir="ltr">
                  {formatCurrency(combinedStatement.billsAgg.remainingEqIQD, 'IQD')}
                </td>
              </tr>

              {/* Section Header 2 */}
              <tr className="bg-slate-950/50">
                <td colSpan={5} className="py-2 px-4 font-bold text-amber-400 text-[11px]">
                  ثانياً: تكاليف التخليص المباشرة وسلف المخلصين على البوالص
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">إجمالي السلف المصروفة للمخلصين</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.billsAgg.advancesEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.billsAgg.advancesEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.billsAgg.advancesEqIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-300 pr-7">↳ منها: مصفى فعلياً بالوصولات الكمركية</td>
                <td className="py-3 px-4 font-mono text-emerald-400/90" dir="ltr">
                  {formatCurrency(naqaaStatement.billsAgg.settledEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400/90" dir="ltr">
                  {formatCurrency(sawtStatement.billsAgg.settledEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-emerald-400" dir="ltr">
                  {formatCurrency(combinedStatement.billsAgg.settledEqIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-300 pr-7">↳ منها: سلف مفتوحة باقية بذمة المخلصين</td>
                <td className="py-3 px-4 font-mono text-amber-300" dir="ltr">
                  {formatCurrency(naqaaStatement.billsAgg.openAdvEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-amber-300" dir="ltr">
                  {formatCurrency(sawtStatement.billsAgg.openAdvEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold" dir="ltr">
                  {formatCurrency(combinedStatement.billsAgg.openAdvEqIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">عمولات التحويل ومصاريف البوالص المباشرة</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.billsAgg.commissionsEqIQD + naqaaStatement.billsAgg.directExpEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.billsAgg.commissionsEqIQD + sawtStatement.billsAgg.directExpEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.billsAgg.commissionsEqIQD + combinedStatement.billsAgg.directExpEqIQD, 'IQD')}
                </td>
              </tr>
              <tr className="bg-slate-950/80 font-bold">
                <td className="py-3 px-4 text-emerald-300">= مجمل ربح البوالص (قبل المصاريف الإدارية)</td>
                <td className="py-3 px-4 font-mono text-emerald-400" dir="ltr">
                  {formatCurrency(naqaaStatement.billsAgg.netProfitEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-cyan-400" dir="ltr">
                  {formatCurrency(sawtStatement.billsAgg.netProfitEqIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-emerald-400 text-sm" dir="ltr">
                  {formatCurrency(combinedStatement.billsAgg.netProfitEqIQD, 'IQD')}
                </td>
              </tr>

              {/* Section Header 3 */}
              <tr className="bg-slate-950/50">
                <td colSpan={5} className="py-2 px-4 font-bold text-rose-400 text-[11px]">
                  ثالثاً: المصاريف الإدارية والتشغيلية للمكتب (رواتب / إيجارات / مصاريف يومية)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">رواتب ومكافآت الموظفين</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.salariesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.salariesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sharedStatement.salariesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.salariesIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">بدلات الإيجار والمرافق</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.rentsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.rentsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sharedStatement.rentsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.rentsIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">المصاريف اليومية والنثرية والتشغيلية</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.dailyExpensesIQD + naqaaStatement.adminCommissionsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.dailyExpensesIQD + sawtStatement.adminCommissionsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sharedStatement.dailyExpensesIQD + sharedStatement.adminCommissionsIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.dailyExpensesIQD + combinedStatement.adminCommissionsIQD, 'IQD')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">أجور ومصاريف النواقل المسددة</td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(naqaaStatement.carriersExpensesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sawtStatement.carriersExpensesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-300" dir="ltr">
                  -{formatCurrency(sharedStatement.carriersExpensesIQD, 'IQD')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-400 font-bold" dir="ltr">
                  -{formatCurrency(combinedStatement.carriersExpensesIQD, 'IQD')}
                </td>
              </tr>

              {/* Final Net Profit Row */}
              <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/40 font-black text-sm">
                <td className="py-4 px-4 text-white">صافي الربح النهائي المعتمد (المعادل بالدينار)</td>
                <td className="py-4 px-4 font-mono text-emerald-400" dir="ltr">
                  {formatCurrency(naqaaStatement.finalNetProfitEqIQD, 'IQD')}
                </td>
                <td className="py-4 px-4 font-mono text-cyan-400" dir="ltr">
                  {formatCurrency(sawtStatement.finalNetProfitEqIQD, 'IQD')}
                </td>
                <td className="py-4 px-4 font-mono text-rose-400 text-xs" dir="ltr">
                  -{formatCurrency(sharedStatement.totalAdminExpensesEqIQD, 'IQD')}
                </td>
                <td className="py-4 px-4 font-mono text-amber-300 text-base" dir="ltr">
                  {formatCurrency(combinedStatement.finalNetProfitEqIQD, 'IQD')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
