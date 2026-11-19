import React from 'react';
import { formatCurrency } from '../../utils/storage';

export interface CarriersMetricsCardsProps {
  carriersCount: number;
  totals: {
    trips: number;
    trucks: number;
    costIQD: number;
    costUSD: number;
    paidIQD: number;
    paidUSD: number;
    remIQD: number;
    remUSD: number;
  };
}

export const CarriersMetricsCards: React.FC<CarriersMetricsCardsProps> = ({
  carriersCount,
  totals,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-400 font-semibold">شركات النقل والشاحنات المنفذة</div>
        <div className="text-xl font-black text-white font-mono mt-1.5">
          {carriersCount} شركة نقل
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-mono">
          {totals.trips} نقلة · {totals.trucks} شاحنة وتريلة
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-400 font-semibold">المبلغ الكلي (إجمالي مستحقات النقل)</div>
        <div className="text-lg font-black text-amber-400 font-mono mt-1.5" dir="ltr">
          {formatCurrency(totals.costIQD, 'IQD')}
        </div>
        <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
          {totals.costUSD > 0 ? `+ ${formatCurrency(totals.costUSD, 'USD')}` : '0 دولار'}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-400 font-semibold">الواصل (المسدد للنواقل من الصندوق)</div>
        <div className="text-lg font-black text-emerald-400 font-mono mt-1.5" dir="ltr">
          {formatCurrency(totals.paidIQD, 'IQD')}
        </div>
        <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5" dir="ltr">
          {totals.paidUSD > 0 ? `+ ${formatCurrency(totals.paidUSD, 'USD')}` : '0 دولار'}
        </div>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
        <div className="text-xs text-amber-300 font-bold">المتبقي بذمتنا لشركات النقل</div>
        <div className="text-lg font-black text-rose-400 font-mono mt-1.5" dir="ltr">
          {formatCurrency(totals.remIQD, 'IQD')}
        </div>
        <div className="text-xs font-bold text-amber-400 font-mono mt-0.5" dir="ltr">
          {totals.remUSD > 0 ? `+ ${formatCurrency(totals.remUSD, 'USD')}` : 'لا يوجد متبقي بالدولار'}
        </div>
      </div>
    </div>
  );
};
