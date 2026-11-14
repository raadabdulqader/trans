'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, COMPANIES, CompanyId } from '../../types/customs';
import { formatCurrency, getBillFinancials } from '../../utils/storage';

interface PrintModalProps {
  isOpen: boolean;
  type: 'bill' | 'invoice' | 'voucher';
  transaction?: Transaction | null;
  receipt?: Receipt | null;
  customer?: Customer | null;
  employee?: Employee | null;
  receipts: Receipt[];
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  type,
  transaction,
  receipt,
  customer,
  employee,
  receipts,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyKey: CompanyId = transaction?.companyId || receipt?.companyId || 'naqaa_basra';
  const comp = COMPANIES[companyKey] || COMPANIES.naqaa_basra;

  const fin = transaction ? getBillFinancials(transaction, receipts) : null;
  const billReceipts = transaction ? receipts.filter(r => r.billId === transaction.id) : [];

  const todayStr = new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Header Controls */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {type === 'invoice' ? 'معاينة فاتورة العميل' : type === 'bill' ? 'معاينة ملف البوليصة والمعاملة' : 'معاينة سند مالي'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${comp.badgeClass}`}>
                {comp.name}
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

        {/* Printable Area with Authentic Formal Document Design */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[75vh] overflow-y-auto" id="printableArea" dir="rtl">
          
          {/* Company Formal Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <h1 className="text-2xl font-black text-slate-900">{comp.fullName}</h1>
              </div>
              <p className="text-xs text-slate-600 font-semibold">{comp.slogan}</p>
              <p className="text-[11px] text-slate-500">{comp.address} • هاتف: {comp.phone} • {comp.email}</p>
              <div className="text-[10px] text-emerald-800 font-bold font-mono">
                {comp.regNo} • حساب صندوق الشركة المالي المشترك
              </div>
            </div>
            <div className="text-left font-mono text-xs text-slate-600 space-y-1" dir="ltr">
              <div className="font-bold text-slate-900 text-sm">{comp.shortName}</div>
              <div>Date: {todayStr}</div>
              <div>Doc Ref: {transaction ? transaction.billNo : receipt ? receipt.receiptNo : 'DOC-01'}</div>
            </div>
          </div>

          {/* TYPE: CLIENT INVOICE */}
          {type === 'invoice' && transaction && fin && (
            <div className="space-y-6">
              {transaction.status === 'cancelled' && (
                <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
                  <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
                    <span>⛔ فاتورة وبوليصة ملغاة دفترياً ومحاسبياً (VOID INVOICE)</span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold">
                    هذه الفاتورة ملغاة دفترياً وتم تحييد كافة قيودها المالية وسندات القبض المرتبطة بها من حسابات صندوق الشركة.
                  </p>
                  <div className="text-[11px] text-rose-800 font-medium mt-1">
                    سبب الإلغاء: {transaction.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {transaction.cancelledBy || 'المسؤول'} {transaction.cancelledAt ? `(${transaction.cancelledAt.split('T')[0]})` : ''}
                  </div>
                </div>
              )}

              <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
                <h2 className="text-xl font-bold text-slate-900">فاتورة حساب تخليص كمركي</h2>
                <span className="text-xs text-slate-600 font-mono">Invoice #{transaction.billNo}</span>
              </div>

              {/* Customer and Bill Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div><strong>السادة / الشركة:</strong> {customer?.name || 'الزبون المحترم'}</div>
                  <div><strong>اسم المسؤول:</strong> {customer?.contact || '—'}</div>
                  <div><strong>رقم الهاتف:</strong> {customer?.phone || '—'}</div>
                  <div><strong>العنوان:</strong> {customer?.address || '—'}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div><strong>رقم البوليصة (B/L):</strong> <span className="font-mono font-bold">{transaction.billNo}</span></div>
                  <div><strong>تاريخ إنشاء البوليصة:</strong> <span className="font-mono">{transaction.createdAt || transaction.date}</span></div>
                  <div><strong>تاريخ الاستلام:</strong> <span className="font-mono">{transaction.date}</span></div>
                  <div><strong>نوع البضاعة:</strong> {transaction.goodsType || 'بضاعة عامة'}</div>
                  <div><strong>المخلص المسؤول:</strong> {employee?.name || '—'}</div>
                </div>
              </div>

              {/* Containers List */}
              {transaction.containers.length > 0 && (
                <div className="space-y-1 text-xs">
                  <strong>🚢 أرقام الحاويات المشمولة:</strong>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono">
                    {transaction.containers.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Statement Table */}
              <table className="w-full text-right text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300 font-bold">
                    <th className="p-2.5 border-l border-slate-300">البيان / الوصف</th>
                    <th className="p-2.5 text-left border-l border-slate-300">المبلغ (د.ع)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 border-l border-slate-300">
                      <div>أجور ومصاريف التخليص الكمركي، الرسوم، ومناولة البضاعة للبوليصة {transaction.billNo}</div>
                      {(fin.totalCarrierCost || 0) > 0 && (
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          (إجمالي العقد: {formatCurrency(fin.grossTotalAmount || 0, transaction.currency || 'IQD')} - استقطاع أجور النقل البري: {formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')})
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-left border-l border-slate-300" dir="ltr">
                      {formatCurrency(fin.totalAmount, transaction.currency || 'IQD')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-emerald-50 text-emerald-900">
                    <td className="p-2.5 border-l border-slate-300">إجمالي المبالغ المسددة والمقبوضة حتى تاريخه</td>
                    <td className="p-2.5 font-mono font-bold text-left border-l border-slate-300" dir="ltr">
                      {formatCurrency(fin.totalCollected, transaction.currency || 'IQD')}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td className="p-3 border-l border-slate-300 text-slate-900">الرصيد المتبقي المطلوب سداده:</td>
                    <td className="p-3 font-mono text-left border-l border-slate-300 text-slate-900" dir="ltr">
                      {formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
                <div>
                  <p className="font-bold mb-12">توقيع وختم المحاسب</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div>
                  <p className="font-bold mb-12">توقيع المستلم / العميل</p>
                  <p className="text-slate-400">................................................</p>
                </div>
              </div>
            </div>
          )}

          {/* TYPE: FULL BILL DOSSIER */}
          {type === 'bill' && transaction && fin && (
            <div className="space-y-6">
              {transaction.status === 'cancelled' && (
                <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
                  <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
                    <span>⛔ ملف بوليصة ملغي دفترياً ومحاسبياً (VOID DOSSIER)</span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold">
                    هذه المعاملة ملغاة دفترياً وتم تسوية/استرداد كافة الحسابات والذمم والسلف المرتبطة بها في صندوق الشركة.
                  </p>
                  <div className="text-[11px] text-rose-800 font-medium mt-1">
                    سبب الإلغاء: {transaction.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {transaction.cancelledBy || 'المسؤول'} {transaction.cancelledAt ? `(${transaction.cancelledAt.split('T')[0]})` : ''}
                  </div>
                </div>
              )}

              <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
                <h2 className="text-xl font-bold text-slate-900">ملف البوليصة والمعاملة الكمركية</h2>
                <span className="text-xs text-slate-600 font-mono">Dossier #{transaction.billNo}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div><strong>العميل:</strong> {customer?.name}</div>
                  <div><strong>المخلص:</strong> {employee?.name}</div>
                  <div><strong>تاريخ إنشاء البوليصة:</strong> <span className="font-mono">{transaction.createdAt || transaction.date}</span></div>
                  <div><strong>تاريخ الاستلام والفتح:</strong> <span className="font-mono">{transaction.date}</span></div>
                  <div><strong>الحالة:</strong> {transaction.status === 'completed' ? 'منجزة' : 'قيد التنفيذ'}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div>
                    <strong>المبلغ الكلي (الصافي):</strong> {formatCurrency(fin.totalAmount, transaction.currency || 'IQD')}
                    {(fin.totalCarrierCost || 0) > 0 && (
                      <span className="text-[10px] text-slate-500 mr-1">
                        (بعد خصم أجور الناقل: -{formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')})
                      </span>
                    )}
                  </div>
                  <div><strong>المسدد:</strong> {formatCurrency(fin.totalCollected, transaction.currency || 'IQD')}</div>
                  <div><strong>المتبقي:</strong> {formatCurrency(fin.remainingAmount, transaction.currency || 'IQD')}</div>
                  <div><strong>سلف المخلص المفتوحة:</strong> {formatCurrency(fin.openAdvances, transaction.currency || 'IQD')}</div>
                </div>
              </div>

              {/* Receipts inside bill */}
              <div className="space-y-2">
                <strong className="text-xs">سجل الحركات المالية المربوطة بالمعاملة:</strong>
                <table className="w-full text-right text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-2 border-l border-slate-300">رقم الوصل</th>
                      <th className="p-2 border-l border-slate-300">النوع</th>
                      <th className="p-2 border-l border-slate-300">المبلغ</th>
                      <th className="p-2 border-l border-slate-300">التاريخ</th>
                      <th className="p-2 border-l border-slate-300">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billReceipts.map(r => {
                      const rCurr = r.currency || transaction.currency || 'IQD';
                      return (
                        <tr key={r.id} className={`border-b border-slate-200 ${r.status === 'cancelled' ? 'bg-rose-50/60 text-slate-400' : ''}`}>
                          <td className="p-2 border-l border-slate-300 font-mono">
                            {r.receiptNo}
                            {r.status === 'cancelled' && <span className="mr-1.5 text-[10px] text-rose-600 font-bold bg-rose-100 px-1 py-0.2 rounded">(ملغي دفترياً)</span>}
                          </td>
                          <td className="p-2 border-l border-slate-300">
                            {r.type === 'deposit' ? 'دفعة أولى' : r.type === 'payment' ? 'دفعة زبون' : r.type === 'advance' ? 'سلفة مخلص' : 'تسوية'}
                          </td>
                          <td className="p-2 border-l border-slate-300 font-mono" dir="ltr">
                            <span className={r.status === 'cancelled' ? 'line-through text-slate-400' : ''}>{formatCurrency(r.amount, rCurr)}</span>
                          </td>
                          <td className="p-2 border-l border-slate-300 font-mono">{r.date}</td>
                          <td className="p-2 border-l border-slate-300">
                            {r.status === 'cancelled' ? `[ملغي: ${r.cancelReason || 'قيد ملغي'}] ${r.notes || ''}` : (r.notes || '—')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TYPE: SINGLE RECEIPT VOUCHER */}
          {type === 'voucher' && receipt && (
            <div className="space-y-6">
              {receipt.status === 'cancelled' && (
                <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
                  <div className="text-rose-700 font-black text-base flex items-center justify-center gap-2">
                    <span>⛔ سند ملغي دفترياً ومحاسبياً (VOID VOUCHER)</span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold">
                    هذا السند غير ساري المفعول وتم تحييد أثره المالي بالكامل من قيود الصندوق وحسابات الشركة.
                  </p>
                  <div className="text-[11px] text-rose-800 font-medium mt-1">
                    سبب الإلغاء: {receipt.cancelReason || 'إلغاء دفتري'} • تم الإلغاء بواسطة: {receipt.cancelledBy || 'المسؤول'} {receipt.cancelledAt ? `(${receipt.cancelledAt.split('T')[0]})` : ''}
                  </div>
                </div>
              )}

              <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
                <h2 className="text-xl font-bold text-slate-900">
                  {receipt.type === 'payment' || receipt.type === 'deposit' ? 'سند قبض مالي' : 'سند صرف سلفة / تسوية'}
                </h2>
                <span className="text-xs text-slate-600 font-mono">Voucher #{receipt.receiptNo}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs leading-loose">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span><strong>تاريخ السند:</strong> {receipt.date}</span>
                  {(() => {
                    const rcptCurr = receipt.currency || transaction?.currency || 'IQD';
                    return (
                      <div>
                        <strong>المبلغ:</strong>{' '}
                        <span className={`font-mono font-bold text-sm ${receipt.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900'}`} dir="ltr">
                          {formatCurrency(receipt.amount, rcptCurr)}
                        </span>
                        {rcptCurr === 'USD' && (
                          <div className="text-[10px] text-slate-600 font-mono text-left">
                            ≈ {new Intl.NumberFormat('ar-IQ').format(receipt.amount * (receipt.exchangeRate || 1500))} د.ع (سعر 100$ = {((receipt.exchangeRate || 1500) * 100).toLocaleString('ar-IQ')} د.ع)
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <strong>استلمنا من / صرفنا إلى:</strong> {customer ? customer.name : employee ? employee.name : '—'}
                </div>
                <div>
                  <strong>رقم البوليصة المعتمدة:</strong> <span className="font-mono font-bold">{transaction?.billNo || '—'}</span>
                </div>
                <div>
                  <strong>وذلك عن:</strong> {receipt.notes || 'تسديد رسوم ومصاريف كمركية'}
                </div>

                {receipt.hasCommission && (receipt.commissionAmount || 0) > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 flex flex-wrap justify-between items-center text-xs gap-2">
                    <div>
                      <strong>عمولة تحويل / صرافة:</strong>{' '}
                      <span className="font-mono font-bold" dir="ltr">
                        {formatCurrency(receipt.commissionAmount || 0, receipt.commissionCurrency || receipt.currency || 'IQD')}
                      </span>
                      <span className="mr-2 text-[11px] text-amber-800">
                        (الجهة المتحملة: {receipt.commissionBearer === 'company' ? 'الشركة / الصندوق كمصروف' : 'الزبون / الطرف الآخر'})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700">
                      المبلغ الأصلي: {formatCurrency(receipt.amount, receipt.currency || 'IQD')}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
                <div>
                  <p className="font-bold mb-12">أمين الصندوق / المحاسب</p>
                  <p className="text-slate-400">................................................</p>
                </div>
                <div>
                  <p className="font-bold mb-12">توقيع المستلم / المودع</p>
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
