import React, { useRef } from 'react';
import { Building, User, DollarSign, Coins } from 'lucide-react';
import { Currency } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface CommissionSectionProps {
  hasCommission: boolean;
  onToggle: (checked: boolean) => void;
  commissionAmount: number;
  onAmountChange: (amount: number) => void;
  commissionCurrency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  commissionBearer: 'company' | 'party';
  onBearerChange: (bearer: 'company' | 'party') => void;
  baseAmount?: number;
  baseCurrency?: Currency;
  partyLabel?: string; // 'الزبون' or 'المخلص' or 'الطرف الآخر'
  exchangeRate?: number;
}

export const CommissionSection: React.FC<CommissionSectionProps> = ({
  hasCommission,
  onToggle,
  commissionAmount,
  onAmountChange,
  commissionCurrency,
  onCurrencyChange,
  commissionBearer,
  onBearerChange,
  partyLabel = 'الطرف الآخر',
  baseCurrency,
}) => {
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      onAmountChange(0);
    } else {
      if (baseCurrency) {
        onCurrencyChange(baseCurrency);
      }
      setTimeout(() => {
        amountInputRef.current?.focus();
        amountInputRef.current?.select();
      }, 50);
    }
  };

  return (
    <div className={`rounded-xl border transition px-3 py-2 ${
      hasCommission
        ? 'border-amber-500/40 bg-slate-950/90 shadow-xs'
        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
    }`}>
      {!hasCommission ? (
        /* Unchecked State: Single clickable bar */
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none flex-1 py-0.5">
            <input
              type="checkbox"
              checked={hasCommission}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة مبلغ عمولة تحويل / صرافة (تحديد يدوي)</span>
            </span>
          </label>
          <button
            type="button"
            onClick={() => handleCheckboxChange(true)}
            className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-bold transition"
          >
            + تحديد مبلغ العمولة أو الصرافة
          </button>
        </div>
      ) : (
        /* Checked State: Unified Single-Bar Manual Entry (No auto-subtraction, 100% user-defined) */
        <div className="flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
          {/* 1. Checkbox & Title */}
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={hasCommission}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer"
            />
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>مبلغ العمولة / الصرافة:</span>
            </span>
          </label>

          {/* 2. Manual Commission / Exchange Amount Input */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
            <div className="relative flex-1">
              <input
                ref={amountInputRef}
                type="number"
                min="0"
                step="any"
                value={commissionAmount === 0 ? '' : commissionAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  onAmountChange(val === '' ? 0 : Number(val));
                }}
                placeholder="أدخل المبلغ يدوياً..."
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300 placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              />
              {commissionAmount > 0 && (
                <span
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-amber-400/90 pointer-events-none hidden sm:inline"
                  dir="ltr"
                >
                  {formatCurrency(commissionAmount, commissionCurrency)}
                </span>
              )}
            </div>
          </div>

          {/* 3. Currency Selector (USD / IQD) via Shadcn Select with RTL */}
          <div className="w-[115px] shrink-0">
            <Select
              value={commissionCurrency}
              onValueChange={(val) => onCurrencyChange(val as Currency)}
              dir="rtl"
            >
              <SelectTrigger className="h-8 text-[11px] px-2 py-0.5 font-bold bg-slate-900 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl" className="min-w-[130px]">
                <SelectItem value="IQD">
                  <span className="font-bold text-emerald-400">🇮🇶 دينار (IQD)</span>
                </SelectItem>
                <SelectItem value="USD">
                  <span className="font-bold text-cyan-400">🇺🇸 دولار ($)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Bearer Selector (Company vs Party) */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onBearerChange('company')}
              title="تتحمل الشركة العمولة كمصروف مستقل دون إنقاص حق الطرف الآخر، وتظهر بالمعاملة وبالقيد المحاسبي"
              className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                commissionBearer === 'company'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-2.5 h-2.5 shrink-0" />
              <span>على الشركة</span>
            </button>
            <button
              type="button"
              onClick={() => onBearerChange('party')}
              title={`يتحملها ${partyLabel} ولا تؤثر على الحوالة أو الصندوق`}
              className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                commissionBearer === 'party'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-2.5 h-2.5 shrink-0" />
              <span>على {partyLabel}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

