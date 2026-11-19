'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TreasuryMovementType, CompanyId, Currency } from '../../../types/customs';
import { CurrencySelect } from '../../ui/currency-select';

export interface TreasuryModalControlsBarProps {
  type: TreasuryMovementType;
  onTypeChange: (type: TreasuryMovementType) => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  companyId: CompanyId | 'shared';
  onCompanyIdChange: (id: CompanyId | 'shared') => void;
}

export const TreasuryModalControlsBar: React.FC<TreasuryModalControlsBarProps> = ({
  type,
  onTypeChange,
  currency,
  onCurrencyChange,
  companyId,
  onCompanyIdChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
      {/* Type Switch */}
      <div className="md:col-span-5 grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => onTypeChange('deposit')}
          className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs cursor-pointer ${
            type === 'deposit'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>إيداع نقدي (وارد +)</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('withdrawal')}
          className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs cursor-pointer ${
            type === 'withdrawal'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>سحب نقدي (صادر -)</span>
        </button>
      </div>

      {/* Currency Selection */}
      <div className="md:col-span-3">
        <CurrencySelect
          value={currency}
          onValueChange={onCurrencyChange}
        />
      </div>

      {/* Target Entity / Company Box */}
      <div className="md:col-span-4 relative flex items-center">
        <select
          value={companyId}
          onChange={(e) => onCompanyIdChange(e.target.value as CompanyId | 'shared')}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:border-cyan-500 focus:outline-none text-xs"
        >
          <option value="shared">🏛️ صندوق مشترك / رأس المال الموحد</option>
          <option value="naqaa_basra">🏢 شركة نقاء البصرة للتخليص</option>
          <option value="sawt_aljanoub">🏢 شركة صوت الجنوب للتخليص</option>
        </select>
      </div>
    </div>
  );
};
