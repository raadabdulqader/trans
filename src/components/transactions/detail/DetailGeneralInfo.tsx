import React from 'react';
import { 
  Boxes, 
  FileCheck2, 
  Upload, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { Transaction, Customer, Employee, TreasuryAttachment } from '../../../types/customs';
import { Badge } from '../../ui/badge';
import { CUSTOMS_PRESET_NOTES } from '../../../utils/customsNotes';
import { BillMilestonesTimeline } from '../BillMilestonesTimeline';

interface DetailGeneralInfoProps {
  transaction: Transaction;
  customer?: Customer;
  employee?: Employee;
  onAttachAgencyToTransaction?: (tx: Transaction, file: File) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onUpdateOperationalDates?: (tx: Transaction, updates: {
    deliveryOrderDate?: string;
    clearanceDate?: string;
    exitDate?: string;
    containerReturnDate?: string;
  }) => void;
}

export const DetailGeneralInfo: React.FC<DetailGeneralInfoProps> = ({
  transaction,
  customer,
  employee,
  onAttachAgencyToTransaction,
  onViewArchive,
  onUpdateOperationalDates,
}) => {
  const agencyInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-3.5">
      {/* General Information Card (2x2 Grid) */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
            <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">الزبون (الشركة):</span>
            <strong className="text-white text-xs block truncate" title={customer?.name}>{customer?.name || '—'}</strong>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{customer?.phone || '—'}</div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
            <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">المخلص الكمركي المسؤول:</span>
            <strong className="text-white text-xs block truncate" title={employee?.name}>{employee?.name || '—'}</strong>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{employee?.phone || '—'}</div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
            <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">تواريخ المعاملة:</span>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">الإنشاء:</span>
              <strong className="text-emerald-400 font-mono text-[11px]">{transaction.createdAt || transaction.date || '—'}</strong>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between mt-0.5">
              <span className="text-slate-400 text-[10px]">الاستلام:</span>
              <strong className="text-white font-mono text-[11px]">{transaction.date || '—'}</strong>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              نوع البضاعة: <span className="text-slate-200 font-semibold">{transaction.goodsType || 'عامة'}</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-800/70 rounded-lg">
            <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">محددات الشحنة والحاوية:</span>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Job No:</span>
              <strong className="text-cyan-300 font-mono text-[11px]">{transaction.jobNumber || '—'}</strong>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between mt-0.5">
              <span className="text-slate-400 text-[10px]">فترة السماح:</span>
              <strong className="text-amber-400 font-mono text-[11px]">{transaction.freeTimeDays ? `${transaction.freeTimeDays} يوم` : '—'}</strong>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate" title={transaction.containerDestination}>
              الوجهة: <span className="text-slate-200 font-semibold">{transaction.containerDestination || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Milestones Timeline */}
      <BillMilestonesTimeline
        billNo={transaction.billNo}
        jobNumber={transaction.jobNumber}
        deliveryOrderDate={transaction.deliveryOrderDate}
        clearanceDate={transaction.clearanceDate}
        exitDate={transaction.exitDate}
        containerReturnDate={transaction.containerReturnDate}
        containersCount={transaction.containers?.length || 0}
        freeTimeDays={transaction.freeTimeDays}
        containerDestination={transaction.containerDestination}
        onUpdateDates={onUpdateOperationalDates ? (updates) => onUpdateOperationalDates(transaction, updates) : undefined}
      />

      {/* Containers Section */}
      <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>أرقام الحاويات المسجلة ({transaction.containers.length}):</span>
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            {transaction.containerDestination && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                📍 {transaction.containerDestination}
              </span>
            )}
            {transaction.freeTimeDays && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-800 font-mono">
                ⏳ سماح {transaction.freeTimeDays} يوم
              </span>
            )}
          </div>
        </div>

        {transaction.containers.length === 0 ? (
          <div className="py-2.5 px-3 rounded-lg bg-slate-900/50 border border-slate-800/60 text-slate-400 text-center text-[11px]">
            لا توجد حاويات مضافة لهذه البوليصة
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {transaction.containers.map((cont, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono font-bold text-cyan-300 text-xs shadow-xs"
              >
                📦 {cont}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Agency Document Archiving Section */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <input
          ref={agencyInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onAttachAgencyToTransaction) {
              onAttachAgencyToTransaction(transaction, file);
            }
            e.target.value = '';
          }}
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>ورقة الوكالة للبوليصة</span>
              {transaction.agencyDocument ? (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>مؤرشفة</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                  غير مؤرشفة
                </span>
              )}
            </div>
            {transaction.agencyDocument ? (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {transaction.agencyDocument.name} • {(transaction.agencyDocument.size / 1024).toFixed(1)} KB
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 mt-0.5">
                أرشفة ورقة الوكالة للرجوع إليها
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {transaction.agencyDocument && onViewArchive && (
            <button
              type="button"
              onClick={() => onViewArchive(transaction.agencyDocument!, `ورقة الوكالة - بوليصة ${transaction.billNo}`)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1 transition"
            >
              <Eye className="w-3 h-3" />
              <span>معاينة</span>
            </button>
          )}
          {onAttachAgencyToTransaction && (
            <button
              type="button"
              onClick={() => agencyInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center gap-1 transition"
            >
              <Upload className="w-3 h-3" />
              <span>{transaction.agencyDocument ? 'تحديث' : 'أرشفة'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notes & Badges */}
      {transaction.notes && (
        <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-slate-400 font-semibold text-xs">ملاحظات وتوجيهات البوليصة:</span>
            <div className="flex flex-wrap gap-1">
              {CUSTOMS_PRESET_NOTES.filter(
                (p) => transaction.notes.includes(p.fullText) || transaction.notes.includes(p.badgeLabel)
              ).map((p) => (
                <Badge key={p.id} variant={p.variant} className="text-[9px] py-0.2 px-1.5">
                  {p.badgeLabel}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-slate-200 text-xs whitespace-pre-line leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 font-sans">
            {transaction.notes}
          </p>
        </div>
      )}
    </div>
  );
};
