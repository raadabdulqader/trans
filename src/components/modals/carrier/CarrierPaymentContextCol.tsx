'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { CompanyId, Currency, TreasuryAttachment, COMPANIES, BillTransportTrip } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { DatePicker } from '../../ui/date-picker';

export interface CarrierPaymentContextColProps {
  companyId: CompanyId | 'shared';
  onCompanyIdChange: (id: CompanyId | 'shared') => void;
  relatedBillNo: string;
  onRelatedBillNoChange: (billNo: string) => void;
  trips: Array<{ trip: BillTransportTrip; bill: { billNo: string; id: string } }>;
  date: string;
  onDateChange: (d: string) => void;
  amount: number;
  currency: Currency;
  companyCommInCurr: number;
  description: string;
  onDescriptionChange: (desc: string) => void;
  attachment?: TreasuryAttachment;
  onAttachmentChange: (att?: TreasuryAttachment) => void;
}

export const CarrierPaymentContextCol: React.FC<CarrierPaymentContextColProps> = ({
  companyId,
  onCompanyIdChange,
  relatedBillNo,
  onRelatedBillNoChange,
  trips,
  date,
  onDateChange,
  amount,
  currency,
  companyCommInCurr,
  description,
  onDescriptionChange,
  attachment,
  onAttachmentChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAttachmentChange({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">الشركة المسددة</label>
          <select
            value={companyId}
            onChange={(e) => onCompanyIdChange(e.target.value as CompanyId | 'shared')}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="naqaa_basra">{COMPANIES.naqaa_basra.shortName}</option>
            <option value="sawt_aljanoub">{COMPANIES.sawt_aljanoub.shortName}</option>
            <option value="shared">مشترك (الصندوق العام)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">البوليصة المرتبطة</label>
          <select
            value={relatedBillNo}
            onChange={(e) => onRelatedBillNoChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
          >
            <option value="">-- دفعة عامة على الحساب --</option>
            {trips.map(({ trip, bill }) => (
              <option key={trip.id} value={bill.billNo}>
                بوليصة {bill.billNo} ({trip.destination} - {formatCurrency(trip.carrierCost, trip.currency)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">تاريخ التسديد</label>
        <DatePicker value={date} onChange={onDateChange} placeholder="اختر التاريخ..." />
      </div>

      {/* Cashbox Reflection Box */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">إجمالي المنصرف من الصندوق:</span>
          <strong className="font-mono text-rose-400" dir="ltr">
            -{formatCurrency((Number(amount) || 0) + companyCommInCurr, currency)}
          </strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">يُحتسب تسديداً لحساب شركة النقل:</span>
          <strong className="font-mono text-emerald-400" dir="ltr">
            {formatCurrency(Number(amount) || 0, currency)}
          </strong>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-slate-300 font-semibold">بيان وملاحظات سند الصرف</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{attachment ? '✓ تم إرفاق وصل' : 'أرشفة وصل التسديد'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-amber-400 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};
