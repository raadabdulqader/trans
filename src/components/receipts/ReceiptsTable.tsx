import React from 'react';
import { Ban, CheckCircle2, Info, Printer, Trash2 } from 'lucide-react';
import { Receipt, Transaction, Customer, Employee, AppUser, Currency, COMPANIES } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

interface ReceiptsTableProps {
  filteredReceipts: Receipt[];
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  currentUser: AppUser;
  exchangeRate?: number;
  onDeleteReceipt: (rcpt: Receipt) => void;
  onPrintVoucher: (rcpt: Receipt) => void;
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({
  filteredReceipts,
  transactions,
  customers,
  employees,
  currentUser,
  exchangeRate = 1500,
  onDeleteReceipt,
  onPrintVoucher,
}) => {
  const getTypeLabel = (type: Receipt['type']) => {
    switch (type) {
      case 'deposit':
        return { text: 'دفعة أولى (مقدم)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'payment':
        return { text: 'دفعة من الزبون', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'advance':
        return { text: 'سلفة للمخلص', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'settlement':
        return { text: 'تسوية حساب سلفة', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
              <th className="py-3.5 px-4">رقم الوصل</th>
              <th className="py-3.5 px-4">نوع السند</th>
              <th className="py-3.5 px-4">رقم البوليصة</th>
              <th className="py-3.5 px-4">الطرف (الزبون / المخلص)</th>
              <th className="py-3.5 px-4">المبلغ والعملة</th>
              <th className="py-3.5 px-4">الحالة الدفترية</th>
              <th className="py-3.5 px-4">التاريخ</th>
              <th className="py-3.5 px-4">ملاحظات وسبب الإلغاء</th>
              <th className="py-3.5 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  لا توجد وصولات مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredReceipts.map((rcpt) => {
                const tx = transactions.find((t) => t.id === rcpt.billId);
                const cust = rcpt.customerId ? customers.find((c) => c.id === rcpt.customerId) : null;
                const emp = rcpt.employeeId ? employees.find((e) => e.id === rcpt.employeeId) : null;
                const badge = getTypeLabel(rcpt.type);
                const isCancelled = rcpt.status === 'cancelled';
                const receiptCompany = rcpt.companyId || (tx ? tx.companyId : null) || 'naqaa_basra';
                const comp = COMPANIES[receiptCompany] || COMPANIES.naqaa_basra;
                const receiptCurrency: Currency = rcpt.currency || (tx ? tx.currency : undefined) || 'IQD';

                return (
                  <tr 
                    key={rcpt.id} 
                    className={`transition ${
                      isCancelled 
                        ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-l-rose-500 text-slate-400' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border shrink-0 ${comp.badgeColor}`}>
                          {comp.shortName}
                        </span>
                        <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>
                          {rcpt.receiptNo}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {tx?.billNo || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {cust ? cust.name : emp ? `المخلص: ${emp.name}` : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm" dir="ltr">
                      {isCancelled ? (
                        <div className="flex flex-col">
                          <span className="line-through text-slate-500">{formatCurrency(rcpt.amount, receiptCurrency)}</span>
                          <span className="text-[10px] text-rose-400 font-normal font-sans">تم تحييد الأثر المالي</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={receiptCurrency === 'USD' ? 'text-cyan-400 font-extrabold text-sm' : 'text-emerald-400 text-sm'}>
                              {formatCurrency(rcpt.amount, receiptCurrency)}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold border shrink-0 ${
                              receiptCurrency === 'USD' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {receiptCurrency === 'USD' ? '$ دولار' : 'د.ع'}
                            </span>
                          </div>
                          {receiptCurrency === 'USD' && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(rcpt.amount * (exchangeRate || rcpt.exchangeRate || 1500)))} د.ع
                            </span>
                          )}
                          {rcpt.hasCommission && (rcpt.commissionAmount || 0) > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                              <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded font-sans font-bold">
                                عمولة: {formatCurrency(rcpt.commissionAmount || 0, rcpt.commissionCurrency || receiptCurrency)}
                              </span>
                              <span className="text-[9px] text-slate-400 font-sans">
                                ({rcpt.commissionBearer === 'company' ? 'المكتب' : 'الطرف'})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <Ban className="w-3 h-3 text-rose-400" />
                          <span>ملغي دفترياً</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>قيد ساري</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {rcpt.date}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-[220px]">
                      {isCancelled ? (
                        <div className="space-y-0.5">
                          <div className="text-rose-300 font-semibold text-[11px] flex items-center gap-1">
                            <Info className="w-3 h-3 shrink-0" />
                            <span className="truncate">السبب: {rcpt.cancelReason || 'إلغاء دفتري'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            بواسطة: {rcpt.cancelledBy || 'المسؤول'} • {rcpt.cancelledAt?.split('T')[0] || ''}
                          </div>
                        </div>
                      ) : (
                        <span className="truncate block">{rcpt.notes || '—'}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
                          <button
                            onClick={() => onPrintVoucher(rcpt)}
                            title={isCancelled ? "طباعة السند مع ختم الإلغاء" : "طباعة سند القبض / الصرف"}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteReceipt(rcpt)}
                          title={isCancelled ? "إجراءات السند الملغي / حذف نهائي" : "إلغاء السند دفترياً"}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isCancelled
                              ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200'
                              : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                          }`}
                        >
                          {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
