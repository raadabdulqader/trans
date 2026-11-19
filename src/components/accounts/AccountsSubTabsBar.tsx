'use client';

import React from 'react';
import { Layers, Users, Coffee, Building2, Truck, Receipt } from 'lucide-react';
import { TreasuryTransaction } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { LedgerSubTab } from './AccountsLedgerTable';
import { getSubAccountType } from './accountHelpers';

export interface AccountsSubTabsBarProps {
  activeSubTab: LedgerSubTab;
  setActiveSubTab: (tab: LedgerSubTab) => void;
  allAccountExpenses: TreasuryTransaction[];
  totalFilteredIQD: number;
  totalFilteredUSD: number;
}

export const AccountsSubTabsBar: React.FC<AccountsSubTabsBarProps> = ({
  activeSubTab,
  setActiveSubTab,
  allAccountExpenses,
  totalFilteredIQD,
  totalFilteredUSD,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>كافة الحسابات (السجل العام)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-300 font-mono text-[10px]">
            {allAccountExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('salaries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'salaries'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>الرواتب والأجور</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 font-mono text-[10px]">
            {allAccountExpenses.filter((t) => getSubAccountType(t) === 'salaries').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'daily'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span>المصاريف اليومية والنثرية</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-950/60 text-amber-300 font-mono text-[10px]">
            {allAccountExpenses.filter((t) => getSubAccountType(t) === 'daily').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('rents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'rents'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>الإيجارات والمرافق</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 font-mono text-[10px]">
            {allAccountExpenses.filter((t) => getSubAccountType(t) === 'rents').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('carriers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'carriers'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>أجور ونواقل النقل البري</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-950/60 text-amber-300 font-mono text-[10px]">
            {allAccountExpenses.filter((t) => getSubAccountType(t) === 'carriers').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('bill_expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'bill_expenses'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-purple-400" />
          <span>مصاريف البوالص الكمركية</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-950/60 text-purple-300 font-mono text-[10px]">
            {allAccountExpenses.filter((t) => getSubAccountType(t) === 'bill_expenses').length}
          </span>
        </button>
      </div>

      {/* Current Tab Total Highlight */}
      <div className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
        <span>إجمالي المعروض:</span>
        <strong className="text-emerald-400 font-mono font-bold" dir="ltr">
          {formatCurrency(totalFilteredIQD, 'IQD')}
        </strong>
        {totalFilteredUSD > 0 && (
          <strong className="text-cyan-400 font-mono font-bold" dir="ltr">
            + {formatCurrency(totalFilteredUSD, 'USD')}
          </strong>
        )}
      </div>
    </div>
  );
};
