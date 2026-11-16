import React, { useState, useEffect } from 'react';
import { X, Wallet, DollarSign, RefreshCw, SplitSquareVertical } from 'lucide-react';
import { Transaction, Receipt, Currency } from '../../types/customs';
import { formatCurrency, getBillFinancials, normalizeExchangeRate } from '../../utils/storage';
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
    customExchangeRate?: number,
    dualPayment?: {
      amountIQD: number;
      amountUSD: number;
    }
  ) => void;
}

export type PaymentMode = 'IQD' | 'USD' | 'split';

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  transaction,
  receipts,
  exchangeRate = 1500,
  onExchangeRateChange,
  onClose,
  onSave,
}) => {
  const [payMode, setPayMode] = useState<PaymentMode>('IQD');
  const [customRate, setCustomRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [amountIQD, setAmountIQD] = useState<number>(0);
  const [amountUSD, setAmountUSD] = useState<number>(0);
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
      const initRate = normalizeExchangeRate(exchangeRate || transaction.exchangeRate, 1500);
      const currentFin = getBillFinancials(transaction, receipts, initRate);
      setCustomRate(initRate);

      if (transaction.isMixedCurrency) {
        // Mixed bill default to split if both currencies have remaining, or the one with remaining
        if (currentFin.remainingAmount > 0 && (currentFin.remainingAmountUSD || 0) > 0) {
          setPayMode('split');
          setAmountIQD(currentFin.remainingAmount);
          setAmountUSD(currentFin.remainingAmountUSD || 0);
        } else if ((currentFin.remainingAmountUSD || 0) > 0) {
          setPayMode('USD');
          setAmountIQD(0);
          setAmountUSD(currentFin.remainingAmountUSD || 0);
        } else {
          setPayMode('IQD');
          setAmountIQD(currentFin.remainingAmount > 0 ? currentFin.remainingAmount : 0);
          setAmountUSD(0);
        }
      } else if (transaction.currency === 'USD') {
        setPayMode('USD');
        setAmountUSD(currentFin.remainingAmount > 0 ? currentFin.remainingAmount : 0);
        setAmountIQD(0);
      } else {
        setPayMode('IQD');
        setAmountIQD(currentFin.remainingAmount > 0 ? currentFin.remainingAmount : 0);
        setAmountUSD(0);
      }

      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`دفعة سداد حساب بوليصة ${transaction.billNo}`);
      setErrorMsg('');
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency(transaction.currency === 'USD' ? 'USD' : 'IQD');
      setCommissionBearer('company');
    }
  }, [transaction, isOpen, exchangeRate]);

  if (!isOpen || !transaction || !fin) return null;

  const isMixed = !!transaction.isMixedCurrency;
  const isFullyPaid = isMixed
    ? fin.remainingAmount <= 0 && (fin.remainingAmountUSD || 0) <= 0
    : fin.remainingAmount <= 0;

  // Total remaining on bill in terms of bill reference currency (IQD for mixed/IQD, USD for USD)
  const totalRemainingInRefCurr = isMixed
    ? fin.remainingAmount + Math.round((fin.remainingAmountUSD || 0) * activeRate)
    : fin.remainingAmount;

  // Credit calculation towards bill debt
  let effectiveCreditInRefCurr = 0;
  if (payMode === 'IQD') {
    if (billCurr === 'USD' && !isMixed) {
      effectiveCreditInRefCurr = activeRate > 0 ? Math.round((amountIQD / activeRate) * 100) / 100 : 0;
    } else {
      effectiveCreditInRefCurr = amountIQD;
    }
  } else if (payMode === 'USD') {
    if (billCurr === 'USD' && !isMixed) {
      effectiveCreditInRefCurr = amountUSD;
    } else {
      effectiveCreditInRefCurr = Math.round(amountUSD * activeRate);
    }
  } else {
    // split payment
    if (billCurr === 'USD' && !isMixed) {
      effectiveCreditInRefCurr = amountUSD + (activeRate > 0 ? Math.round((amountIQD / activeRate) * 100) / 100 : 0);
    } else {
      effectiveCreditInRefCurr = amountIQD + Math.round(amountUSD * activeRate);
    }
  }

  const isOverRemaining = effectiveCreditInRefCurr > totalRemainingInRefCurr + 0.05;
  const newRemainingRef = Math.max(0, Math.round((totalRemainingInRefCurr - effectiveCreditInRefCurr) * 100) / 100);

  // Cashbox net impact
  const netCashboxIQD = payMode === 'USD' ? 0 : Math.max(0, amountIQD - (hasCommission && commissionBearer === 'company' && commissionCurrency === 'IQD' ? commissionAmount : 0));
  const netCashboxUSD = payMode === 'IQD' ? 0 : Math.max(0, amountUSD - (hasCommission && commissionBearer === 'company' && commissionCurrency === 'USD' ? commissionAmount : 0));

  const handleModeSwitch = (newMode: PaymentMode) => {
    if (newMode === payMode) return;
    setPayMode(newMode);
    setErrorMsg('');

    if (newMode === 'IQD') {
      setAmountUSD(0);
      if (isMixed) {
        setAmountIQD(fin.remainingAmount > 0 ? fin.remainingAmount : Math.round((fin.remainingAmountUSD || 0) * activeRate));
      } else if (billCurr === 'USD') {
        setAmountIQD(Math.round(fin.remainingAmount * activeRate));
      } else {
        setAmountIQD(fin.remainingAmount);
      }
    } else if (newMode === 'USD') {
      setAmountIQD(0);
      if (isMixed) {
        setAmountUSD((fin.remainingAmountUSD || 0) > 0 ? (fin.remainingAmountUSD || 0) : Math.round((fin.remainingAmount / activeRate) * 100) / 100);
      } else if (billCurr === 'USD') {
        setAmountUSD(fin.remainingAmount);
      } else {
        setAmountUSD(Math.round((fin.remainingAmount / activeRate) * 100) / 100);
      }
    } else {
      // split mode
      if (isMixed) {
        setAmountIQD(fin.remainingAmount > 0 ? fin.remainingAmount : 0);
        setAmountUSD((fin.remainingAmountUSD || 0) > 0 ? (fin.remainingAmountUSD || 0) : 0);
      } else if (billCurr === 'USD') {
        const halfUSD = Math.round((fin.remainingAmount / 2) * 100) / 100;
        setAmountUSD(halfUSD);
        setAmountIQD(Math.round((fin.remainingAmount - halfUSD) * activeRate));
      } else {
        const halfIQD = Math.round(fin.remainingAmount / 2);
        setAmountIQD(halfIQD);
        setAmountUSD(Math.round(((fin.remainingAmount - halfIQD) / activeRate) * 100) / 100);
      }
    }
  };

  const handleRateChange = (rawVal: string) => {
    const rawNum = rawVal === '' ? 0 : Number(rawVal);
    setCustomRate(rawNum);
    setErrorMsg('');
    if (rawNum >= 100 && onExchangeRateChange) {
      onExchangeRateChange(normalizeExchangeRate(rawNum, 1500), true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const totalPaidInput = (payMode !== 'USD' ? amountIQD : 0) + (payMode !== 'IQD' ? amountUSD : 0);
    if (totalPaidInput <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح للدفعة');
      return;
    }

    if (effectiveCreditInRefCurr > totalRemainingInRefCurr + 0.05) {
      setErrorMsg(
        `لا يجوز أن يكون الصافي المسدد (${formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}) أكبر من المتبقي المستحق (${formatCurrency(totalRemainingInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')})`
      );
      return;
    }

    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }

    const commissionPayload: CommissionPayload = {
      hasCommission,
      commissionAmount: hasCommission ? Number(commissionAmount) : 0,
      commissionCurrency: hasCommission ? commissionCurrency : (payMode === 'USD' ? 'USD' : 'IQD'),
      commissionBearer: hasCommission ? commissionBearer : 'company',
    };

    if (payMode === 'split') {
      onSave(
        amountIQD,
        date,
        notes,
        commissionPayload,
        'IQD',
        activeRate,
        {
          amountIQD,
          amountUSD,
        }
      );
    } else if (payMode === 'USD') {
      onSave(
        amountUSD,
        date,
        notes,
        commissionPayload,
        'USD',
        activeRate
      );
    } else {
      onSave(
        amountIQD,
        date,
        notes,
        commissionPayload,
        'IQD',
        activeRate
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>تسجيل استلام دفعة من الزبون (بوليصة {transaction.billNo})</span>
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
                {/* Right Column: Currency & Amount Selection */}
                <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                  {/* Remaining Debt Status Banner */}
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">المتبقي على البوليصة حالياً:</span>
                    <div className="text-right">
                      {isMixed ? (
                        <div className="font-mono font-bold text-sm text-amber-400" dir="ltr">
                          {formatCurrency(fin.remainingAmount, 'IQD')} + {formatCurrency(fin.remainingAmountUSD || 0, 'USD')}
                        </div>
                      ) : (
                        <span className={`font-mono font-bold text-sm ${fin.remainingAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                          {formatCurrency(fin.remainingAmount, billCurr)}
                        </span>
                      )}
                      {((isMixed && (fin.remainingAmountUSD || 0) > 0) || (billCurr === 'USD' && fin.remainingAmount > 0)) && (
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                          ≈ {new Intl.NumberFormat('ar-IQ').format(totalRemainingInRefCurr)} د.ع
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Mode Selector: IQD / USD / Split */}
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>طريقة وعملة القبض من الزبون:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('IQD')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
                          payMode === 'IQD'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🇮🇶 دينار فقط
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('USD')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] ${
                          payMode === 'USD'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🇺🇸 دولار فقط
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('split')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition border text-[11px] flex items-center justify-center gap-1 ${
                          payMode === 'split'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <SplitSquareVertical className="w-3 h-3" />
                        <span>دينار + دولار معاً</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Input Fields */}
                  <div className="space-y-2.5">
                    {(payMode === 'IQD' || payMode === 'split') && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-300 font-semibold text-xs">
                            المقبوض نقداً بالدينار (د.ع) <span className="text-rose-400">*</span>
                          </label>
                          {amountIQD > 0 && (
                            <span className="text-[11px] font-mono font-bold text-emerald-400" dir="ltr">
                              {formatCurrency(amountIQD, 'IQD')}
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required={payMode === 'IQD'}
                          value={amountIQD === 0 ? '' : amountIQD}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAmountIQD(val === '' ? 0 : Number(val));
                          }}
                          placeholder="0 د.ع"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {(payMode === 'USD' || payMode === 'split') && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-300 font-semibold text-xs">
                            المقبوض نقداً بالدولار ($) <span className="text-rose-400">*</span>
                          </label>
                          {amountUSD > 0 && (
                            <span className="text-[11px] font-mono font-bold text-cyan-400" dir="ltr">
                              {formatCurrency(amountUSD, 'USD')}
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required={payMode === 'USD'}
                          value={amountUSD === 0 ? '' : amountUSD}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAmountUSD(val === '' ? 0 : Number(val));
                          }}
                          placeholder="$0"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Exchange Rate Input for Conversion */}
                    {(payMode !== 'IQD' || billCurr === 'USD' || isMixed) && (
                      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            <span>سعر الصرف المعتمد (1$ أو 100$):</span>
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
                            المعادل الكلي: <strong className="font-mono text-emerald-400 text-sm" dir="ltr">{formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}</strong>
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          1$ = {activeRate.toLocaleString('ar-IQ')} د.ع (100$ = {Math.round(activeRate * 100).toLocaleString('ar-IQ')} د.ع)
                        </div>
                      </div>
                    )}

                    {isOverRemaining && (
                      <p className="text-[11px] text-rose-400 mt-1.5 font-semibold">
                        ⚠️ الصافي المحتسب ({formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}) أكبر من المتبقي المستحق ({formatCurrency(totalRemainingInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')})
                      </p>
                    )}
                  </div>
                </div>

                {/* Left Column: Date, Notes & Live Reflection Box */}
                <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">التاريخ</label>
                    <DatePicker
                      value={date}
                      onChange={(d) => setDate(d)}
                      placeholder="اختر التاريخ..."
                    />
                  </div>

                  {/* Live Accounting Summary Box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">انعكاس صندوق الدينار:</span>
                      <strong className="font-mono text-emerald-400 text-xs" dir="ltr">
                        +{formatCurrency(netCashboxIQD, 'IQD')}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">انعكاس صندوق الدولار:</span>
                      <strong className="font-mono text-cyan-400 text-xs" dir="ltr">
                        +{formatCurrency(netCashboxUSD, 'USD')}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">الخصم من ذمة الزبون:</span>
                      <strong className="font-mono text-white text-xs" dir="ltr">
                        -{formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">المتبقي الجديد على الزبون:</span>
                      <strong className={`font-mono text-xs ${newRemainingRef === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                        {formatCurrency(newRemainingRef, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}
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
                baseAmount={payMode === 'USD' ? amountUSD : amountIQD}
                baseCurrency={payMode === 'USD' ? 'USD' : 'IQD'}
                partyLabel="الزبون"
                exchangeRate={activeRate}
              />
            </>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              {payMode === 'split' ? (
                <span className="text-amber-300">
                  💡 سيتم إنشاء سندي قبض منفصلين: سند بالدينار في صندوق الدينار، وسند بالدولار في صندوق الدولار مع ربطهما بالبوليصة.
                </span>
              ) : (
                <span>يتم إيداع المبلغ المقبوض مباشرة في الصندوق الخاص بتلك العملة.</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">
                إلغاء
              </button>
              <button 
                type="submit" 
                disabled={isFullyPaid || isOverRemaining || ((payMode !== 'USD' ? amountIQD : 0) + (payMode !== 'IQD' ? amountUSD : 0) <= 0)}
                className={`px-5 py-1.5 rounded-xl font-bold transition ${
                  isFullyPaid || isOverRemaining || ((payMode !== 'USD' ? amountIQD : 0) + (payMode !== 'IQD' ? amountUSD : 0) <= 0)
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
