'use client';

import React from 'react';
import { Coins, CheckCircle2, Eye } from 'lucide-react';
import { TransportCompany, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { getCarrierBillGroups } from '../../../utils/carrierCalculations';

export interface CarrierBillsDrillDownProps {
  carrier: TransportCompany;
  bills: ReturnType<typeof getCarrierBillGroups>['bills'];
  unallocatedPaidIQD: number;
  unallocatedPaidUSD: number;
  onPayCarrier: (carrier: TransportCompany, billNo?: string) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
}

export const CarrierBillsDrillDown: React.FC<CarrierBillsDrillDownProps> = ({
  carrier,
  bills,
  unallocatedPaidIQD,
  unallocatedPaidUSD,
  onPayCarrier,
  onViewArchive,
}) => {
  return (
    <tr className="bg-slate-950/60 border-b-2 border-amber-500/20">
      <td colSpan={8} className="p-4 space-y-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>📦 بوالص الشحن التابعة لشركة:</span>
                <strong className="text-amber-300">{carrier.name}</strong>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({bills.length} بوليصة كمركية)
              </span>
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-3">
              لا توجد بوالص شحن مسجلة لهذه الشركة بعد.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-800">
                    <th className="py-2 px-3">رقم البوليصة</th>
                    <th className="py-2 px-3">الزبون / البضاعة</th>
                    <th className="py-2 px-3 text-center">النقلات / الشاحنات</th>
                    <th className="py-2 px-3">أجرة النقل الكلية</th>
                    <th className="py-2 px-3">الواصل للبوليصة</th>
                    <th className="py-2 px-3">المتبقي للبوليصة</th>
                    <th className="py-2 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {bills.map((b) => {
                    const hasBillDebt = b.remainingIQD > 0 || b.remainingUSD > 0;
                    return (
                      <tr key={b.billId} className="hover:bg-slate-800/30 transition">
                        {/* 1. رقم البوليصة */}
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {b.billNo}
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            {b.billDate}
                          </div>
                        </td>

                        {/* 2. الزبون والبضاعة */}
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-bold text-white text-[11px]">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400">{b.goodsType}</div>
                        </td>

                        {/* 3. النقلات والشاحنات */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-white">{b.tripsCount} نقلة</span>
                          <span className="text-slate-400 text-[10px] block">
                            ({b.trucksCount} شاحنة)
                          </span>
                        </td>

                        {/* 4. أجرة النقل الكلية */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5">
                            {b.totalCostIQD > 0 && (
                              <div className="font-bold text-white text-xs">
                                {formatCurrency(b.totalCostIQD, 'IQD')}
                              </div>
                            )}
                            {b.totalCostUSD > 0 && (
                              <div className="font-bold text-cyan-400 text-[11px]">
                                {formatCurrency(b.totalCostUSD, 'USD')}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. الواصل للبوليصة */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5">
                            {b.paidIQD > 0 && (
                              <div className="font-bold text-emerald-400 text-xs">
                                {formatCurrency(b.paidIQD, 'IQD')}
                              </div>
                            )}
                            {b.paidUSD > 0 && (
                              <div className="font-bold text-cyan-300 text-[11px]">
                                {formatCurrency(b.paidUSD, 'USD')}
                              </div>
                            )}
                            {b.paidIQD === 0 && b.paidUSD === 0 && (
                              <span className="text-slate-500 font-sans text-[11px]">لم يُسدد</span>
                            )}
                          </div>
                        </td>

                        {/* 6. المتبقي للبوليصة */}
                        <td className="py-2.5 px-3">
                          {hasBillDebt ? (
                            <div className="space-y-0.5">
                              {b.remainingIQD > 0 && (
                                <div className="font-black text-rose-400 text-xs">
                                  {formatCurrency(b.remainingIQD, 'IQD')}
                                </div>
                              )}
                              {b.remainingUSD > 0 && (
                                <div className="font-black text-amber-400 text-[11px]">
                                  {formatCurrency(b.remainingUSD, 'USD')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>خالص (0)</span>
                            </span>
                          )}
                        </td>

                        {/* 7. إجراءات */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {hasBillDebt ? (
                              <button
                                type="button"
                                onClick={() => onPayCarrier(carrier, b.billNo)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-xs whitespace-nowrap cursor-pointer"
                                title={`تسديد دفعة مخصصة للبوليصة ${b.billNo}`}
                              >
                                <Coins className="w-3 h-3" />
                                <span>تسديد لهذه البوليصة</span>
                              </button>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                                مسددة بالكامل
                              </span>
                            )}

                            {b.transportDoc && onViewArchive && (
                              <button
                                type="button"
                                onClick={() =>
                                  onViewArchive(
                                    b.transportDoc!,
                                    `وصل نقل بوليصة ${b.billNo} (${carrier.name})`
                                  )
                                }
                                className="p-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                                title="معاينة وصل استلام النقل"
                              >
                                <Eye className="w-3 h-3" />
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

          {/* Unallocated Payments Notice if any */}
          {(unallocatedPaidIQD > 0 || unallocatedPaidUSD > 0) && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>تنبيه محاسبي:</strong> توجد دفعات عامة مسددة لشركة النقل على الحساب (غير مخصصة لبوليصة معينة):
                </span>
              </div>
              <div className="font-mono font-bold text-cyan-300" dir="ltr">
                {unallocatedPaidIQD > 0 && formatCurrency(unallocatedPaidIQD, 'IQD')}
                {unallocatedPaidUSD > 0 && ` + ${formatCurrency(unallocatedPaidUSD, 'USD')}`}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
