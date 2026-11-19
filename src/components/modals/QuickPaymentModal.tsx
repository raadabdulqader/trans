import React, { useState, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import { Transaction, Receipt, Currency } from '../../types/customs';
import { formatCurrency, getBillFinancials, normalizeExchangeRate } from '../../utils/storage';
import { CommissionSection } from '../ui/CommissionSection';
import { CommissionPayload } from './QuickAdvanceModal';
import { PaymentAmountCol } from './payment/PaymentAmountCol';
import { PaymentAccountingCol } from './payment/PaymentAccountingCol';
import { PaymentModalFooter } from './payment/PaymentModalFooter';

export type PaymentMode = 'IQD' | 'USD' | 'split';

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

  const totalRemainingInRefCurr = isMixed
    ? fin.remainingAmount + Math.round((fin.remainingAmountUSD || 0) * activeRate)
    : fin.remainingAmount;

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
    if (billCurr === 'USD' && !isMixed) {
      effectiveCreditInRefCurr = amountUSD + (activeRate > 0 ? Math.round((amountIQD / activeRate) * 100) / 100 : 0);
    } else {
      effectiveCreditInRefCurr = amountIQD + Math.round(amountUSD * activeRate);
    }
  }

  const isOverRemaining = effectiveCreditInRefCurr > totalRemainingInRefCurr + 0.05;
  const newRemainingRef = Math.max(0, Math.round((totalRemainingInRefCurr - effectiveCreditInRefCurr) * 100) / 100);

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
                <PaymentAmountCol
                  isMixed={isMixed}
                  fin={fin}
                  billCurr={billCurr}
                  totalRemainingInRefCurr={totalRemainingInRefCurr}
                  payMode={payMode}
                  onModeSwitch={handleModeSwitch}
                  amountIQD={amountIQD}
                  setAmountIQD={setAmountIQD}
                  amountUSD={amountUSD}
                  setAmountUSD={setAmountUSD}
                  customRate={customRate}
                  onRateChange={handleRateChange}
                  activeRate={activeRate}
                  effectiveCreditInRefCurr={effectiveCreditInRefCurr}
                  isOverRemaining={isOverRemaining}
                />

                <PaymentAccountingCol
                  date={date}
                  setDate={setDate}
                  netCashboxIQD={netCashboxIQD}
                  netCashboxUSD={netCashboxUSD}
                  effectiveCreditInRefCurr={effectiveCreditInRefCurr}
                  newRemainingRef={newRemainingRef}
                  billCurr={billCurr}
                  isMixed={isMixed}
                  notes={notes}
                  setNotes={setNotes}
                />
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
          <PaymentModalFooter
            payMode={payMode}
            onClose={onClose}
            isFullyPaid={isFullyPaid}
            isOverRemaining={isOverRemaining}
            amountIQD={amountIQD}
            amountUSD={amountUSD}
          />
        </form>
      </div>
    </div>
  );
};
