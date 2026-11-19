'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export interface MilestoneItem {
  id: string;
  stepNum: number;
  title: string;
  code: string;
  date?: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  color: string;
}

export interface MilestoneCardsGridProps {
  milestones: MilestoneItem[];
}

export const MilestoneCardsGrid: React.FC<MilestoneCardsGridProps> = ({ milestones }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {milestones.map((m) => {
        const Icon = m.icon;
        const isDone = !!m.date;

        return (
          <div
            key={m.id}
            className={`p-2 rounded-xl border transition-all flex flex-col justify-between ${
              isDone
                ? 'bg-slate-900/90 border-slate-750 shadow-xs'
                : 'bg-slate-950/40 border-slate-850 border-dashed opacity-80'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-xs text-white truncate">
                    {m.stepNum}. {m.title}
                  </span>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>

              <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
            </div>

            <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">التاريخ:</span>
              {isDone ? (
                <span
                  className="font-mono font-bold text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                  dir="ltr"
                >
                  {m.date}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 italic">لم يُحدد بعد</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
