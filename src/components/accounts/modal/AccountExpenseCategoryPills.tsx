import React from 'react';
import { Users, Coffee, Building2 } from 'lucide-react';
import { SubAccountType } from './AccountExpensePresets';

interface AccountExpenseCategoryPillsProps {
  subAccount: SubAccountType;
  onChange: (type: SubAccountType) => void;
}

export const AccountExpenseCategoryPills: React.FC<AccountExpenseCategoryPillsProps> = ({
  subAccount,
  onChange,
}) => {
  return (
    <div className="px-6 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/30 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('salaries')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          subAccount === 'salaries'
            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>رواتب وأجور الكادر</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          subAccount === 'daily'
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Coffee className="w-4 h-4" />
        <span>مصاريف يومية ونثريات</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('rents')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          subAccount === 'rents'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span>إيجارات وعقارات</span>
      </button>
    </div>
  );
};
