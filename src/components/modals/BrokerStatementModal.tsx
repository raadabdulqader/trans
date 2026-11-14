import React, { useRef } from 'react';
import { 
  X, 
  Coins, 
  CheckCheck, 
  Eye, 
  Printer, 
  Trash2, 
  FileText,
  Ban
} from 'lucide-react';
import { Employee, Transaction, Receipt, TreasuryAttachment } from '../../types/customs';
import { formatCurrency, getEmployeeAdvances } from '../../utils/storage';

export interface BrokerStatementModalProps {
  isOpen: boolean;
  employee: Employee | null;
  transactions: Transaction[];
  receipts: Receipt[];
  onClose: () => void;
  onOpenAdvance: (emp: Employee) => void;
  onOpenSettlement: (emp: Employee) => void;
  onViewArchive: (attachment: TreasuryAttachment, title: string) => void;
  onAttachFile: (rcpt: Receipt, file: File) => void;
  onPrintStatement: () => void;
  onDeleteReceipt?: (receipt: Receipt) => void;
}

export const BrokerStatementModal: React.FC<BrokerStatementModalProps> = ({
  isOpen,
  employee,
  transactions,
  receipts,
  onClose,
  onOpenAdvance,
  onOpenSettlement,
  onViewArchive,
  onAttachFile,
  onPrintStatement,
  onDeleteReceipt,
}) => {
  const fileInputMap = useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (!isOpen || !employee) return null;

  const empReceipts = receipts.filter(r => r.employeeId === employee.id);
  const adv = getEmployeeAdvances(employee.id, receipts);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl">
              👷
            </div>
            <div>
              <h2 className="text-base font-bold text-white">كشف حساب وسلف المخلص: {employee.name}</h2>
              <p className="text-xs text-slate-400">الهاتف: {employee.phone || '—'} • الهوية: {employee.idNo || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrintStatement}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">إجمالي السلف المصروفة:</span>
              <strong className="text-lg font-bold text-white font-mono block" dir="ltr">
                {formatCurrency(adv.advancesIQD, 'IQD')}
              </strong>
              {adv.advancesUSD > 0 && (
                <strong className="text-xs font-bold text-cyan-400 font-mono block mt-0.5" dir="ltr">
                  + {formatCurrency(adv.advancesUSD, 'USD')}
                </strong>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">المسدد بالوصولات الكمركية:</span>
              <strong className="text-lg font-bold text-emerald-400 font-mono block" dir="ltr">
                {formatCurrency(adv.settledIQD, 'IQD')}
              </strong>
              {adv.settledUSD > 0 && (
                <strong className="text-xs font-bold text-cyan-400 font-mono block mt-0.5" dir="ltr">
                  + {formatCurrency(adv.settledUSD, 'USD')}
                </strong>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-300 block mb-1 font-bold">الرصيد المفتوح حالياً بذمته:</span>
              <strong className="text-lg font-bold text-rose-400 font-mono block" dir="ltr">
                {formatCurrency(adv.openIQD, 'IQD')}
              </strong>
              {adv.openUSD > 0 && (
                <strong className="text-xs font-bold text-rose-300 font-mono block mt-0.5" dir="ltr">
                  + {formatCurrency(adv.openUSD, 'USD')}
                </strong>
              )}
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <button
              onClick={() => onOpenAdvance(employee)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <Coins className="w-4 h-4" />
              <span>+ صرف سلفة جديدة للمخلص</span>
            </button>

            <button
              onClick={() => onOpenSettlement(employee)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span>✅ تسجيل تسوية (المسدد بالوصولات مع الأرشفة)</span>
            </button>
          </div>

          {/* Advances & Settlements Ledger Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>حركة السلف والتسويات ({empReceipts.length} حركة):</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-4">رقم الوصل</th>
                    <th className="py-3 px-4">النوع</th>
                    <th className="py-3 px-4">البوليصة</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4 text-center">أرشفة الوصل المسدد</th>
                    <th className="py-3 px-4">البيان والملاحظات</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {empReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        لا توجد سلف أو تسويات مسجلة لهذا المخلص بعد
                      </td>
                    </tr>
                  ) : (
                    empReceipts.map(r => {
                      const bill = transactions.find(t => t.id === r.billId);
                      const isAdvance = r.type === 'advance';
                      const isCancelled = r.status === 'cancelled';

                      return (
                        <tr key={r.id} className={`hover:bg-slate-900/40 ${isCancelled ? 'bg-rose-950/20 text-slate-400' : ''}`}>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>{r.receiptNo}</span>
                            {isCancelled && (
                              <span className="mr-1.5 text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                                ملغي دفترياً
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              isAdvance
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>
                              {isAdvance ? 'سلفة منصرفة' : 'تسوية (مسدد)'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-cyan-400">{bill?.billNo || 'سلفة عامة'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-sm" dir="ltr">
                            {isCancelled ? (
                              <span className="line-through text-slate-500">{formatCurrency(r.amount, r.currency || bill?.currency || 'IQD')}</span>
                            ) : (
                              <span className={isAdvance ? 'text-amber-400' : 'text-emerald-400'}>
                                {formatCurrency(r.amount, r.currency || bill?.currency || 'IQD')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{r.date}</td>
                          <td className="py-3 px-4 text-center">
                            {r.attachment ? (
                              <button
                                onClick={() => onViewArchive(r.attachment!, `وصل التسوية ${r.receiptNo}`)}
                                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded-lg text-xs flex items-center gap-1 mx-auto transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة الوصل 👁️</span>
                              </button>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  ref={(el) => { fileInputMap.current[r.id] = el; }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onAttachFile(r, file);
                                  }}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => fileInputMap.current[r.id]?.click()}
                                  className="text-[10px] text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                                >
                                  + أرشفة الوصل
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                            {isCancelled ? `[ملغي: ${r.cancelReason || 'إلغاء دفتري'}]` : (r.notes || '—')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {onDeleteReceipt && (
                              <button
                                onClick={() => onDeleteReceipt(r)}
                                title={isCancelled ? "حذف السند نهائياً" : "إلغاء السند دفترياً"}
                                className={`p-1.5 rounded-lg transition ${
                                  isCancelled
                                    ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200'
                                    : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                                }`}
                              >
                                {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
