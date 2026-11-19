import React from 'react';
import { FileText } from 'lucide-react';
import { Currency, TreasuryMovementType } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';

interface TreasuryAccountingEntryProps {
  amount: number;
  currency: Currency;
  type: TreasuryMovementType;
  hasCommission: boolean;
  commissionAmount: number;
  commissionCurrency: Currency;
  commissionBearer: 'company' | 'party';
  partyName: string;
}

export const TreasuryAccountingEntry: React.FC<TreasuryAccountingEntryProps> = ({
  amount,
  currency,
  type,
  hasCommission,
  commissionAmount,
  commissionCurrency,
  commissionBearer,
  partyName,
}) => {
  if (amount <= 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-3 shadow-md animate-in fade-in duration-150">
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Counterparty Right */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-col justify-between gap-1">
          <span className="text-[11px] text-slate-400 font-medium">حق {type === 'deposit' ? 'المودع' : 'المستلم'}:</span>
          <div className="flex items-baseline justify-between gap-1">
            <strong className="font-mono text-cyan-300 text-sm font-black" dir="ltr">
              {formatCurrency(amount, currency)}
            </strong>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
              كامل غير منقوص
            </span>
          </div>
        </div>

        {/* Commission Details */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-col justify-between gap-1">
          <span className="text-[11px] text-slate-400 font-medium">العمولة المقيدة:</span>
          <div className="flex items-baseline justify-between gap-1">
            <strong className={`font-mono text-sm font-black ${hasCommission && commissionAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`} dir="ltr">
              {hasCommission && commissionAmount > 0 ? formatCurrency(commissionAmount, commissionCurrency) : '0'}
            </strong>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              hasCommission && commissionAmount > 0
                ? commissionBearer === 'company'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                  : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-500'
            }`}>
              {hasCommission && commissionAmount > 0 ? (commissionBearer === 'company' ? 'على الشركة (كمصروف)' : 'على المتعامل') : 'لا توجد عمولة'}
            </span>
          </div>
        </div>

        {/* Cashbox Reflection */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 flex flex-col justify-between gap-1">
          <span className="text-[11px] text-slate-400 font-medium">صافي حركة الصندوق:</span>
          <div className="flex items-baseline justify-between gap-1">
            <strong className={`font-mono text-sm font-black ${type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
              {hasCommission && commissionAmount > 0 && commissionBearer === 'company' && commissionCurrency === currency
                ? type === 'deposit'
                  ? `+${formatCurrency(Math.max(0, amount - commissionAmount), currency)}`
                  : `-${formatCurrency(amount + commissionAmount, currency)}`
                : type === 'deposit'
                ? `+${formatCurrency(amount, currency)}`
                : `-${formatCurrency(amount, currency)}`}
            </strong>
            <span className="text-[9px] text-slate-400 font-medium">
              {hasCommission && commissionAmount > 0 && commissionBearer === 'company' && commissionCurrency === currency
                ? type === 'deposit' ? 'صافي بعد عمولة الشركة' : 'شامل عمولة الشركة'
                : 'صافي الصندوق'}
            </span>
          </div>
        </div>
      </div>

      {/* Professional Double-Entry Accounting Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
        <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>التوجيه المحاسبي الدفتري المعتمد (سند القيد المزدوج):</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {commissionBearer === 'company' && hasCommission && commissionAmount > 0
              ? 'مبدأ عدم المقاصة (العمولة مصروف مستقل)'
              : 'قيد محاسبي مباشر'}
          </span>
        </div>

        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-[10px] text-slate-400 border-b border-slate-800 font-bold">
              <th className="py-1.5 px-3 w-28 text-center">الطرف والمديونية</th>
              <th className="py-1.5 px-3">اسم الحساب الدفتري والبيان</th>
              <th className="py-1.5 px-3 w-32 text-center">مدين (+)</th>
              <th className="py-1.5 px-3 w-32 text-center">دائن (-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-[11px] font-mono">
            {hasCommission && commissionAmount > 0 && commissionBearer === 'company' ? (
              type === 'deposit' ? (
                <>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-emerald-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans text-slate-200">
                      حـ/ الصندوق ({currency}) - صافي النقد الفعلي المقبوض
                    </td>
                    <td className="py-1.5 px-3 text-center text-emerald-400 font-bold" dir="ltr">
                      {commissionCurrency === currency
                        ? formatCurrency(Math.max(0, amount - commissionAmount), currency)
                        : formatCurrency(amount, currency)}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-amber-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans text-amber-300">
                      حـ/ مصاريف عمولات وتحويل ({commissionCurrency}) - عبء مستقل على الشركة
                    </td>
                    <td className="py-1.5 px-3 text-center text-amber-400 font-bold" dir="ltr">
                      {formatCurrency(commissionAmount, commissionCurrency)}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="py-1.5 px-3 text-center text-cyan-400 font-bold">دائـن (إلى)</td>
                    <td className="py-1.5 px-3 font-sans font-bold text-cyan-300">
                      إلى حـ/ {partyName.trim() || 'المودع'} (كامل المبلغ المودع المقيد لحسابه)
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                    <td className="py-1.5 px-3 text-center text-cyan-300 font-bold" dir="ltr">
                      {formatCurrency(amount, currency)}
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-cyan-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans font-bold text-cyan-300">
                      حـ/ {partyName.trim() || 'المستلم'} (كامل المبلغ المطلوب سحبه)
                    </td>
                    <td className="py-1.5 px-3 text-center text-cyan-300 font-bold" dir="ltr">
                      {formatCurrency(amount, currency)}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-amber-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans text-amber-300">
                      حـ/ مصاريف عمولات وتحويل ({commissionCurrency}) - عبء مستقل على الشركة
                    </td>
                    <td className="py-1.5 px-3 text-center text-amber-400 font-bold" dir="ltr">
                      {formatCurrency(commissionAmount, commissionCurrency)}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="py-1.5 px-3 text-center text-rose-400 font-bold">دائـن (إلى)</td>
                    <td className="py-1.5 px-3 font-sans text-slate-200">
                      إلى حـ/ الصندوق ({currency}) - إجمالي النقد المصروف
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                    <td className="py-1.5 px-3 text-center text-rose-400 font-bold" dir="ltr">
                      {commissionCurrency === currency
                        ? formatCurrency(amount + commissionAmount, currency)
                        : `${formatCurrency(amount, currency)} + ${formatCurrency(commissionAmount, commissionCurrency)}`}
                    </td>
                  </tr>
                </>
              )
            ) : (
              type === 'deposit' ? (
                <>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-emerald-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans text-slate-200">حـ/ الصندوق ({currency})</td>
                    <td className="py-1.5 px-3 text-center text-emerald-400 font-bold" dir="ltr">{formatCurrency(amount, currency)}</td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="py-1.5 px-3 text-center text-cyan-400 font-bold">دائـن (إلى)</td>
                    <td className="py-1.5 px-3 font-sans font-bold text-cyan-300">إلى حـ/ {partyName.trim() || 'المودع'}</td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                    <td className="py-1.5 px-3 text-center text-cyan-300 font-bold" dir="ltr">{formatCurrency(amount, currency)}</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-1.5 px-3 text-center text-cyan-400 font-bold">مـديـن (من)</td>
                    <td className="py-1.5 px-3 font-sans font-bold text-cyan-300">حـ/ {partyName.trim() || 'المستلم'}</td>
                    <td className="py-1.5 px-3 text-center text-cyan-300 font-bold" dir="ltr">{formatCurrency(amount, currency)}</td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="py-1.5 px-3 text-center text-rose-400 font-bold">دائـن (إلى)</td>
                    <td className="py-1.5 px-3 font-sans text-slate-200">إلى حـ/ الصندوق ({currency})</td>
                    <td className="py-1.5 px-3 text-center text-slate-600">—</td>
                    <td className="py-1.5 px-3 text-center text-rose-400 font-bold" dir="ltr">{formatCurrency(amount, currency)}</td>
                  </tr>
                </>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
