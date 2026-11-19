import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { TransportCompany, Transaction, TreasuryAttachment } from '../../types/customs';
import { CarrierFinancialSummary, formatCurrency } from '../../utils/storage';

export interface CarriersTripsTableProps {
  allTrips: {
    carrier: TransportCompany;
    bill: Transaction;
    trip: CarrierFinancialSummary['trips'][number]['trip'];
  }[];
  onViewArchive: (attachment: TreasuryAttachment, title?: string) => void;
}

export const CarriersTripsTable: React.FC<CarriersTripsTableProps> = ({
  allTrips,
  onViewArchive,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>سجل النقلات والشاحنات المربوطة بالبوالص ({allTrips.length})</span>
        </h2>
      </div>

      {allTrips.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          لا توجد نقلات مضافة داخل البوالص حالياً. يمكنك إضافة نقلات وشاحنات من داخل نافذة إضافة أو تعديل البوليصة.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-3 px-4">رقم البوليصة</th>
                <th className="py-3 px-4">شركة النقل</th>
                <th className="py-3 px-4">وجهة النقل</th>
                <th className="py-3 px-4 text-center">عدد الشاحنات</th>
                <th className="py-3 px-4">اسم السائق ورقم السيارة</th>
                <th className="py-3 px-4">أجرة شركة النقل</th>
                <th className="py-3 px-4 text-center">ورقة / وصل النقل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {allTrips.map(({ carrier, bill, trip }) => {
                const doc = trip.transportDocument || bill.transportDocument;
                return (
                  <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {bill.billNo}
                      <div className="text-[10px] font-sans font-normal text-slate-400">
                        {bill.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{carrier.name}</td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">
                      {trip.destination || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                      {trip.truckCount || 1} شاحنة
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{trip.driverName || '—'}</div>
                      <div className="text-[11px] font-mono text-cyan-300">
                        {trip.truckPlateNo || '—'} {trip.driverPhone ? `· ${trip.driverPhone}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap" dir="ltr">
                      {formatCurrency(trip.carrierCost, trip.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {doc ? (
                        <button
                          onClick={() =>
                            onViewArchive(doc, `وصل استلام نقل بوليصة ${bill.billNo}`)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة وصل النقل</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">غير مرفق</span>
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
  );
};
