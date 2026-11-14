import React from 'react';
import { 
  FileText, 
  Calendar, 
  Printer, 
  Edit2, 
  Trash2, 
  Ban, 
  Info, 
  Eye 
} from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment, AppUser, COMPANIES } from '../../types/customs';
import { SubAccountType } from '../modals/AccountExpenseModal';
import { formatCurrency } from '../../utils/storage';

export interface AccountsLedgerTableProps {
  filteredExpenses: TreasuryTransaction[];
  activeSubTab: 'all' | 'salaries' | 'daily' | 'rents' | 'carriers';
  totalFilteredIQD: number;
  totalFilteredUSD: number;
  currentUser: AppUser;
  onOpenAddExpense: (subAccount: SubAccountType) => void;
  onPrintVoucher: (tx: TreasuryTransaction) => void;
  onEditExpense: (tx: TreasuryTransaction) => void;
  onDeleteExpense: (tx: TreasuryTransaction) => void;
  onViewArchive: (attachment: TreasuryAttachment, title?: string) => void;
  getSubAccountType: (tx: TreasuryTransaction) => SubAccountType | 'other' | 'carriers';
  getSubAccountBadge: (type: SubAccountType | 'other' | 'carriers') => React.ReactNode;
}

export const AccountsLedgerTable: React.FC<AccountsLedgerTableProps> = ({
  filteredExpenses,
  activeSubTab,
  totalFilteredIQD,
  totalFilteredUSD,
  currentUser,
  onOpenAddExpense,
  onPrintVoucher,
  onEditExpense,
  onDeleteExpense,
  onViewArchive,
  getSubAccountType,
  getSubAccountBadge,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden" id="printableArea">
      
      {/* Printable Formal Header */}
      <div className="hidden print:block p-6 border-b border-slate-300 text-right bg-white text-slate-950">
        <h2 className="text-xl font-bold">مكتب النجم للتخليص الكمركي والنقل العام</h2>
        <h3 className="text-base font-bold text-slate-700 mt-1">
          {activeSubTab === 'salaries'
            ? 'كشف حساب الرواتب والأجور المعتمد'
            : activeSubTab === 'daily'
            ? 'كشف المصاريف اليومية والتشغيلية المعتمد'
            : activeSubTab === 'rents'
            ? 'كشف الإيجارات والمرافق المعتمد'
            : 'كشف الحسابات العامة والمصاريف (سجل الصرف من الخزينة)'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          تاريخ الطباعة: {new Date().toLocaleDateString('ar-IQ')} • إجمالي المبلغ: {formatCurrency(totalFilteredIQD, 'IQD')}{totalFilteredUSD > 0 ? ` + ${formatCurrency(totalFilteredUSD, 'USD')}` : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 font-bold whitespace-nowrap">
              <th className="py-3.5 px-4">رقم السند والشركة</th>
              <th className="py-3.5 px-4">التاريخ</th>
              <th className="py-3.5 px-4">الحساب الفرعي والتصنيف</th>
              <th className="py-3.5 px-4">الجهة / المستفيد</th>
              <th className="py-3.5 px-4">المبلغ (خصم من الصندوق)</th>
              <th className="py-3.5 px-4 text-center no-print">إجراءات السند</th>
            </tr>
            <tr className="bg-slate-950/50 text-slate-500 border-b-2 border-slate-800 text-[11px] font-medium whitespace-nowrap">
              <th colSpan={6} className="py-2 px-4">
                الصف الثاني لكل مستند: البيان والتفاصيل الكاملة • الشهر / الفترة • الموظف المسجل • أرشفة الوصل المرفق
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-2xl mx-auto">
                      📂
                    </div>
                    <div className="text-slate-300 font-bold">لا توجد قيود مسجلة في هذا التبويب حالياً</div>
                    <p className="text-[11px] text-slate-500">
                      يمكنك إضافة صرف رواتب، مصاريف يومية، أو إيجارات لتوثيقها وخصمها فوراً من صندوق الشركة
                    </p>
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => onOpenAddExpense(activeSubTab === 'all' || activeSubTab === 'carriers' ? 'salaries' : activeSubTab)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
                      >
                        + إضافة قيد جديد الآن
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((tx) => {
                const subType = getSubAccountType(tx);
                const isCancelled = tx.status === 'cancelled';
                const cleanCategory = tx.category.replace(/^(رواتب:\s*|مصاريف يومية:\s*|إيجارات:\s*|أجور نقل بري:\s*)/, '');

                return (
                  <React.Fragment key={tx.id}>
                    {/* الصف الأول للمستند: البيانات الأساسية والمالية */}
                    <tr
                      className={`transition whitespace-nowrap ${
                        isCancelled
                          ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-l-rose-500 text-slate-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* 1. Voucher No & Company */}
                      <td className="pt-3.5 pb-2 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold flex items-center gap-2 whitespace-nowrap">
                          {(() => {
                            const itemComp = tx.companyId && tx.companyId !== 'shared' ? COMPANIES[tx.companyId] : null;
                            if (itemComp) {
                              return (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold border shrink-0 ${itemComp.badgeColor}`}>
                                  {itemComp.shortName}
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] px-2 py-0.5 rounded font-sans font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                عام
                              </span>
                            );
                          })()}
                          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className={isCancelled ? 'line-through text-slate-500' : 'text-white text-sm'}>{tx.voucherNo}</span>
                          {isCancelled && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                              ملغي دفترياً
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Date */}
                      <td className="pt-3.5 pb-2 px-4 font-mono text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{tx.date}</span>
                        </div>
                      </td>

                      {/* 3. Sub-account Badge & Category inline */}
                      <td className="pt-3.5 pb-2 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {getSubAccountBadge(subType)}
                          <span className="text-xs text-slate-200 font-semibold">{cleanCategory}</span>
                        </div>
                      </td>

                      {/* 4. Beneficiary / Party */}
                      <td className="pt-3.5 pb-2 px-4 font-bold text-white whitespace-nowrap text-xs">
                        {tx.partyName || '—'}
                      </td>

                      {/* 5. Amount */}
                      <td className="pt-3.5 pb-2 px-4 font-mono font-bold whitespace-nowrap" dir="ltr">
                        {isCancelled ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="line-through text-slate-500">- {formatCurrency(tx.amount, tx.currency || 'IQD')}</span>
                            <span className="text-[10px] text-rose-400 font-normal">(محيد من المصروفات)</span>
                          </div>
                        ) : (
                          <span className={`text-sm ${tx.currency === 'USD' ? 'text-amber-400 font-black' : 'text-rose-400 font-black'}`}>
                            - {formatCurrency(tx.amount, tx.currency || 'IQD')}
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="pt-3.5 pb-2 px-4 text-center no-print whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
                            <button
                              onClick={() => onPrintVoucher(tx)}
                              title={isCancelled ? "طباعة السند مع ختم الإلغاء" : "طباعة سند صرف معتمد"}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditExpense(tx)}
                            title="تعديل القيد"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteExpense(tx)}
                            title={isCancelled ? "حذف القيد نهائياً من الأرشيف" : "إلغاء قيد الصرف دفترياً واسترجاع المبلغ للصندوق"}
                            className={`p-1.5 rounded-lg transition ${
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

                    {/* الصف الثاني للمستند: البيان، الشهر/الفترة، المسجل، وأرشفة الوصل */}
                    <tr
                      className={`border-b-2 border-slate-800/90 transition whitespace-nowrap ${
                        isCancelled
                          ? 'bg-rose-950/15 border-l-2 border-l-rose-500 text-slate-400'
                          : 'bg-slate-950/40 hover:bg-slate-800/30'
                      }`}
                    >
                      <td colSpan={6} className="pt-1.5 pb-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-6 text-[11px] whitespace-nowrap">
                          {/* Right side: Full Description, Period, Cancel Reason */}
                          <div className="flex items-center gap-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
                              <span className="text-slate-500 font-semibold">البيان والتفاصيل:</span>
                              <span className="text-slate-200 font-medium">{tx.description || tx.category}</span>
                            </div>

                            <span className="text-slate-700">•</span>

                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-slate-500">الشهر / الفترة:</span>
                              <span className="px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800 text-slate-300 font-mono">
                                {tx.period || '—'}
                              </span>
                            </div>

                            {isCancelled && (
                              <>
                                <span className="text-slate-700">•</span>
                                <div className="text-rose-300 font-medium inline-flex items-center gap-1 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40 whitespace-nowrap">
                                  <Info className="w-3 h-3 text-rose-400 shrink-0" />
                                  <span>سبب الإلغاء: {tx.cancelReason || 'إلغاء دفتري'}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Left side: Recorded By & Attachment Archive */}
                          <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
                            <span className="text-slate-500 font-mono whitespace-nowrap">
                              بواسطة: <strong className="text-slate-300 font-sans">{tx.recordedBy}</strong>
                            </span>

                            <span className="text-slate-700">|</span>

                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-slate-500">أرشفة الوصل:</span>
                              {tx.attachment ? (
                                <button
                                  onClick={() => onViewArchive(tx.attachment!, `وصل صرف: ${tx.voucherNo} - ${tx.partyName}`)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition text-[11px] font-bold whitespace-nowrap"
                                  title="معاينة الوصل المؤرشف مباشرة"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>مؤرشف 👁️</span>
                                </button>
                              ) : (
                                <span className="text-slate-500">بدون مرفق</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Formal Signatures */}
      <div className="hidden print:grid grid-cols-3 gap-6 p-8 border-t border-slate-300 text-center text-xs text-slate-900 bg-white">
        <div>
          <p className="font-bold mb-10">المحاسب المسؤول</p>
          <p className="text-slate-400">....................................</p>
        </div>
        <div>
          <p className="font-bold mb-10">تدقيق الحسابات</p>
          <p className="text-slate-400">....................................</p>
        </div>
        <div>
          <p className="font-bold mb-10">اعتماد الإدارة العامة</p>
          <p className="text-slate-400">....................................</p>
        </div>
      </div>
    </div>
  );
};
