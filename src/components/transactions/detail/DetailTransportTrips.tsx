import React from 'react';
import { Truck, Plus, Eye, Trash2 } from 'lucide-react';
import { Transaction, BillTransportTrip, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface DetailTransportTripsProps {
  transaction: Transaction;
  fin: {
    totalCarrierCost?: number;
    totalCarrierPaid?: number;
    remainingCarrierDue?: number;
  };
  onEditTransaction?: (tx: Transaction) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onDeleteTrip?: (tx: Transaction, trip: BillTransportTrip) => void;
}

export const DetailTransportTrips: React.FC<DetailTransportTripsProps> = ({
  transaction,
  fin,
  onEditTransaction,
  onViewArchive,
  onDeleteTrip,
}) => {
  if (!((transaction.transportTrips && transaction.transportTrips.length > 0) || transaction.transportDocument)) {
    return null;
  }

  return (
    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="font-bold text-white text-xs flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>نقل البضائع والنواقل ({transaction.transportTrips?.length || 0} نقلة)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onEditTransaction && transaction.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => onEditTransaction(transaction)}
              className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition"
              title="إضافة أو تعديل نقلات وشاحنات البوليصة"
            >
              <Plus className="w-3 h-3" />
              <span>إدارة النقلات</span>
            </button>
          )}
          {transaction.transportDocument && onViewArchive && (
            <button
              type="button"
              onClick={() =>
                onViewArchive(
                  transaction.transportDocument!,
                  `وصل استلام النقل - بوليصة ${transaction.billNo}`
                )
              }
              className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>معاينة الوصل</span>
            </button>
          )}
        </div>
      </div>

      {transaction.transportTrips && transaction.transportTrips.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                <th className="py-1.5 px-2">شركة النقل</th>
                <th className="py-1.5 px-2">الوجهة</th>
                <th className="py-1.5 px-2 text-center">الشاحنات</th>
                <th className="py-1.5 px-2">السائق</th>
                <th className="py-1.5 px-2">أجرة الناقل</th>
                <th className="py-1.5 px-2 text-center">وصل</th>
                <th className="py-1.5 px-2 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {transaction.transportTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-900/40">
                  <td className="py-1.5 px-2 font-bold text-white">{trip.carrierName || 'شركة نقل'}</td>
                  <td className="py-1.5 px-2 text-slate-300">{trip.destination || '—'}</td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold text-amber-300">
                    {trip.truckCount || 1}
                  </td>
                  <td className="py-1.5 px-2">
                    <div className="text-slate-200">{trip.driverName || '—'}</div>
                    <div className="text-[9px] font-mono text-cyan-300">
                      {trip.truckPlateNo || ''}
                    </div>
                  </td>
                  <td className="py-1.5 px-2 font-mono font-bold text-amber-400" dir="ltr">
                    {formatCurrency(trip.carrierCost, trip.currency)}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {trip.transportDocument && onViewArchive ? (
                      <button
                        type="button"
                        onClick={() =>
                          onViewArchive(
                            trip.transportDocument!,
                            `وصل نقلة (${trip.destination}) - بوليصة ${transaction.billNo}`
                          )
                        }
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                      >
                        <Eye className="w-2.5 h-2.5" />
                        <span>عرض</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {onDeleteTrip && transaction.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => onDeleteTrip(transaction, trip)}
                        className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                        title="حذف النقلة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {(fin.totalCarrierCost || 0) > 0 && (
              <tfoot className="border-t border-slate-700 text-[11px] font-mono divide-y divide-slate-800/80 bg-slate-900/90">
                <tr>
                  <td colSpan={4} className="py-1.5 px-2 text-slate-300 font-sans font-bold">
                    إجمالي أجور النواقل:
                  </td>
                  <td className="py-1.5 px-2 font-mono text-amber-400 font-bold" dir="ltr">
                    {formatCurrency(fin.totalCarrierCost || 0, transaction.currency || 'IQD')}
                  </td>
                  <td colSpan={2} className="py-1.5 px-2 text-center text-[10px] text-slate-400 font-sans">
                    كلفة تشغيلية
                  </td>
                </tr>
                {(fin.totalCarrierPaid || 0) > 0 && (
                  <tr className="font-semibold">
                    <td colSpan={4} className="py-1 px-2 text-emerald-300 font-sans">
                      ✓ المسدد للنواقل (سندات صرف):
                    </td>
                    <td className="py-1 px-2 font-mono text-emerald-400 font-bold" dir="ltr">
                      - {formatCurrency(fin.totalCarrierPaid || 0, transaction.currency || 'IQD')}
                    </td>
                    <td colSpan={2} className="py-1 px-2 text-center text-[10px] text-emerald-400 font-sans">
                      مسدد نقداً
                    </td>
                  </tr>
                )}
                <tr className={`font-bold ${
                  (fin.remainingCarrierDue || 0) > 0 
                    ? 'bg-amber-950/30 text-amber-300' 
                    : 'bg-emerald-950/30 text-emerald-300'
                }`}>
                  <td colSpan={4} className="py-1.5 px-2 font-sans">
                    المستحق المتبقي للناقل:
                  </td>
                  <td className={`py-1.5 px-2 font-mono font-bold ${
                    (fin.remainingCarrierDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`} dir="ltr">
                    {formatCurrency(
                      fin.remainingCarrierDue !== undefined 
                        ? fin.remainingCarrierDue 
                        : Math.max(0, (fin.totalCarrierCost || 0) - (fin.totalCarrierPaid || 0)), 
                      transaction.currency || 'IQD'
                    )}
                  </td>
                  <td colSpan={2} className="py-1.5 px-2 text-center text-[10px] font-sans">
                    {(fin.remainingCarrierDue || 0) > 0 ? 'مستحق' : 'خالص ✅'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};
