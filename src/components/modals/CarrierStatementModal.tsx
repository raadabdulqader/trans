import React from 'react';
import {
  X,
  Truck,
  Printer,
  Plus,
  Eye,
  FileText,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import {
  TransportCompany,
  Transaction,
  TreasuryTransaction,
  TreasuryAttachment,
} from '../../types/customs';
import { formatCurrency, getCarrierFinancials } from '../../utils/storage';

export interface CarrierStatementModalProps {
  isOpen: boolean;
  carrier: TransportCompany | null;
  transactions: Transaction[];
  treasury: TreasuryTransaction[];
  exchangeRate?: number;
  onClose: () => void;
  onOpenPayModal: (carrier: TransportCompany, billNo?: string) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onPrintVoucher?: (tx: TreasuryTransaction) => void;
  onVoidPayment?: (tx: TreasuryTransaction) => void;
}

export const CarrierStatementModal: React.FC<CarrierStatementModalProps> = ({
  isOpen,
  carrier,
  transactions,
  treasury,
  exchangeRate = 1500,
  onClose,
  onOpenPayModal,
  onViewArchive,
  onPrintVoucher,
  onVoidPayment,
}) => {
  if (!isOpen || !carrier) return null;

  const fin = getCarrierFinancials(carrier, transactions, treasury, exchangeRate);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                كشف حساب شركة النقل: {carrier.name}
              </h2>
              <p className="text-xs text-slate-400">
                المسؤول: {carrier.contactPerson || '—'} · الهاتف: <span className="font-mono">{carrier.phone || '—'}</span> · العنوان: {carrier.address || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPayModal(carrier)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسديد دفعة لشركة النقل</span>
            </button>
            <button
              onClick={handlePrintStatement}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Summary KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">إجمالي النقلات والشاحنات</div>
              <div className="text-lg font-black text-white font-mono">
                {fin.totalTripsCount} نقلة ({fin.totalTrucksCount} شاحنة)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                موزعة على {fin.billsCount} بوليصة
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">إجمالي مستحقات شركة النقل</div>
              <div className="text-base font-black text-amber-400 font-mono" dir="ltr">
                {formatCurrency(fin.totalCostIQD, 'IQD')}
              </div>
              {fin.totalCostUSD > 0 && (
                <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
                  + {formatCurrency(fin.totalCostUSD, 'USD')}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 mb-1">إجمالي المسدد من الصندوق</div>
              <div className="text-base font-black text-emerald-400 font-mono" dir="ltr">
                {formatCurrency(fin.paidIQD, 'IQD')}
              </div>
              {fin.paidUSD > 0 && (
                <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5" dir="ltr">
                  + {formatCurrency(fin.paidUSD, 'USD')}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
              <div className="text-amber-300 font-bold mb-1">الرصيد المتبقي بذمتنا للناقل</div>
              <div className="text-base font-black text-rose-400 font-mono" dir="ltr">
                {fin.remainingIQD > 0 || fin.remainingUSD === 0
                  ? formatCurrency(fin.remainingIQD, 'IQD')
                  : ''}
                {fin.remainingUSD > 0
                  ? `${fin.remainingIQD > 0 ? ' + ' : ''}${formatCurrency(fin.remainingUSD, 'USD')}`
                  : ''}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {fin.remainingIQD === 0 && fin.remainingUSD === 0
                  ? '✅ حساب الشركة مصفى بالكامل'
                  : 'مستحق الدفع لشركة النقل'}
              </div>
            </div>
          </div>

          {/* Section 1: Trips Executed by Carrier */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>1. سجل النقلات والشاحنات المنفذة ({fin.trips.length})</span>
            </h3>

            {fin.trips.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-500">
                لا توجد نقلات مسجلة لهذه الشركة في البوالص حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">رقم البوليصة</th>
                      <th className="py-2.5 px-3">وجهة النقل</th>
                      <th className="py-2.5 px-3 text-center">عدد الشاحنات</th>
                      <th className="py-2.5 px-3">السائق ورقم السيارة</th>
                      <th className="py-2.5 px-3">أجرة شركة النقل</th>
                      <th className="py-2.5 px-3 text-center">وصل استلام النقل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {fin.trips.map(({ trip, bill }) => {
                      const docToView = trip.transportDocument || bill.transportDocument;
                      return (
                        <tr key={trip.id} className="hover:bg-slate-900/60">
                          <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                            {bill.date}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {bill.billNo}
                            <div className="text-[10px] font-sans font-normal text-slate-400 truncate max-w-[160px]">
                              {bill.goodsType}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-200">
                            {trip.destination || '—'}
                            {trip.notes && (
                              <div className="text-[10px] font-normal text-slate-400">{trip.notes}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-300">
                            {trip.truckCount || 1} شاحنة
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-200">{trip.driverName || '—'}</div>
                            <div className="text-[10px] font-mono text-cyan-300">
                              {trip.truckPlateNo || '—'} {trip.driverPhone ? `· ${trip.driverPhone}` : ''}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap" dir="ltr">
                            {formatCurrency(trip.carrierCost, trip.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {docToView && onViewArchive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onViewArchive(
                                    docToView,
                                    `وصل استلام نقل بوليصة ${bill.billNo} (${carrier.name})`
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة الوصل</span>
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[11px]">غير مرفق</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Payments Disbursed from Cashbox */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>2. سجل الدفعات المسددة لشركة النقل من الصندوق ({fin.payments.length})</span>
            </h3>

            {fin.payments.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-500">
                لم يتم تسجيل أي دفعات مسددة لهذه الشركة حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2.5 px-3">رقم السند</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">البوليصة</th>
                      <th className="py-2.5 px-3">البيان والملاحظات</th>
                      <th className="py-2.5 px-3">المبلغ المسدد</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3 text-center print:hidden">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {fin.payments.map((pmt) => {
                      const isCancelled = pmt.status === 'cancelled';
                      return (
                        <tr
                          key={pmt.id}
                          className={isCancelled ? 'bg-rose-950/20 opacity-65 line-through' : 'hover:bg-slate-900/60'}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                            {pmt.voucherNo}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                            {pmt.date}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-cyan-400 whitespace-nowrap">
                            {pmt.relatedBillNo ? `بوليصة ${pmt.relatedBillNo}` : 'دفعة عامة'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {pmt.description}
                            {isCancelled && pmt.cancelReason && (
                              <div className="text-[10px] text-rose-400 font-semibold no-underline">
                                ⛔ سبب الإلغاء: {pmt.cancelReason}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap" dir="ltr">
                            {formatCurrency(pmt.amount, pmt.currency || 'IQD')}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isCancelled ? (
                              <span className="text-[10px] text-rose-400 font-bold">
                                ⛔ ملغي دفترياً
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>مسدد فعال</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <div className="flex items-center justify-center gap-1.5">
                              {pmt.attachment && onViewArchive && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onViewArchive(pmt.attachment!, `وصل تسديد ${pmt.voucherNo}`)
                                  }
                                  className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300"
                                  title="معاينة الوصل المرفق"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onPrintVoucher && (
                                <button
                                  type="button"
                                  onClick={() => onPrintVoucher(pmt)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="طباعة سند الصرف"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!isCancelled && onVoidPayment && (
                                <button
                                  type="button"
                                  onClick={() => onVoidPayment(pmt)}
                                  className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400"
                                  title="إلغاء دفتري للسند واسترداد المبلغ للصندوق"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
