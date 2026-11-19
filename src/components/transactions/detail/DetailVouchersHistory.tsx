import React from 'react';
import { Receipt as ReceiptIcon, CheckCheck, Trash2, Ban, Eye } from 'lucide-react';
import { Transaction, Receipt, TreasuryTransaction, Employee, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency, getReceiptBreakdownForBill } from '../../../utils/storage';

interface DetailVouchersHistoryProps {
  transaction: Transaction;
  billReceipts: Receipt[];
  carrierPaymentsOnBill: TreasuryTransaction[];
  directExpensesCount: number;
  openAdvances: number;
  employee?: Employee;
  exchangeRate: number;
  onOpenQuickSettlement: (empId: string) => void;
  onDeleteReceipt?: (receipt: Receipt) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
}

export const DetailVouchersHistory: React.FC<DetailVouchersHistoryProps> = ({
  transaction,
  billReceipts,
  carrierPaymentsOnBill,
  directExpensesCount,
  openAdvances,
  employee,
  exchangeRate,
  onOpenQuickSettlement,
  onDeleteReceipt,
  onViewArchive,
}) => {
  const totalCount = billReceipts.length + carrierPaymentsOnBill.length + directExpensesCount;

  return (
    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <span className="font-bold text-white text-xs flex items-center gap-1.5">
          <ReceiptIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>سجل الوصولات والدفعات ({totalCount}):</span>
        </span>

        {openAdvances > 0 && employee && (
          <button
            onClick={() => onOpenQuickSettlement(employee.id)}
            className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
          >
            <CheckCheck className="w-3 h-3" />
            <span>تصفية سلف المخلص</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
              <th className="py-1.5 px-2">رقم السند</th>
              <th className="py-1.5 px-2">النوع</th>
              <th className="py-1.5 px-2">المبلغ</th>
              <th className="py-1.5 px-2">الأثر</th>
              <th className="py-1.5 px-2">التاريخ</th>
              <th className="py-1.5 px-2 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {billReceipts.length === 0 && carrierPaymentsOnBill.length === 0 && directExpensesCount === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">
                  لا توجد وصولات أو دفعات مسجلة لهذه البوليصة بعد
                </td>
              </tr>
            ) : (
              <>
                {billReceipts.map(r => {
                  const isCancelled = r.status === 'cancelled';
                  const billCurr = transaction.currency === 'USD' ? 'USD' : 'IQD';
                  const rCurr = r.currency || billCurr;
                  const b = getReceiptBreakdownForBill(r, billCurr, exchangeRate || transaction.exchangeRate || 1500);
                  const isCustomerPayment = r.type === 'deposit' || r.type === 'payment';

                  return (
                    <tr key={r.id} className={`hover:bg-slate-900/30 ${isCancelled ? 'bg-rose-950/20 text-slate-400' : ''}`}>
                      <td className="py-1.5 px-2 font-mono font-bold text-[11px]">
                        <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>{r.receiptNo}</span>
                        {isCancelled && (
                          <span className="mr-1 text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                            ملغي
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          r.type === 'payment' || r.type === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : r.type === 'advance'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {r.type === 'deposit' ? 'دفعة أولى' : r.type === 'payment' ? 'دفعة زبون' : r.type === 'advance' ? 'سلفة مخلص' : 'تسوية سلفة'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-mono font-bold text-slate-100" dir="ltr">
                        {isCancelled ? (
                          <span className="line-through text-slate-500">{formatCurrency(r.amount, rCurr)}</span>
                        ) : (
                          <span className={rCurr === 'USD' ? 'text-cyan-400' : 'text-emerald-400'}>
                            {formatCurrency(r.amount, rCurr)}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-[10px]">
                        {isCancelled ? (
                          <span className="text-rose-400">محيد</span>
                        ) : isCustomerPayment ? (
                          <strong className="font-mono text-emerald-400" dir="ltr">
                            +{formatCurrency(b.netCreditInBillCurrency, billCurr)}
                          </strong>
                        ) : (
                          <span className="text-amber-300 font-mono" dir="ltr">
                            {r.type === 'advance' ? `-${formatCurrency(r.amount, rCurr)}` : `تسوية`}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-slate-400 font-mono text-[10px]">
                        {r.date}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {onDeleteReceipt && (
                          <button
                            onClick={() => onDeleteReceipt(r)}
                            title={isCancelled ? "حذف السند نهائياً" : "إلغاء السند دفترياً"}
                            className={`p-1 rounded transition ${
                              isCancelled
                                ? 'bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200'
                                : 'bg-slate-900 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                            }`}
                          >
                            {isCancelled ? <Trash2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Carrier Payments */}
                {carrierPaymentsOnBill.map(t => {
                  const tCurr = t.currency || 'IQD';
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/30 bg-amber-950/10">
                      <td className="py-1.5 px-2 font-mono font-bold text-cyan-300 text-[11px]">
                        {t.voucherNo}
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          🚛 دفعة ناقل
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-mono font-bold text-rose-400" dir="ltr">
                        - {formatCurrency(t.amount, tCurr)}
                      </td>
                      <td className="py-1.5 px-2 text-[10px] text-slate-300">
                        {t.partyName || 'شركة النقل'}
                      </td>
                      <td className="py-1.5 px-2 text-slate-400 font-mono text-[10px]">
                        {t.date}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {t.attachment && onViewArchive ? (
                          <button
                            type="button"
                            onClick={() => onViewArchive(t.attachment!, `وصل دفعة الناقل ${t.voucherNo}`)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>عرض</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
