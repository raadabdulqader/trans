'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { TreasuryTransaction, COMPANIES } from '../../types/customs';
import { formatCurrency, TreasuryFinancialSummary } from '../../utils/storage';

interface PrintTreasuryModalProps {
  isOpen: boolean;
  mode: 'voucher' | 'statement';
  transaction?: TreasuryTransaction | null;
  transactions?: TreasuryTransaction[];
  summary?: TreasuryFinancialSummary;
  onClose: () => void;
}

export const PrintTreasuryModal: React.FC<PrintTreasuryModalProps> = ({
  isOpen,
  mode,
  transaction,
  transactions = [],
  summary,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const comp = (transaction?.companyId && transaction.companyId !== 'shared')
    ? COMPANIES[transaction.companyId]
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Controls Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'voucher' ? 'معاينة سند الصندوق الرسمي للطباعة' : 'معاينة كشف حركة صندوق الشركة للطباعة'}
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {comp ? comp.name : 'رأس المال وصندوق الشركة المشترك (نقاء البصرة & صوت الجنوب)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[75vh] overflow-y-auto" id="printableArea" dir="rtl">
          
          {/* Company Formal Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
            <div className="text-right space-y-1">
              {comp ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    <h1 className="text-2xl font-black text-slate-900">{comp.fullName}</h1>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">{comp.slogan}</p>
                  <p className="text-[11px] text-slate-500">{comp.address} • هاتف: {comp.phone}</p>
                  <p className="text-[10px] text-emerald-800 font-bold font-mono">
                    حساب صندوق الشركة المشترك • رأس مال موحد مع شركة صوت الجنوب
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <h1 className="text-xl font-black text-slate-900">
                      الإدارة المالية المشتركة • حساب صندوق الشركة الرئيسي
                    </h1>
                  </div>
                  <p className="text-xs text-slate-700 font-bold">
                    شركة نقاء البصرة للتخليص الكمركي & شركة صوت الجنوب للخدمات اللوجستية
                  </p>
                  <p className="text-[11px] text-slate-500">
                    رأس مال موحد وصندوق مالي مشترك • البصرة - ميناء أم قصر - المنافذ الحدودية
                  </p>
                </>
              )}
            </div>
            <div className="text-left font-mono text-xs text-slate-600 space-y-1" dir="ltr">
              <div className="font-bold text-slate-900 text-sm">{comp ? comp.shortName : 'JOINT TREASURY'}</div>
              <div>Date: {todayStr}</div>
              <div>Doc Ref: {mode === 'voucher' ? transaction?.voucherNo : 'TREASURY-REPORT'}</div>
            </div>
          </div>

          {/* MODE 1: SINGLE VOUCHER (سند قبض / سند صرف نقدي) */}
          {mode === 'voucher' && transaction && (
            <div className="space-y-6">
              {transaction.status === 'cancelled' && (
                <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
                  <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
                    <span>⛔ قيد وسند ملغي دفترياً ومحاسبياً (VOID VOUCHER)</span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold">
                    تم تحييد هذا القيد واستبعاد مبلغه بالكامل من رصيد صندوق الشركة وحسابات الوارد والمصروف.
                  </p>
                  <div className="text-[11px] text-rose-800 font-medium mt-1">
                    سبب الإلغاء: {transaction.cancelReason || 'إلغاء دفتري'} • تم بواسطة: {transaction.cancelledBy || 'المسؤول'} {transaction.cancelledAt ? `(${transaction.cancelledAt.split('T')[0]})` : ''}
                  </div>
                </div>
              )}

              <div className={`text-center py-2.5 rounded-lg border ${
                transaction.type === 'deposit'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <h2 className="text-2xl font-black">
                  {transaction.type === 'deposit' ? 'سند قبض نقدي (إيداع بصندوق الشركة)' : 'سند صرف نقدي (سحب من صندوق الشركة)'}
                </h2>
                <span className="text-xs font-mono font-bold tracking-wider">سند رقم: {transaction.voucherNo}</span>
              </div>

              {/* Amount Box */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-300">
                <span className="text-sm font-bold text-slate-700">المبلغ بالأرقام:</span>
                <div className="text-right">
                  <span className={`text-2xl font-black font-mono ${transaction.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900'}`} dir="ltr">
                    {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                  </span>
                  {transaction.currency === 'USD' && (
                    <div className="text-[11px] text-slate-600 font-mono" dir="ltr">
                      ≈ {new Intl.NumberFormat('ar-IQ').format(transaction.amount * (transaction.exchangeRate || 1500))} د.ع
                    </div>
                  )}
                </div>
              </div>

              {/* Voucher Content Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 border-b border-slate-200 p-3 bg-slate-50 font-bold">
                  <div>تاريخ السند: {transaction.date}</div>
                  <div>التصنيف: {transaction.category}</div>
                  <div>منفذ القيد: {transaction.recordedBy}</div>
                </div>

                <div className="p-4 space-y-3 leading-loose text-sm">
                  <div>
                    <strong>{transaction.type === 'deposit' ? 'استلمنا نقداً من السيد / السادة:' : 'صرفنا نقداً إلى السيد / السادة:'}</strong>
                    <span className="mx-2 font-bold underline text-slate-950">{transaction.partyName}</span>
                  </div>

                  <div>
                    <strong>مبلغ وقدره:</strong>
                    <span className="mx-2 font-mono font-bold">{formatCurrency(transaction.amount, transaction.currency || 'IQD')}</span>
                  </div>

                  {transaction.hasCommission && (transaction.commissionAmount || 0) > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-300 text-amber-950 space-y-1.5 text-xs">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <strong>عمولة تحويل / صرافة:</strong>{' '}
                          <span className="font-mono font-bold" dir="ltr">
                            {formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || transaction.currency || 'IQD')}
                          </span>
                          <span className="mr-2 text-[11px] font-semibold text-amber-900">
                            ({transaction.commissionBearer === 'company'
                              ? 'تحملتها الشركة كمصروف مستقل — لا تُستقطع من حق الطرف'
                              : 'يتحملها الطرف الآخر'})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-700">
                          حق الطرف المالي: <strong>{formatCurrency(transaction.amount, transaction.currency || 'IQD')}</strong> (كامل غير منقوص)
                        </div>
                      </div>

                      {transaction.commissionBearer === 'company' && (
                        <div className="text-[11px] text-slate-700 border-t border-amber-200/80 pt-1 flex justify-between">
                          <span>
                            {transaction.type === 'deposit' ? 'صافي النقد الفعلي المستلم بالصندوق:' : 'إجمالي النقد الفعلي المصروف من الصندوق:'}
                          </span>
                          <strong className="font-mono" dir="ltr">
                            {(transaction.commissionCurrency || transaction.currency || 'IQD') === (transaction.currency || 'IQD')
                              ? transaction.type === 'deposit'
                                ? formatCurrency(Math.max(0, transaction.amount - (transaction.commissionAmount || 0)), transaction.currency || 'IQD')
                                : formatCurrency(transaction.amount + (transaction.commissionAmount || 0), transaction.currency || 'IQD')
                              : transaction.type === 'deposit'
                              ? `${formatCurrency(transaction.amount, transaction.currency || 'IQD')} (مع خصم ${formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || 'IQD')} عمولة)`
                              : `${formatCurrency(transaction.amount, transaction.currency || 'IQD')} (مع إضافة ${formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || 'IQD')} عمولة)`}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <strong>وذلك عن / البيان:</strong>
                    <span className="mx-2 text-slate-800">{transaction.description || 'حركة نقدية بصندوق الشركة'}</span>
                  </div>
                </div>

                {/* Journal Entry (سند التوجيه المحاسبي المولد) */}
                <div className="mt-4 border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-200 text-slate-800 flex justify-between items-center">
                    <span>التوجيه المحاسبي الدفتري المعتمد (سند القيد)</span>
                    <span className="text-[10px] text-slate-500 font-normal">مطابق لمعايير القيد المزدوج</span>
                  </div>
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] text-slate-700 border-b border-slate-200 font-semibold">
                        <th className="py-1.5 px-3 w-28 text-center">مدين</th>
                        <th className="py-1.5 px-3 w-28 text-center">دائن</th>
                        <th className="py-1.5 px-3">اسم الحساب الدفتري والبيان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] font-mono">
                      {transaction.hasCommission && (transaction.commissionAmount || 0) > 0 && transaction.commissionBearer === 'company' ? (
                        transaction.type === 'deposit' ? (
                          <>
                            <tr>
                              <td className="py-1 px-3 text-center text-emerald-700 font-bold" dir="ltr">
                                {(transaction.commissionCurrency || transaction.currency || 'IQD') === (transaction.currency || 'IQD')
                                  ? formatCurrency(Math.max(0, transaction.amount - (transaction.commissionAmount || 0)), transaction.currency || 'IQD')
                                  : formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans">
                                حـ/ الصندوق ({transaction.currency || 'IQD'}) - صافي النقد المقبوض
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-amber-700 font-bold" dir="ltr">
                                {formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans">
                                حـ/ مصاريف عمولات وتحويل ({transaction.commissionCurrency || transaction.currency || 'IQD'}) - عبء على الشركة
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 text-center text-cyan-800 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 font-sans font-bold">
                                إلى حـ/ {transaction.partyName || 'المودع'} (إجمالي المبلغ المقيد لحسابه دون استقطاع)
                              </td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="py-1 px-3 text-center text-cyan-800 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans font-bold">
                                حـ/ {transaction.partyName || 'المستلم'} (كامل المبلغ المسحوب لحسابه)
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-amber-700 font-bold" dir="ltr">
                                {formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans">
                                حـ/ مصاريف عمولات وتحويل ({transaction.commissionCurrency || transaction.currency || 'IQD'}) - عبء على الشركة
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 text-center text-rose-700 font-bold" dir="ltr">
                                {(transaction.commissionCurrency || transaction.currency || 'IQD') === (transaction.currency || 'IQD')
                                  ? formatCurrency(transaction.amount + (transaction.commissionAmount || 0), transaction.currency || 'IQD')
                                  : `${formatCurrency(transaction.amount, transaction.currency || 'IQD')} + ${formatCurrency(transaction.commissionAmount || 0, transaction.commissionCurrency || 'IQD')}`}
                              </td>
                              <td className="py-1 px-3 font-sans">
                                إلى حـ/ الصندوق ({transaction.currency || 'IQD'}) - إجمالي النقد المصروف
                              </td>
                            </tr>
                          </>
                        )
                      ) : (
                        transaction.type === 'deposit' ? (
                          <>
                            <tr>
                              <td className="py-1 px-3 text-center text-emerald-700 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans">حـ/ الصندوق ({transaction.currency || 'IQD'})</td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 text-center text-cyan-800 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 font-sans">إلى حـ/ {transaction.partyName || 'المودع'}</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="py-1 px-3 text-center text-cyan-800 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 font-sans">حـ/ {transaction.partyName || 'المستلم'}</td>
                            </tr>
                            <tr>
                              <td className="py-1 px-3 text-center text-slate-400">—</td>
                              <td className="py-1 px-3 text-center text-rose-700 font-bold" dir="ltr">
                                {formatCurrency(transaction.amount, transaction.currency || 'IQD')}
                              </td>
                              <td className="py-1 px-3 font-sans">إلى حـ/ الصندوق ({transaction.currency || 'IQD'})</td>
                            </tr>
                          </>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attached Voucher Notification if available */}
              {transaction.attachment && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <span className="text-slate-700">📎 يوجد وصل مالي / إشعار بنكي مؤرشف مع هذا القيد: <strong>{transaction.attachment.name}</strong></span>
                  <span className="font-mono text-slate-500">تمت الأرشفة بتاريخ {transaction.attachment.date}</span>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-12 text-xs text-center">
                <div>
                  <p className="font-bold mb-14 text-slate-800">أمين الصندوق (المستلم/الصارف)</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div>
                  <p className="font-bold mb-14 text-slate-800">توقيع المستلم / المودع</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div>
                  <p className="font-bold mb-14 text-slate-800">مصادقة المدير العام / الختم</p>
                  <p className="text-slate-400">................................................</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: TREASURY STATEMENT REPORT (كشف حركة الصندوق) */}
          {mode === 'statement' && (
            <div className="space-y-6">
              <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
                <h2 className="text-xl font-black text-slate-900">كشف حساب وحركة صندوق الشركة المالي</h2>
                <p className="text-xs text-slate-600">سجل عمليات السحب والإيداع النقدية وحركة السيولة</p>
              </div>

              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <span className="text-slate-600 block">إجمالي الإيداعات والمقبوضات:</span>
                    <strong className="text-emerald-700 font-mono text-sm block mt-1" dir="ltr">
                      {formatCurrency(summary.totalInflow)}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                    <span className="text-slate-600 block">إجمالي السحوبات والمصروفات:</span>
                    <strong className="text-rose-700 font-mono text-sm block mt-1" dir="ltr">
                      {formatCurrency(summary.totalOutflow)}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-100 border border-slate-400 rounded-lg text-center">
                    <span className="text-slate-900 font-bold block">رصيد الصندوق الحالي:</span>
                    <strong className="text-slate-900 font-mono text-base block mt-1" dir="ltr">
                      {formatCurrency(summary.currentBalance)}
                    </strong>
                  </div>
                </div>
              )}

              {/* Statement Table */}
              <table className="w-full text-right text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300 font-bold">
                    <th className="p-2 border-l border-slate-300">رقم السند</th>
                    <th className="p-2 border-l border-slate-300">التاريخ</th>
                    <th className="p-2 border-l border-slate-300">نوع الحركة</th>
                    <th className="p-2 border-l border-slate-300">الطرف / المستفيد</th>
                    <th className="p-2 border-l border-slate-300">البيان والتصنيف</th>
                    <th className="p-2 border-l border-slate-300 text-left">وارد (+)</th>
                    <th className="p-2 border-l border-slate-300 text-left">صادر (-)</th>
                    <th className="p-2 border-l border-slate-300 text-center">الأرشفة</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => {
                    const isCancelled = t.status === 'cancelled';
                    return (
                      <tr key={t.id} className={`border-b border-slate-200 ${isCancelled ? 'bg-rose-50/60 text-slate-400' : ''}`}>
                        <td className="p-2 border-l border-slate-300 font-mono font-bold">
                          <span className={isCancelled ? 'line-through text-slate-400' : ''}>{t.voucherNo}</span>
                          {isCancelled && <span className="mr-1 text-[9px] text-rose-600 font-bold bg-rose-100 px-1 py-0.2 rounded">(ملغي دفترياً)</span>}
                        </td>
                        <td className="p-2 border-l border-slate-300 font-mono">{t.date}</td>
                        <td className="p-2 border-l border-slate-300">
                          {t.type === 'deposit' ? 'إيداع نقدي' : 'سحب نقدي'}
                        </td>
                        <td className="p-2 border-l border-slate-300 font-semibold">{t.partyName}</td>
                        <td className="p-2 border-l border-slate-300">
                          <div>{t.category}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {isCancelled ? `[ملغي: ${t.cancelReason || 'قيد ملغي'}] ${t.description || ''}` : (t.description || '—')}
                          </div>
                        </td>
                        <td className="p-2 border-l border-slate-300 font-mono font-bold text-left text-emerald-800" dir="ltr">
                          {t.type === 'deposit' ? (
                            <span className={isCancelled ? 'line-through text-slate-400' : ''}>{formatCurrency(t.amount)}</span>
                          ) : '—'}
                        </td>
                        <td className="p-2 border-l border-slate-300 font-mono font-bold text-left text-rose-800" dir="ltr">
                          {t.type === 'withdrawal' ? (
                            <span className={isCancelled ? 'line-through text-slate-400' : ''}>{formatCurrency(t.amount)}</span>
                          ) : '—'}
                        </td>
                        <td className="p-2 border-l border-slate-300 text-center">
                          {t.attachment ? 'مؤرشف ✓' : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-12 text-xs text-center">
                <div>
                  <p className="font-bold mb-12 text-slate-800">إعداد / أمين الصندوق</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div>
                  <p className="font-bold mb-12 text-slate-800">اعتماد الإدارة المالية / الختم</p>
                  <p className="text-slate-400">................................................</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
