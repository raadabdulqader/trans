import React, { useState, useEffect } from 'react';
import { X, Coins, DollarSign } from 'lucide-react';
import { Transaction, Employee, Currency } from '../../types/customs';
import { formatCurrency, normalizeExchangeRate } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CommissionSection } from '../ui/CommissionSection';
import { CurrencySelect } from '../ui/currency-select';

export interface CommissionPayload {
  hasCommission: boolean;
  commissionAmount: number;
  commissionCurrency: Currency;
  commissionBearer: 'company' | 'party';
}

export interface QuickAdvanceModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  employees: Employee[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onClose: () => void;
  onSave: (
    amount: number,
    employeeId: string,
    date: string,
    notes: string,
    commission?: CommissionPayload,
    advanceCurrency?: Currency,
    customExchangeRate?: number
  ) => void;
}

export const QuickAdvanceModal: React.FC<QuickAdvanceModalProps> = ({
  isOpen,
  transaction,
  employees,
  exchangeRate = 1500,
  onExchangeRateChange,
  onClose,
  onSave,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [customRate, setCustomRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // Commission state
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('USD');
  const [commissionBearer, setCommissionBearer] = useState<'company' | 'party'>('company');

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      setCustomRate(normalizeExchangeRate(exchangeRate, 1500));
    }
  }, [exchangeRate]);

  useEffect(() => {
    if (transaction && isOpen) {
      const txCurr: Currency = transaction.currency === 'USD' ? 'USD' : 'IQD';
      const initRate = normalizeExchangeRate(exchangeRate || transaction.exchangeRate, 1500);
      setEmployeeId(transaction.employeeId || employees[0]?.id || '');
      setCurrency(txCurr);
      setCustomRate(initRate);
      setAmount(txCurr === 'USD' ? 500 : 1000000);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`سلفة مصاريف كمركية وأرضيات للبوليصة ${transaction.billNo}`);
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency(txCurr);
      setCommissionBearer('company');
    }
  }, [transaction, employees, isOpen, exchangeRate]);

  if (!isOpen || !transaction) return null;

  const activeRate = normalizeExchangeRate(customRate, normalizeExchangeRate(exchangeRate, 1500));

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    setCommissionCurrency(newCurr);
    setAmount(newCurr === 'USD' ? 500 : 1000000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || amount <= 0) return;
    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }
    onSave(
      amount,
      employeeId,
      date,
      notes,
      {
        hasCommission,
        commissionAmount: hasCommission ? Number(commissionAmount) : 0,
        commissionCurrency: hasCommission ? commissionCurrency : currency,
        commissionBearer: hasCommission ? commissionBearer : 'company',
      },
      currency,
      activeRate
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>صرف سلفة للمخلص (بوليصة {transaction.billNo})</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Column 1: Currency, Broker, Date */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              {/* Currency Selector via Shadcn Select with RTL */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5 shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>عملة السلفة:</span>
                </span>
                <div className="flex-1 max-w-[200px]">
                  <CurrencySelect
                    value={currency}
                    onValueChange={handleCurrencyChange}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">المخلص المستلم *</label>
                <select
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- اختر المخلص --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">التاريخ</label>
                <DatePicker
                  value={date}
                  onChange={(d) => setDate(d)}
                  placeholder="اختر التاريخ..."
                />
              </div>
            </div>

            {/* Column 2: Amount & Notes */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold text-xs">
                    مبلغ السلفة ({currency === 'USD' ? '$' : 'د.ع'}) *
                  </label>
                  {amount > 0 && (
                    <span className="text-[11px] font-mono font-bold text-amber-400" dir="ltr">
                      {formatCurrency(amount, currency)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val === '' ? 0 : Number(val));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ملاحظات السلفة</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Commission Section */}
          <CommissionSection
            hasCommission={hasCommission}
            onToggle={setHasCommission}
            commissionAmount={commissionAmount}
            onAmountChange={setCommissionAmount}
            commissionCurrency={commissionCurrency}
            onCurrencyChange={setCommissionCurrency}
            commissionBearer={commissionBearer}
            onBearerChange={setCommissionBearer}
            baseAmount={Number(amount) || 0}
            baseCurrency={currency}
            partyLabel="المخلص الكمركي"
            exchangeRate={activeRate}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">إلغاء</button>
            <button type="submit" className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold">صرف السلفة</button>
          </div>
        </form>
      </div>
    </div>
  );
};
