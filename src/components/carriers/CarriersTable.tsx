import React from 'react';
import { Truck, Layers } from 'lucide-react';
import { TransportCompany, TreasuryAttachment } from '../../types/customs';
import { CarrierFinancialSummary } from '../../utils/storage';
import { getCarrierBillGroups } from '../../utils/carrierCalculations';
import { CarrierRow } from './table/CarrierRow';
import { CarrierBillsDrillDown } from './table/CarrierBillsDrillDown';

export interface CarriersTableProps {
  filteredSummaries: CarrierFinancialSummary[];
  expandedCarrierIds: Record<string, boolean>;
  toggleExpandCarrier: (id: string) => void;
  toggleExpandAll: () => void;
  carrierBillGroupsMap: Map<string, ReturnType<typeof getCarrierBillGroups>>;
  canDelete: boolean;
  onAddCarrier: () => void;
  onEditCarrier: (carrier: TransportCompany) => void;
  onDeleteCarrier: (carrier: TransportCompany) => void;
  onPayCarrier: (carrier: TransportCompany, billNo?: string) => void;
  onOpenStatement: (carrier: TransportCompany) => void;
  onViewArchive: (attachment: TreasuryAttachment, title?: string) => void;
}

export const CarriersTable: React.FC<CarriersTableProps> = ({
  filteredSummaries,
  expandedCarrierIds,
  toggleExpandCarrier,
  toggleExpandAll,
  carrierBillGroupsMap,
  canDelete,
  onAddCarrier,
  onEditCarrier,
  onDeleteCarrier,
  onPayCarrier,
  onOpenStatement,
  onViewArchive,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            سجل شركات النقل، البوالص المسؤولة عليها، وكشوفات الحساب ({filteredSummaries.length})
          </h2>
        </div>

        {filteredSummaries.length > 0 && (
          <button
            type="button"
            onClick={toggleExpandAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {filteredSummaries.every((s) => expandedCarrierIds[s.carrier.id])
                ? 'طي كافة تفاصيل البوالص'
                : 'توسيع تفاصيل البوالص لكافة الشركات'}
            </span>
          </button>
        )}
      </div>

      {filteredSummaries.length === 0 ? (
        <div className="p-10 text-center text-slate-400 space-y-3">
          <p className="text-sm font-semibold">لا توجد شركات نقل مطابقة للبحث الحالي.</p>
          <button
            onClick={onAddCarrier}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold cursor-pointer"
          >
            + إضافة شركة نقل جديدة
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-3 px-4">شركة النقل والمسؤول</th>
                <th className="py-3 px-4">الهاتف والعنوان</th>
                <th className="py-3 px-4">البوالص المسؤولة عليها</th>
                <th className="py-3 px-4 text-center">النقلات / الشاحنات</th>
                <th className="py-3 px-4">المبلغ الكلي</th>
                <th className="py-3 px-4">الواصل (المسدد)</th>
                <th className="py-3 px-4">المتبقي بذمتنا</th>
                <th className="py-3 px-4 text-center">إجراءات المحاسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredSummaries.map((s) => {
                const { bills, unallocatedPaidIQD, unallocatedPaidUSD } =
                  carrierBillGroupsMap.get(s.carrier.id) || {
                    bills: [],
                    unallocatedPaidIQD: 0,
                    unallocatedPaidUSD: 0,
                  };
                const isExpanded = !!expandedCarrierIds[s.carrier.id];

                return (
                  <React.Fragment key={s.carrier.id}>
                    <CarrierRow
                      summary={s}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleExpandCarrier(s.carrier.id)}
                      bills={bills}
                      canDelete={canDelete}
                      onPayCarrier={onPayCarrier}
                      onOpenStatement={onOpenStatement}
                      onEditCarrier={onEditCarrier}
                      onDeleteCarrier={onDeleteCarrier}
                    />

                    {isExpanded && (
                      <CarrierBillsDrillDown
                        carrier={s.carrier}
                        bills={bills}
                        unallocatedPaidIQD={unallocatedPaidIQD}
                        unallocatedPaidUSD={unallocatedPaidUSD}
                        onPayCarrier={onPayCarrier}
                        onViewArchive={onViewArchive}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
