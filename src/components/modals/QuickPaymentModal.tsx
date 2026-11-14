import React, { useState, useEffect } from 'react';
import { X, Wallet, DollarSign, RefreshCw } from 'lucide-react';
import { Transaction, Receipt, Currency } from '../../types/customs';
import { formatCurrency, getBillFinancials, getReceiptBreakdownForBill, normalizeExchangeRate } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CommissionSection } from '../ui/CommissionSection';
import { CommissionPayload } from './QuickAdvanceModal';

export interface QuickPaymentModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  receipts: Receipt[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onClose: () => void;
  onSave: (
    amount: number,
    date: string,
    notes: string,
    commission?: CommissionPayload,
    paymentCurrency?: Currency,
    customExchangeRate?: number
  ) => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  transaction,
  receipts,
  exchangeRate = 1500,
  onExchangeRateChange,
  onClose,
  onSave,
}) => {
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [customRate, setCustomRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [isAutoRemaining, setIsAutoRemaining] = useState<boolean>(true);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Commission state
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('USD');
  const [commissionBearer, setCommissionBearer] = useState<'company' | 'party'>('company');

  const billCurr: Currency = transaction?.currency === 'USD' ? 'USD' : 'IQD';
  const activeRate = normalizeExchangeRate(customRate, normalizeExchangeRate(exchangeRate, 1500));
  const fin = transaction ? getBillFinancials(transaction, receipts, activeRate) : null;

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setCustomRate(prev => {
        if (prev > 0 && normalizeExchangeRate(prev, 1500) === normalizedProp) {
          return prev;
        }
        return normalizedProp;
      });
    }
  }, [exchangeRate]);

  useEffect(() => {
    if (transaction && isOpen) {
      const initCurr: Currency = transaction.currency === 'USD' ? 'USD' : 'IQD';
      const initRate = normalizeExchangeRate(exchangeRate || transaction.exchangeRate, 1500);
      const currentFin = getBillFinancials(transaction, receipts, initRate);
      setCurrency(initCurr);
      setCustomRate(initRate);
      setIsAutoRemaining(true);
      setAmount(currentFin.remainingAmount > 0 ? currentFin.remainingAmount : 0);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`دفعة سداد حساب بوليصة ${transaction.billNo}`);
      setErrorMsg('');
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency(initCurr);
      setCommissionBearer('company');
    }
  }, [transaction, isOpen, exchangeRate]);

  if (!isOpen || !transaction || !fin) return null;

  const previewBreakdown = getReceiptBreakdownForBill(
    {
      id: 'preview',
      receiptNo: 'PREVIEW',
      type: 'payment',
      billId: transaction.id,
      amount: Number(amount) || 0,
      currency,
      exchangeRate: activeRate,
      hasCommission,
      commissionAmount: hasCommission ? Number(commissionAmount) || 0 : 0,
      commissionCurrency,
      commissionBearer,
      date,
      notes,
      createdAt: date,
    },
    billCurr,
    activeRate
  );

  const isOverRemaining = previewBreakdown.netCreditInBillCurrency > fin.remainingAmount + 0.05;
  const isFullyPaid = fin.remainingAmount <= 0;
  const newRemainingOnBill = Math.max(0, Math.round((fin.remainingAmount - previewBreakdown.netCreditInBillCurrency) * 100) / 100);

  const companyCommissionInPaymentCurr =
    hasCommission && commissionBearer === 'company' && commissionAmount > 0
      ? commissionCurrency === currency
        ? commissionAmount
        : commissionCurrency === 'USD' && currency === 'IQD'
        ? Math.round(commissionAmount * activeRate)
        : Math.round((commissionAmount / activeRate) * 100) / 100
      : 0;
  const netCashboxAmount = Math.max(0, (Number(amount) || 0) - companyCommissionInPaymentCurr);

  const computeRemainingInCurrency = (targetCurr: Currency, rateToUse: number, remainingInBillCurr: number) => {
    const safeRate = normalizeExchangeRate(rateToUse, 1500);
    if (remainingInBillCurr <= 0) return 0;
    if (targetCurr === billCurr) return remainingInBillCurr;
    if (billCurr === 'USD' && targetCurr === 'IQD') {
      return Math.round(remainingInBillCurr * safeRate);
    }
    return Math.round((remainingInBillCurr / safeRate) * 100) / 100;
  };

  const handleCurrencySwitch = (newCurr: Currency) => {
    if (newCurr === currency) return;
    setCurrency(newCurr);
    setCommissionCurrency(newCurr);
    setErrorMsg('');
    if (fin.remainingAmount > 0) {
      setIsAutoRemaining(true);
      setAmount(computeRemainingInCurrency(newCurr, activeRate, fin.remainingAmount));
    }
  };

  const handleRateChange = (rawVal: string) => {
    const rawNum = rawVal === '' ? 0 : Number(rawVal);
    setCustomRate(rawNum);
    setErrorMsg('');
    if (rawNum >= 100) {
      const normalized = normalizeExchangeRate(rawNum, 1500);
      if (fin.remainingAmount > 0 && currency !== billCurr && isAutoRemaining) {
        setAmount(computeRemainingInCurrency(currency, normalized, fin.remainingAmount));
      }
      if (onExchangeRateChange) {
        onExchangeRateChange(normalized, true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (amount <= 0) return;
    if (previewBreakdown.netCreditInBillCurrency > fin.remainingAmount + 0.05) {
      setErrorMsg(
        `لا يجوز أن يكون الصافي المسدد للبوليصة (${formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurr)}) أكبر من المتبقي المستحق (${formatCurrency(fin.remainingAmount, billCurr)})`
      );
      return;
    }
    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }
    onSave(
      amount,
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>تسجيل دفعة من الزبون (بوليصة {transaction.billNo})</span>
            </h2>
            {transaction.goodsType && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                {transaction.goodsType}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {isFullyPaid ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-center font-bold">
              ✅ هذه البوليصة مسددة بالكامل (خالصة)، ولا يوجد متبقي مستحق للقبض.
            </div>
          ) : (
            <>
              {/* 2-Column Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Right Column: Payment Currency, Amount & Exchange Rate */}
                <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">المتبقي على البوليصة حالياً:</span>
                    <span className={`font-mono font-bold text-sm ${fin.remainingAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                      {formatCurrency(fin.remainingAmount, billCurr)}
                    </span>
                  </div>

                  {/* Currency Selector */}
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1 shrink-0">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>عملة الدفعة:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 flex-1">
                      <button
                        type="button"
                        onClick={() => handleCurrencySwitch('IQD')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
                          currency === 'IQD'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🇮🇶 دينار (IQD)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCurrencySwitch('USD')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
                          currency === 'USD'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🇺🇸 دولار ($)
                      </button>
                    </div>
                  </div>

                  {/* Payment Amount Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold text-xs">
                        مبلغ الدفعة ({currency === 'USD' ? 'دولار $' : 'د.ع'}) <span className="text-rose-400">*</span>
                      </label>
                      {amount > 0 && (
                        <span className="text-[11px] font-mono font-bold text-emerald-400" dir="ltr">
                          {formatCurrency(amount, currency)}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={amount === 0 ? '' : amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIsAutoRemaining(false);
                        setAmount(val === '' ? 0 : Number(val));
                      }}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 font-mono font-bold focus:outline-none ${
                        isOverRemaining
                          ? 'border-rose-500 text-rose-400 focus:border-rose-500'
                          : 'border-slate-700 text-emerald-400 focus:border-emerald-500'
                      }`}
                    />

                    {currency !== billCurr && (
                      <div className="mt-2.5 p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            <span>سعر الصرف (1$ أو 100$):</span>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={customRate === 0 ? '' : customRate}
                              onChange={(e) => handleRateChange(e.target.value)}
                              placeholder="1500 أو 150000"
                              className="w-24 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 font-mono text-cyan-300 focus:outline-none"
                            />
                          </span>
                          <span className="text-slate-200 font-semibold">
                            يعادل: <strong className="font-mono text-emerald-400 text-sm" dir="ltr">{formatCurrency(previewBreakdown.grossInBillCurrency, billCurr)}</strong>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>السعر المعتمد للتحويل: 1$ = {activeRate.toLocaleString('ar-IQ')} د.ع (100$ = {Math.round(activeRate * 100).toLocaleString('ar-IQ')} د.ع)</span>
                        </div>
                      </div>
                    )}

                    {isOverRemaining && (
                      <p className="text-[11px] text-rose-400 mt-1.5 font-semibold">
                        ⚠️ الصافي المحتسب للبوليصة ({formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurr)}) أكبر من المتبقي ({formatCurrency(fin.remainingAmount, billCurr)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Left Column: Date, Notes & Live Accounting Summary */}
                <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">التاريخ</label>
                    <DatePicker
                      value={date}
                      onChange={(d) => setDate(d)}
                      placeholder="اختر التاريخ..."
                    />
                  </div>

                  {/* Live Reflection Preview Box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">صافي انعكاس الصندوق:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-emerald-400 text-xs" dir="ltr">
                          +{formatCurrency(netCashboxAmount, currency)}
                        </strong>
                        {hasCommission && commissionAmount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            commissionBearer === 'company'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {commissionBearer === 'company'
                              ? `خُصمت عمولة الشركة (-${formatCurrency(commissionAmount, commissionCurrency)})`
                              : 'عمولة على الزبون (لا تؤثر على الصندوق)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">يُحتسب لتسديد البوليصة (الحوالة):</span>
                      <strong className="font-mono text-cyan-300 text-xs" dir="ltr">
                        {formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurr)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">المتبقي الجديد على الزبون:</span>
                      <strong className={`font-mono text-xs ${newRemainingOnBill === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                        {formatCurrency(newRemainingOnBill, billCurr)}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ملاحظات الدفعة</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Full-Width Commission Section Below the 2 Columns */}
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
                partyLabel="الزبون"
                exchangeRate={activeRate}
              />
            </>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              {hasCommission && commissionAmount > 0 ? (
                commissionBearer === 'company' ? (
                  <span className="text-emerald-300">
                    💡 العمولة على الشركة ({formatCurrency(commissionAmount, commissionCurrency)}) تُستقطع من مبلغ الدفعة الداخلة للصندوق.
                  </span>
                ) : (
                  <span className="text-amber-300">
                    💡 العمولة على الزبون ({formatCurrency(commissionAmount, commissionCurrency)}) لا تؤثر على الحوالة أو الصندوق.
                  </span>
                )
              ) : (
                <span>يرجى التأكد من عملة الدفعة والمبلغ قبل الحفظ.</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">
                إلغاء
              </button>
              <button 
                type="submit" 
                disabled={isFullyPaid || isOverRemaining || amount <= 0}
                className={`px-5 py-1.5 rounded-xl font-bold transition ${
                  isFullyPaid || isOverRemaining || amount <= 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                تسجيل الدفعة
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
