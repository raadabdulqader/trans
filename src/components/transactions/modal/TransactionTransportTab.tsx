import React from 'react';
import { AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { BillTransportTrip, TransportCompany, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { ContainersEditor } from '../ContainersEditor';
import { BillTransportSection } from '../BillTransportSection';

export interface TransactionTransportTabProps {
  jobNumber: string;
  containerDestination: string;
  freeTimeDays: number | '';
  containers: string[];
  setContainers: React.Dispatch<React.SetStateAction<string[]>>;
  hasPaidCarriersOnBill: boolean;
  hasTransport: boolean;
  transportTrips: BillTransportTrip[];
  carrierPaidIQDOnBill: number;
  carrierPaidUSDOnBill: number;
  billNo: string;
  carriers: TransportCompany[];
  transportDocument?: TreasuryAttachment;
  handleTransportDocUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddTransportTrip: () => void;
  handleUpdateTrip: (tripId: string, patch: Partial<BillTransportTrip>) => void;
  handleRemoveTrip: (tripId: string) => void;
  handleTripFileUpload: (tripId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuickAddCarrier?: (carrier: Omit<TransportCompany, 'id' | 'createdAt'>) => TransportCompany;
  handleQuickCarrierCreated: (carrier: TransportCompany) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onEditDestination: () => void;
}

export const TransactionTransportTab: React.FC<TransactionTransportTabProps> = ({
  jobNumber,
  containerDestination,
  freeTimeDays,
  containers,
  setContainers,
  hasPaidCarriersOnBill,
  hasTransport,
  transportTrips,
  carrierPaidIQDOnBill,
  carrierPaidUSDOnBill,
  billNo,
  carriers,
  transportDocument,
  handleTransportDocUpload,
  handleAddTransportTrip,
  handleUpdateTrip,
  handleRemoveTrip,
  handleTripFileUpload,
  onQuickAddCarrier,
  handleQuickCarrierCreated,
  onViewArchive,
  onPrev,
  onNext,
  onEditDestination,
}) => {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-200 text-xs">
      {/* ملخص محددات الحاوية وفترة السماح */}
      <div className="p-2 sm:p-2.5 bg-slate-900 rounded-xl border border-slate-755 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-sm">
            📦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">محددات الحاوية والوجهة</span>
              {jobNumber && (
                <span className="px-2 py-0.2 rounded font-mono text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                  Job: {jobNumber}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>الوجهة: <strong className="text-white font-bold bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">{containerDestination || 'غير محددة'}</strong></span>
              <span className="text-slate-600">•</span>
              <span>فترة السماح: <strong className="text-amber-300 font-mono font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">{freeTimeDays ? `${freeTimeDays} يوم` : 'غير محددة'}</strong></span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditDestination}
          className="h-7 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700 transition cursor-pointer"
        >
          تعديل الوجهة ✎
        </button>
      </div>

      {/* 1. محرر الحاويات */}
      <ContainersEditor
        containers={containers}
        setContainers={setContainers}
      />

      {/* 2. Notice if transport is cleared while payments exist */}
      {hasPaidCarriersOnBill && (!hasTransport || transportTrips.length === 0) && (
        <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-amber-300 text-xs">
              تنبيه محاسبي: استرداد أجور النقل إلى الصندوق
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              توجد دفعات أجور نقل مسددة للنواقل سابقاً بقيمة{' '}
              <strong className="text-emerald-400 font-mono font-bold">
                {carrierPaidIQDOnBill > 0 ? formatCurrency(carrierPaidIQDOnBill, 'IQD') : ''}
                {carrierPaidUSDOnBill > 0 ? `${carrierPaidIQDOnBill > 0 ? ' + ' : ''}${formatCurrency(carrierPaidUSDOnBill, 'USD')}` : ''}
              </strong>.
              عند الحفظ سيتم إلغاء سندات الصرف تلقائياً وإعادة المبالغ للصندوق.
            </div>
          </div>
        </div>
      )}

      {/* 3. الشحن والنقل البري */}
      <BillTransportSection
        billNo={billNo}
        transportTrips={transportTrips}
        carriers={carriers}
        transportDocument={transportDocument}
        onTransportDocUpload={handleTransportDocUpload}
        onAddTrip={handleAddTransportTrip}
        onUpdateTrip={handleUpdateTrip}
        onRemoveTrip={handleRemoveTrip}
        onTripFileUpload={handleTripFileUpload}
        onQuickAddCarrier={onQuickAddCarrier}
        onQuickCarrierCreated={handleQuickCarrierCreated}
        onViewArchive={onViewArchive}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onPrev}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى الإنفاق</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
        >
          <span>المتابعة إلى الوكالة والملاحظات</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
