'use client';

import React from 'react';
import { MapPin, Hourglass } from 'lucide-react';

export interface MilestoneOperationalStripProps {
  jobNumber?: string;
  containerDestination?: string;
  numFreeDays: number;
  deadlineDateStr: string | null;
  containerReturnDate?: string;
  daysRemaining: number | null;
  isOverdue: boolean;
}

export const MilestoneOperationalStrip: React.FC<MilestoneOperationalStripProps> = ({
  jobNumber,
  containerDestination,
  numFreeDays,
  deadlineDateStr,
  containerReturnDate,
  daysRemaining,
  isOverdue,
}) => {
  if (!jobNumber && !containerDestination && numFreeDays <= 0) return null;

  return (
    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-3 flex-wrap">
        {jobNumber && (
          <div className="flex items-center gap-1 font-mono">
            <span className="text-slate-400 text-[10px]">رقم المعاملة:</span>
            <strong className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 text-[11px]">
              {jobNumber}
            </strong>
          </div>
        )}
        {containerDestination && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[10px]">الوجهة:</span>
            <strong className="text-slate-200 text-xs">{containerDestination}</strong>
          </div>
        )}
        {numFreeDays > 0 && (
          <div className="flex items-center gap-1">
            <Hourglass className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-400 text-[10px]">السماح:</span>
            <strong className="text-amber-400 font-mono text-xs">{numFreeDays} يوم</strong>
            {deadlineDateStr && (
              <span className="text-[10px] text-slate-400 font-mono">
                (أقصى موعد: {deadlineDateStr})
              </span>
            )}
          </div>
        )}
      </div>

      {deadlineDateStr && !containerReturnDate && daysRemaining !== null && (
        <div
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border font-mono ${
            isOverdue
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : daysRemaining <= 3
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {isOverdue
            ? `⚠️ متأخر بـ ${Math.abs(daysRemaining)} يوم!`
            : daysRemaining === 0
            ? '⚠️ ينتهي اليوم!'
            : `متبقي ${daysRemaining} يوم`}
        </div>
      )}
    </div>
  );
};
