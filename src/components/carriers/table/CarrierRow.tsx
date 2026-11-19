'use client';

import React from 'react';
import {
  User,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Coins,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { TransportCompany } from '../../../types/customs';
import { CarrierFinancialSummary, formatCurrency } from '../../../utils/storage';
import { getCarrierBillGroups } from '../../../utils/carrierCalculations';

export interface CarrierRowProps {
  summary: CarrierFinancialSummary;
  isExpanded: boolean;
  onToggleExpand: () => void;
  bills: ReturnType<typeof getCarrierBillGroups>['bills'];
  canDelete: boolean;
  onPayCarrier: (carrier: TransportCompany) => void;
  onOpenStatement: (carrier: TransportCompany) => void;
  onEditCarrier: (carrier: TransportCompany) => void;
  onDeleteCarrier: (carrier: TransportCompany) => void;
}

export const CarrierRow: React.FC<CarrierRowProps> = ({
  summary: s,
  isExpanded,
  onToggleExpand,
  bills,
  canDelete,
  onPayCarrier,
  onOpenStatement,
  onEditCarrier,
  onDeleteCarrier,
}) => {
  const hasDebt = s.remainingIQD > 0 || s.remainingUSD > 0;

  return (
    <tr className="hover:bg-slate-800/40 transition">
      {/* 1. شركة النقل والمسؤول */}
      <td className="py-3.5 px-4 align-top">
        <div className="font-bold text-white text-sm">{s.carrier.name}</div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
          <User className="w-3 h-3 text-amber-400" />
          <span>{s.carrier.contactPerson || 'لم يحدد اسم المسؤول'}</span>
        </div>
      </td>

      {/* 2. الهاتف والعنوان */}
      <td className="py-3.5 px-4 align-top">
        <div className="font-mono text-slate-200 flex items-center gap-1">
          <Phone className="w-3 h-3 text-cyan-400" />
          <span dir="ltr">{s.carrier.phone || '—'}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span>{s.carrier.address || '—'}</span>
        </div>
      </td>

      {/* 3. البوالص المسؤولة عليها مع زر التوسيع */}
      <td className="py-3.5 px-4 align-top">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onToggleExpand}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition w-fit cursor-pointer ${
              isExpanded
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
            title="عرض تفاصيل البوالص والشاحنات والمبالغ لكل بوليصة"
          >
            <span>
              {s.billsCount} {s.billsCount === 1 ? 'بوليصة' : 'بوالص'} مسؤولة عليها
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {bills.length > 0 && !isExpanded && (
            <div className="flex flex-wrap gap-1 max-w-[280px]">
              {bills.slice(0, 3).map((b) => (
                <span
                  key={b.billId}
                  className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-300"
                >
                  {b.billNo}
                </span>
              ))}
              {bills.length > 3 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  +{bills.length - 3} أخرى
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 4. النقلات والشاحنات */}
      <td className="py-3.5 px-4 text-center align-top font-mono">
        <div className="font-bold text-white text-xs">{s.totalTripsCount} نقلة</div>
        <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
          {s.totalTrucksCount} شاحنة
        </div>
      </td>

      {/* 5. المبلغ الكلي */}
      <td className="py-3.5 px-4 align-top font-mono">
        <div className="font-bold text-white text-xs" dir="ltr">
          {formatCurrency(s.totalCostIQD, 'IQD')}
        </div>
        {s.totalCostUSD > 0 && (
          <div className="text-cyan-400 font-bold text-[11px] mt-0.5" dir="ltr">
            + {formatCurrency(s.totalCostUSD, 'USD')}
          </div>
        )}
      </td>

      {/* 6. الواصل (المسدد) */}
      <td className="py-3.5 px-4 align-top font-mono">
        <div className="font-bold text-emerald-400 text-xs" dir="ltr">
          {formatCurrency(s.paidIQD, 'IQD')}
        </div>
        {s.paidUSD > 0 && (
          <div className="text-cyan-300 font-bold text-[11px] mt-0.5" dir="ltr">
            + {formatCurrency(s.paidUSD, 'USD')}
          </div>
        )}
      </td>

      {/* 7. المتبقي بذمتنا */}
      <td className="py-3.5 px-4 align-top font-mono">
        {hasDebt ? (
          <div>
            {s.remainingIQD > 0 && (
              <div className="font-black text-rose-400 text-xs" dir="ltr">
                {formatCurrency(s.remainingIQD, 'IQD')}
              </div>
            )}
            {s.remainingUSD > 0 && (
              <div className="font-black text-amber-400 text-[11px] mt-0.5" dir="ltr">
                + {formatCurrency(s.remainingUSD, 'USD')}
              </div>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-sans font-bold text-[10px] border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مصفى بالكامل</span>
          </span>
        )}
      </td>

      {/* 8. إجراءات المحاسبة */}
      <td className="py-3.5 px-4 text-center align-top">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onPayCarrier(s.carrier)}
            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
            title="تسديد دفعة مالية للناقل من الصندوق"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>تسديد دفعة</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenStatement(s.carrier)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
            title="عرض كشف حساب الناقل التفصيلي"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>كشف حساب</span>
          </button>

          <button
            type="button"
            onClick={() => onEditCarrier(s.carrier)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            title="تعديل بيانات الشركة"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={() => onDeleteCarrier(s.carrier)}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
              title="حذف شركة النقل"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
