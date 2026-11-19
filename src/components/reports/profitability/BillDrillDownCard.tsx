import React from 'react';
import { FileText, FileCheck2 } from 'lucide-react';
import { TreasuryAttachment } from '../../../types/customs';
import { formatCurrency, getReceiptBreakdownForBill } from '../../../utils/storage';
import { AnalyzedBill } from '../../../utils/reportCalculations';

interface BillDrillDownCardProps {
  b: AnalyzedBill;
  activeRate: number;
  onViewArchive?: (attachment: TreasuryAttachment, title: string) => void;
}

export const BillDrillDownCard: React.FC<BillDrillDownCardProps> = ({
  b,
  activeRate,
  onViewArchive,
}) => {
  return (
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
  );
};
