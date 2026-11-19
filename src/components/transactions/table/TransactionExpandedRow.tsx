'use client';

import React from 'react';
import { Calendar, Clock, HardHat, Ship, Truck, Eye } from 'lucide-react';
import { Transaction, Employee, AppUser, TreasuryAttachment } from '../../../types/customs';

export interface TransactionExpandedRowProps {
  tx: Transaction;
  emp?: Employee;
  currentUser: AppUser;
  onTryChangeStatus: (tx: Transaction, newStatus: Transaction['status']) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
}

export const TransactionExpandedRow: React.FC<TransactionExpandedRowProps> = ({
  tx,
  emp,
  currentUser,
  onTryChangeStatus,
  onViewArchive,
}) => {
  return (
    <tr className="bg-slate-950/60 hover:bg-slate-855/60 transition-colors border-b border-slate-800/80 text-[11px] animate-in fade-in">
      {/* Cell 1: Dates */}
      <td className="pt-1 pb-3 px-4">
        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
            <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-slate-400">إنشاء:</span>
            <span className="font-semibold text-slate-200">{tx.createdAt || tx.date || '—'}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-400">استلام:</span>
            <span className="text-slate-300">{tx.date || '—'}</span>
          </div>
        </div>
      </td>

      {/* Cell 2: Employee */}
      <td className="pt-1 pb-3 px-4">
        <div className="flex items-center gap-1.5 text-slate-300">
          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">{emp?.name || 'غير محدد'}</span>
        </div>
        {emp?.phone && (
          <div className="text-[10px] text-slate-500 font-mono mt-0.5" dir="ltr">
            {emp.phone}
          </div>
        )}
      </td>

      {/* Cell 3 & 4: Containers & Transport */}
      <td colSpan={2} className="pt-1 pb-3 px-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-lg font-bold text-[10px] shrink-0">
            <Ship className="w-3 h-3" />
            <span>{tx.containers.length} حاويات</span>
          </div>
          {tx.containerDestination && (
            <div
              className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 text-cyan-300 px-2 py-0.5 rounded-lg text-[10px] shrink-0 font-medium"
              title={`وجهة الحاوية: ${tx.containerDestination}`}
            >
              <span>📍</span>
              <span>{tx.containerDestination}</span>
            </div>
          )}
          {tx.containers.length > 0 ? (
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {tx.containers.slice(0, 4).map((cnt, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-slate-900 border border-slate-700/80 rounded text-slate-300"
                >
                  {cnt}
                </span>
              ))}
              {tx.containers.length > 4 && (
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-semibold">
                  +{tx.containers.length - 4} أخرى
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 font-normal">لا توجد أرقام حاويات</span>
          )}

          {tx.transportTrips && tx.transportTrips.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold text-[10px] shrink-0">
              <Truck className="w-3 h-3" />
              <span>
                نقل بري: {tx.transportTrips.reduce((s, t) => s + (Number(t.truckCount) || 1), 0)} شاحنة
              </span>
            </div>
          )}

          {(tx.transportDocument || tx.transportTrips?.some((t) => t.transportDocument)) && onViewArchive && (
            <button
              type="button"
              onClick={() => {
                const doc =
                  tx.transportDocument ||
                  tx.transportTrips?.find((t) => t.transportDocument)?.transportDocument;
                if (doc) onViewArchive(doc, `وصل استلام النقل - بوليصة ${tx.billNo}`);
              }}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-lg font-bold text-[10px] transition cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>وصل النقل</span>
            </button>
          )}
        </div>
      </td>

      {/* Cell 5 & 6: Status & Notes */}
      <td colSpan={2} className="pt-1 pb-3 px-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium">الحالة:</span>
            <select
              value={tx.status}
              disabled={!currentUser.permissions.editTx}
              onChange={(e) => onTryChangeStatus(tx, e.target.value as any)}
              className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                tx.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : tx.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : tx.status === 'cancelled'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <option value="pending" className="bg-slate-900 text-amber-400">
                ⏳ قيد التنفيذ
              </option>
              <option value="completed" className="bg-slate-900 text-emerald-400">
                ✅ منجزة
              </option>
              <option value="issue" className="bg-slate-900 text-rose-400">
                ⚠️ معلقة
              </option>
              <option value="cancelled" className="bg-slate-900 text-rose-300">
                ❌ ملغاة دفترياً
              </option>
            </select>
          </div>

          {tx.status === 'cancelled' && tx.cancelReason ? (
            <div className="text-[10px] text-rose-400 truncate max-w-[200px]" title={tx.cancelReason}>
              ⚠️ سبب الإلغاء: {tx.cancelReason}
            </div>
          ) : tx.notes ? (
            <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={tx.notes}>
              💬 {tx.notes}
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
};
