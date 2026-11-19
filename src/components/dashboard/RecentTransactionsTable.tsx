import React from 'react';
import { Transaction, Customer, Receipt, COMPANIES } from '../../types/customs';
import { formatCurrency, getBillFinancials } from '../../utils/storage';

interface RecentTransactionsTableProps {
  recentTransactions: Transaction[];
  customers: Customer[];
  receipts: Receipt[];
  activeRate: number;
  onViewAllTransactions: () => void;
  onOpenTransactionDetail: (tx: Transaction) => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  recentTransactions,
  customers,
  receipts,
  activeRate,
  onViewAllTransactions,
  onOpenTransactionDetail,
}) => {
  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>📋</span> آخر المعاملات والبوالص
        </h3>
        <button
          onClick={onViewAllTransactions}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition cursor-pointer"
        >
          عرض الكل
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-semibold">
              <th className="py-2.5 px-3">رقم البوليصة</th>
              <th className="py-2.5 px-3">الزبون</th>
              <th className="py-2.5 px-3">المبلغ الكلي</th>
              <th className="py-2.5 px-3">المسدد</th>
              <th className="py-2.5 px-3">المتبقي</th>
              <th className="py-2.5 px-3">الحالة</th>
              <th className="py-2.5 px-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentTransactions.map((tx) => {
              const cust = customers.find((c) => c.id === tx.customerId);
              const fin = getBillFinancials(tx, receipts, activeRate);
              const comp = COMPANIES[tx.companyId || 'naqaa_basra'];
              const isCancelled = tx.status === 'cancelled';

              return (
                <tr key={tx.id} className={`hover:bg-slate-800/40 transition ${isCancelled ? 'opacity-60 bg-rose-950/10' : ''}`}>
                  <td className="py-3 px-3 font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold border shrink-0 ${comp.badgeColor}`}>
                        {comp.shortName}
                      </span>
                      <span className={isCancelled ? 'line-through text-slate-400' : 'text-emerald-400'}>{tx.billNo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    {cust?.name || 'غير محدد'}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200" dir="ltr">
                    <div>{formatCurrency(fin.totalAmount, fin.currency)}</div>
                    {fin.currency === 'USD' && fin.totalAmount > 0 && (
                      <div className="text-[10px] text-slate-500 font-normal">
                        ≈ {formatCurrency(Math.round(fin.totalAmount * activeRate), 'IQD')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400" dir="ltr">
                    {formatCurrency(fin.totalCollected, fin.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-400" dir="ltr">
                    <div>{formatCurrency(fin.remainingAmount, fin.currency)}</div>
                    {fin.currency === 'USD' && fin.remainingAmount > 0 && (
                      <div className="text-[10px] text-amber-300/70 font-normal">
                        ≈ {formatCurrency(Math.round(fin.remainingAmount * activeRate), 'IQD')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {tx.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        ✅ منجزة
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                        ⏳ قيد التنفيذ
                      </span>
                    )}
                    {tx.status === 'issue' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                        ⚠️ معلقة
                      </span>
                    )}
                    {tx.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        ⛔ ملغاة دفترياً
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onOpenTransactionDetail(tx)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      تفاصيل
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
