import React from 'react';
import { 
  FileText, 
  ChevronDown, 
  Calendar, 
  Clock, 
  HardHat, 
  Ship, 
  Truck, 
  Eye, 
  FileCheck2 
} from 'lucide-react';
import { Transaction, Employee, AppUser, TreasuryAttachment } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

interface TransactionRowPopoverProps {
  tx: Transaction;
  comp: {
    shortName: string;
    badgeColor: string;
  };
  emp?: Employee;
  fin: {
    totalCarrierCost?: number;
  };
  currentUser: AppUser;
  onTryChangeStatus: (tx: Transaction, newStatus: Transaction['status']) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
}

export const TransactionRowPopover: React.FC<TransactionRowPopoverProps> = ({
  tx,
  comp,
  emp,
  fin,
  currentUser,
  onTryChangeStatus,
  onViewArchive,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-750 hover:border-emerald-500/50 font-mono font-black text-sm transition cursor-pointer shadow-xs group select-none"
          title="انقر لعرض كافة معلومات ومراحل البوليصة"
        >
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{tx.billNo}</span>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        alignOffset={-16}
        side="bottom"
        sideOffset={8}
        className="w-[95vw] md:w-[860px] lg:w-[910px] xl:w-[920px] max-w-[95vw] p-3 sm:p-3.5 bg-slate-900 border border-slate-750 shadow-2xl rounded-2xl text-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        {/* 1. Header: Company + Bill No + Job No + Operational Status */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border shrink-0 ${comp.badgeColor}`}>
              {comp.shortName}
            </span>
            <span className="font-mono font-black text-sm text-emerald-400">
              {tx.billNo}
            </span>
            {tx.jobNumber && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                Job: {tx.jobNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">الحالة التشغيلية:</span>
              <select
                value={tx.status}
                disabled={!currentUser.permissions.editTx}
                onChange={(e) => onTryChangeStatus(tx, e.target.value as any)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition cursor-pointer ${
                  tx.status === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : tx.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : tx.status === 'cancelled'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                <option value="pending" className="bg-slate-900 text-amber-400">⏳ قيد التنفيذ</option>
                <option value="completed" className="bg-slate-900 text-emerald-400">✅ منجزة</option>
                <option value="issue" className="bg-slate-900 text-rose-400">⚠️ معلقة</option>
                <option value="cancelled" className="bg-slate-900 text-rose-300">❌ ملغاة دفترياً</option>
              </select>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              معلومات الشحنة والفاتورة
            </span>
          </div>
        </div>

        {/* 2. Body - 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 items-stretch">
          {/* Column 1: Goods, Dates, Broker, Containers */}
          <div className="space-y-2 flex flex-col justify-between">
            {/* Goods Type and Dates Card */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <span>📦</span>
                  <span>نوع البضاعة والوصف:</span>
                </span>
                <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs truncate max-w-[170px]" title={tx.goodsType || 'بضاعة عامة'}>
                  {tx.goodsType || 'بضاعة عامة'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>إنشاء: <strong className="text-slate-200">{tx.createdAt || tx.date || '—'}</strong></span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>استلام: <strong className="text-slate-200">{tx.date || '—'}</strong></span>
                </span>
              </div>
            </div>

            {/* Broker & Containers & Destination Card */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>المخلص المسؤول:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{emp?.name || 'غير محدد'}</span>
                  {emp?.phone && <span className="text-[10px] text-slate-400 font-mono" dir="ltr">({emp.phone})</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-bold text-[11px]">{tx.containers.length} حاويات</span>
                  {tx.containerDestination && (
                    <span className="text-cyan-300 bg-cyan-950/40 px-2 py-0.2 rounded border border-cyan-800/60 text-[10px] font-bold">
                      📍 {tx.containerDestination}
                    </span>
                  )}
                </div>
                {tx.containers.length > 0 && (
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {tx.containers.slice(0, 3).map((cnt, i) => (
                      <span key={i} className="px-1.5 py-0.2 bg-slate-900 border border-slate-700/80 rounded text-slate-300">
                        {cnt}
                      </span>
                    ))}
                    {tx.containers.length > 3 && (
                      <span className="px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                        +{tx.containers.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Operational Milestones Timeline */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="text-[11px] text-slate-300 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-200">
                <span>⏱️</span>
                <span>المراحل والتواريخ التشغيلية:</span>
              </span>
              {tx.freeTimeDays && (
                <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  ⏳ فترة السماح: {tx.freeTimeDays} يوم
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.deliveryOrderDate ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                  <span>📄</span>
                  <span>أمر التسليم:</span>
                </span>
                <span className="font-bold text-slate-200">{tx.deliveryOrderDate || 'غير محدد'}</span>
              </div>

              <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.clearanceDate ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                  <span>🏛️</span>
                  <span>التخليص الكمركي:</span>
                </span>
                <span className="font-bold text-slate-200">{tx.clearanceDate || 'غير محدد'}</span>
              </div>

              <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.exitDate ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                  <span>🚛</span>
                  <span>خروج الشحنة:</span>
                </span>
                <span className="font-bold text-slate-200">{tx.exitDate || 'غير محدد'}</span>
              </div>

              <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${tx.containerReturnDate ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
                <span className="text-[10px] font-sans font-bold flex items-center gap-1">
                  <span>🔄</span>
                  <span>إعادة الحاوية:</span>
                </span>
                <span className="font-bold text-slate-200">{tx.containerReturnDate || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Transport Costs, Notes, Agency */}
          <div className="space-y-2 flex flex-col justify-between">
            {/* Carrier Costs Card */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-black text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>أجور نقل البضائع والشاحنات:</span>
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40" dir="ltr">
                  {(fin.totalCarrierCost || 0) > 0 ? formatCurrency(fin.totalCarrierCost || 0, tx.currency || 'IQD') : '0 (لا توجد أجور نقل)'}
                </span>
              </div>

              {tx.transportTrips && tx.transportTrips.length > 0 ? (
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-amber-500/20">
                  <span>عدد الشاحنات: <strong className="text-white font-mono">{tx.transportTrips.reduce((s, t) => s + (Number(t.truckCount) || 1), 0)} شاحنة</strong> ({tx.transportTrips.length} نقلة)</span>
                  {(tx.transportDocument || tx.transportTrips?.some(t => t.transportDocument)) && onViewArchive && (
                    <button
                      type="button"
                      onClick={() => {
                        const doc = tx.transportDocument || tx.transportTrips?.find(t => t.transportDocument)?.transportDocument;
                        if (doc) onViewArchive(doc, `وصل استلام النقل - بوليصة ${tx.billNo}`);
                      }}
                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>معاينة وصل النقل</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400">لا توجد نقلات أو شاحنات برية مسجلة لهذه البوليصة.</div>
              )}
            </div>

            {/* Notes and Agency Doc Card */}
            {(tx.notes || tx.agencyDocument || tx.cancelReason) ? (
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-[11px]">
                {tx.status === 'cancelled' && tx.cancelReason && (
                  <div className="text-rose-400 font-bold">
                    ⚠️ سبب الإلغاء: {tx.cancelReason}
                  </div>
                )}
                {tx.notes && (
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-bold block mb-0.5">💬 ملاحظات وتوجيهات:</span>
                    <p className="line-clamp-2 text-slate-200">{tx.notes}</p>
                  </div>
                )}
                {tx.agencyDocument && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-indigo-300 font-bold flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>ورقة الوكالة الرسمية مؤرشفة</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewArchive && onViewArchive(tx.agencyDocument!, `ورقة الوكالة - بوليصة ${tx.billNo}`)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-500/40 cursor-pointer"
                    >
                      معاينة الوكالة
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>💬</span>
                <span>لا توجد ملاحظات أو توجيهات مسجلة</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
