import React from 'react';
import { Users, Coffee, Building2, Truck, Receipt } from 'lucide-react';
import { TreasuryTransaction } from '../../types/customs';
import { ExtendedSubAccountType } from './AccountsLedgerTable';

export const getSubAccountType = (tx: TreasuryTransaction): ExtendedSubAccountType => {
  if (tx.subAccount === 'bill_expenses' || (tx.relatedBillNo && !tx.carrierId && tx.subAccount !== 'carriers')) {
    return 'bill_expenses';
  }
  if (tx.subAccount === 'carriers' || tx.carrierId) return 'carriers';
  if (tx.subAccount) return tx.subAccount as ExtendedSubAccountType;
  const cat = (tx.category || '').toLowerCase();
  const desc = (tx.description || '').toLowerCase();

  if (cat.includes('نقل') || cat.includes('ناقل') || cat.includes('شاحن') || desc.includes('نقل')) {
    return 'carriers';
  }
  if (cat.includes('رواتب') || cat.includes('راتب') || cat.includes('أجور') || cat.includes('مكافأة') || desc.includes('راتب')) {
    return 'salaries';
  }
  if (cat.includes('إيجار') || cat.includes('ايجار') || cat.includes('مستودع') || cat.includes('عقار') || desc.includes('إيجار') || desc.includes('ايجار')) {
    return 'rents';
  }
  if (cat.includes('مصاريف') || cat.includes('يومية') || cat.includes('نثرية') || cat.includes('ضيافة') || cat.includes('وقود') || cat.includes('صيانة') || cat.includes('قرطاسية')) {
    return 'daily';
  }
  return 'daily';
};

export const getSubAccountBadge = (type: ExtendedSubAccountType) => {
  switch (type) {
    case 'salaries':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
          <Users className="w-3 h-3" />
          <span>رواتب وأجور</span>
        </span>
      );
    case 'daily':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
          <Coffee className="w-3 h-3" />
          <span>مصاريف يومية</span>
        </span>
      );
    case 'rents':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[11px]">
          <Building2 className="w-3 h-3" />
          <span>إيجارات ومرافق</span>
        </span>
      );
    case 'carriers':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
          <Truck className="w-3 h-3" />
          <span>أجور ونواقل النقل البري</span>
        </span>
      );
    case 'bill_expenses':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold text-[11px]">
          <Receipt className="w-3 h-3" />
          <span>مصاريف بوالص كمركية</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
          <span>مصروف عام</span>
        </span>
      );
  }
};
