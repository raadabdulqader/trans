import React, { useState, useRef } from 'react';
import { Truck, Upload, Eye, Plus, Paperclip, Trash2 } from 'lucide-react';
import { BillTransportTrip, TransportCompany, TreasuryAttachment } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

export interface BillTransportSectionProps {
  billNo: string;
  transportTrips: BillTransportTrip[];
  carriers: TransportCompany[];
  transportDocument?: TreasuryAttachment;
  onTransportDocUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTrip: () => void;
  onUpdateTrip: (tripId: string, patch: Partial<BillTransportTrip>) => void;
  onRemoveTrip: (tripId: string) => void;
  onTripFileUpload: (tripId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onQuickAddCarrier?: (carrier: Omit<TransportCompany, 'id' | 'createdAt'>) => TransportCompany;
  onQuickCarrierCreated?: (created: TransportCompany) => void;
}

export const BillTransportSection: React.FC<BillTransportSectionProps> = ({
  billNo,
  transportTrips,
  carriers,
  transportDocument,
  onTransportDocUpload,
  onAddTrip,
  onUpdateTrip,
  onRemoveTrip,
  onTripFileUpload,
  onViewArchive,
  onQuickAddCarrier,
  onQuickCarrierCreated,
}) => {
  const [showNewCarrierForm, setShowNewCarrierForm] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierPhone, setNewCarrierPhone] = useState('');
  const transportFileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateQuickCarrier = () => {
    if (!newCarrierName.trim() || !onQuickAddCarrier) return;
    const created = onQuickAddCarrier({
      name: newCarrierName.trim(),
      contactPerson: '',
      phone: newCarrierPhone.trim(),
      address: '',
      notes: 'أُضيفت من نافذة البوليصة',
    });
    setNewCarrierName('');
    setNewCarrierPhone('');
    setShowNewCarrierForm(false);
    if (onQuickCarrierCreated) {
      onQuickCarrierCreated(created);
    }
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      <input
        ref={transportFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={onTransportDocUpload}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>نقل البضائع والنواقل البرية (شركات النقل المستقلة)</span>
              {transportTrips.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {transportTrips.length} نقلة · {transportTrips.reduce((s, t) => s + (Number(t.truckCount) || 1), 0)} شاحنة
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              إضافة نقلة أو عدة شاحنات مع تحديد السائق ورقم السيارة والوجهة وأرشفة وصل استلام النقل
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Archive General Transport Document */}
          <button
            type="button"
            onClick={() => transportFileInputRef.current?.click()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              transportDocument
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-slate-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{transportDocument ? '✓ تم أرشفة وصل النقل' : 'أرشفة وصل النقل'}</span>
          </button>

          {transportDocument && onViewArchive && (
            <button
              type="button"
              onClick={() => onViewArchive(transportDocument, `وصل استلام النقل لبوليصة ${billNo}`)}
              className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة</span>
            </button>
          )}

          {onQuickAddCarrier && (
            <button
              type="button"
              onClick={() => setShowNewCarrierForm((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
            >
              + تعريف شركة نقل
            </button>
          )}

          <button
            type="button"
            onClick={onAddTrip}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نقلة / شاحنة</span>
          </button>
        </div>
      </div>

      {/* Inline Quick New Carrier Form */}
      {showNewCarrierForm && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-bold text-amber-300">تعريف شركة نقل جديدة:</span>
          <input
            type="text"
            value={newCarrierName}
            onChange={(e) => setNewCarrierName(e.target.value)}
            placeholder="اسم شركة النقل..."
            className="flex-1 min-w-[180px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
          />
          <input
            type="text"
            value={newCarrierPhone}
            onChange={(e) => setNewCarrierPhone(e.target.value)}
            placeholder="رقم الهاتف..."
            className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCreateQuickCarrier}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            حفظ الشركة
          </button>
          <button
            type="button"
            onClick={() => setShowNewCarrierForm(false)}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Trips List */}
      {transportTrips.length > 0 ? (
        <div className="space-y-3">
          {transportTrips.map((trip, index) => (
            <div
              key={trip.id}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="font-bold text-amber-300 flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-black text-xs">
                    #{index + 1}
                  </div>
                  <span>نقلة رقم {index + 1}</span>
                </span>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{trip.transportDocument ? '✓ وصل النقلة مرفق' : 'أرشفة وصل النقلة'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => onTripFileUpload(trip.id, e)}
                      className="hidden"
                    />
                  </label>

                  {trip.transportDocument && onViewArchive && (
                    <button
                      type="button"
                      onClick={() =>
                        onViewArchive(
                          trip.transportDocument!,
                          `وصل نقلة #${index + 1} - بوليصة ${billNo}`
                        )
                      }
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveTrip(trip.id)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                    title="حذف هذه النقلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* 1. Carrier Company */}
                <div className="lg:col-span-2">
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">شركة النقل المستقلة <span className="text-rose-400">*</span></label>
                  <select
                    value={trip.carrierId}
                    onChange={(e) => onUpdateTrip(trip.id, { carrierId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">-- اختر شركة النقل --</option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white font-bold">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Destination */}
                <div className="lg:col-span-2">
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">وجهة النقل (من ← إلى)</label>
                  <input
                    type="text"
                    value={trip.destination}
                    onChange={(e) => onUpdateTrip(trip.id, { destination: e.target.value })}
                    placeholder="مثال: أم قصر ← بغداد"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 3. Truck Count */}
                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">عدد الشاحنات</label>
                  <input
                    type="number"
                    min="1"
                    value={trip.truckCount || 1}
                    onChange={(e) =>
                      onUpdateTrip(trip.id, { truckCount: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-black text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 4. Currency & Carrier Cost */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-200 font-bold text-xs">أجرة الناقل <span className="text-rose-400">*</span></label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateTrip(trip.id, { currency: 'IQD' })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          trip.currency === 'IQD'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        د.ع
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateTrip(trip.id, { currency: 'USD' })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          trip.currency === 'USD'
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trip.carrierCost || ''}
                    onChange={(e) =>
                      onUpdateTrip(trip.id, { carrierCost: Number(e.target.value) || 0 })
                    }
                    placeholder="أجرة الناقل..."
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-400 font-mono font-black text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 5. Driver Name */}
                <div className="lg:col-span-2">
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">اسم السائق</label>
                  <input
                    type="text"
                    value={trip.driverName}
                    onChange={(e) => onUpdateTrip(trip.id, { driverName: e.target.value })}
                    placeholder="الاسم الثلاثي للسائق..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 6. Truck Plate No */}
                <div className="lg:col-span-2">
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">رقم السيارة / الشاحنة</label>
                  <input
                    type="text"
                    value={trip.truckPlateNo}
                    onChange={(e) => onUpdateTrip(trip.id, { truckPlateNo: e.target.value })}
                    placeholder="مثال: بصرة 44821 حمل"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 7. Driver Phone */}
                <div className="lg:col-span-2">
                  <label className="block text-slate-200 font-bold text-xs mb-1.5">هاتف السائق / ملاحظات النقلة</label>
                  <input
                    type="text"
                    value={trip.driverPhone || ''}
                    onChange={(e) => onUpdateTrip(trip.id, { driverPhone: e.target.value })}
                    placeholder="0770XXXXXXX أو ملاحظات..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total Carrier Costs Summary Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-medium">
              تُسجل هذه الأجور كذمة مستحقة لشركات النقل في حساباتها المستقلة وتُسدد من الصندوق:
            </span>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20" dir="ltr">
                مجموع أجور النقل (د.ع):{' '}
                {formatCurrency(
                  transportTrips
                    .filter((t) => t.currency === 'IQD')
                    .reduce((s, t) => s + (Number(t.carrierCost) || 0), 0),
                  'IQD'
                )}
              </span>
              {transportTrips.some((t) => t.currency === 'USD') && (
                <span className="text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20" dir="ltr">
                  مجموع أجور النقل ($):{' '}
                  {formatCurrency(
                    transportTrips
                      .filter((t) => t.currency === 'USD')
                      .reduce((s, t) => s + (Number(t.carrierCost) || 0), 0),
                    'USD'
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 font-medium">
          لم يتم تسجيل أي نقلات أو شاحنات بعد. إذا كانت البوليصة تتضمن نقلاً برياً، اضغط على زر "إضافة نقلة / شاحنة" أعلاه.
        </div>
      )}
    </div>
  );
};
