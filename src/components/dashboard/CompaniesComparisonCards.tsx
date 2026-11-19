import React from 'react';
import { COMPANIES } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

interface CompaniesComparisonCardsProps {
  naqaaCount: number;
  naqaaRevIQD: number;
  naqaaColIQD: number;
  naqaaRemIQD: number;
  naqaaRevUSD: number;
  naqaaColUSD: number;
  naqaaRemUSD: number;
  sawtCount: number;
  sawtRevIQD: number;
  sawtColIQD: number;
  sawtRemIQD: number;
  sawtRevUSD: number;
  sawtColUSD: number;
  sawtRemUSD: number;
}

export const CompaniesComparisonCards: React.FC<CompaniesComparisonCardsProps> = ({
  naqaaCount,
  naqaaRevIQD,
  naqaaColIQD,
  naqaaRemIQD,
  naqaaRevUSD,
  naqaaColUSD,
  naqaaRemUSD,
  sawtCount,
  sawtRevIQD,
  sawtColIQD,
  sawtRemIQD,
  sawtRevUSD,
  sawtColUSD,
  sawtRemUSD,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Naqaa Basra Card */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base">
              🌿
            </span>
            <div>
              <h4 className="font-bold text-sm text-white">{COMPANIES.naqaa_basra.name}</h4>
              <span className="text-[10px] text-emerald-400">{COMPANIES.naqaa_basra.slogan}</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs font-mono">
            {naqaaCount} بوليصة نشطة
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">إجمالي الفواتير</span>
            <span className="font-mono font-bold text-slate-200 block" dir="ltr">{formatCurrency(naqaaRevIQD, 'IQD')}</span>
            {naqaaRevUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaRevUSD, 'USD')}</span>}
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">المحصل للصندوق</span>
            <span className="font-mono font-bold text-emerald-400 block" dir="ltr">{formatCurrency(naqaaColIQD, 'IQD')}</span>
            {naqaaColUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaColUSD, 'USD')}</span>}
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">المتبقي بذمة الزبائن</span>
            <span className="font-mono font-bold text-amber-400 block" dir="ltr">{formatCurrency(naqaaRemIQD, 'IQD')}</span>
            {naqaaRemUSD > 0 && <span className="font-mono font-bold text-amber-300 text-[11px] block" dir="ltr">+ {formatCurrency(naqaaRemUSD, 'USD')}</span>}
          </div>
        </div>
      </div>

      {/* Sawt Al-Janoub Card */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-base">
              ⚓
            </span>
            <div>
              <h4 className="font-bold text-sm text-white">{COMPANIES.sawt_aljanoub.name}</h4>
              <span className="text-[10px] text-cyan-400">{COMPANIES.sawt_aljanoub.slogan}</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs font-mono">
            {sawtCount} بوليصة نشطة
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">إجمالي الفواتير</span>
            <span className="font-mono font-bold text-slate-200 block" dir="ltr">{formatCurrency(sawtRevIQD, 'IQD')}</span>
            {sawtRevUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(sawtRevUSD, 'USD')}</span>}
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">المحصل للصندوق</span>
            <span className="font-mono font-bold text-emerald-400 block" dir="ltr">{formatCurrency(sawtColIQD, 'IQD')}</span>
            {sawtColUSD > 0 && <span className="font-mono font-bold text-cyan-400 text-[11px] block" dir="ltr">+ {formatCurrency(sawtColUSD, 'USD')}</span>}
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">المتبقي بذمة الزبائن</span>
            <span className="font-mono font-bold text-amber-400 block" dir="ltr">{formatCurrency(sawtRemIQD, 'IQD')}</span>
            {sawtRemUSD > 0 && <span className="font-mono font-bold text-amber-300 text-[11px] block" dir="ltr">+ {formatCurrency(sawtRemUSD, 'USD')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
