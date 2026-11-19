import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Receipt, Transaction, Customer, Employee, COMPANIES, Currency } from '../../types/customs';
import { getBillFinancials, getReceiptBreakdownForBill, formatCurrency, normalizeExchangeRate } from '../../utils/storage';
import { CommissionSection } from '../ui/CommissionSection';
import { ReceiptPartiesCol } from '../receipts/modal/ReceiptPartiesCol';
import { ReceiptFinancialCol } from '../receipts/modal/ReceiptFinancialCol';
import { ReceiptLiveReflection } from '../receipts/modal/ReceiptLiveReflection';
import { ReceiptModalFooter } from '../receipts/modal/ReceiptModalFooter';

interface ReceiptModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  receipts?: Receipt[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onClose: () => void;
  onSave: (rcptData: Omit<Receipt, 'id' | 'createdAt'>) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transactions,
  customers,
  employees,
  receipts = [],
  exchangeRate = 1500,
  onExchangeRateChange,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<Receipt['type']>('payment');
  const [billId, setBillId] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [customRate, setCustomRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [isAutoRemaining, setIsAutoRemaining] = useState<boolean>(true);
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Commission state
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('USD');
  const [commissionBearer, setCommissionBearer] = useState<'company' | 'party'>('company');

  // Sync customRate whenever control panel exchangeRate changes
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
    if (isOpen) {
      setFormError(null);
      setType('payment');
      const defaultBill = transactions[0]?.id || '';
      setBillId(defaultBill);
      const tx = transactions.find(t => t.id === defaultBill);
      const initialCurr: Currency = tx?.currency === 'USD' ? 'USD' : 'IQD';
      const initialRate = normalizeExchangeRate(exchangeRate || tx?.exchangeRate, 1500);
      setCurrency(initialCurr);
      setCustomRate(initialRate);
      setIsAutoRemaining(true);
      setEmployeeId(tx?.employeeId || employees[0]?.id || '');
      
      // Reset commission
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency(initialCurr);
      setCommissionBearer('company');

      if (tx) {
        const fin = getBillFinancials(tx, receipts, initialRate);
        setAmount(fin.remainingAmount > 0 ? fin.remainingAmount : 0);
      } else {
        setAmount(1000000);
      }
      
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpen, transactions, employees, exchangeRate]);

  if (!isOpen) return null;

  const currentTx = transactions.find(t => t.id === billId);
  const currentCust = currentTx ? customers.find(c => c.id === currentTx.customerId) : null;
  const activeRate = normalizeExchangeRate(customRate, normalizeExchangeRate(exchangeRate, 1500));
  const fin = currentTx ? getBillFinancials(currentTx, receipts, activeRate) : null;
  const billCurrency: Currency = (fin?.currency === 'USD' ? 'USD' : 'IQD');

  const previewBreakdown = getReceiptBreakdownForBill(
    {
      id: 'preview',
      receiptNo: 'PREVIEW',
      type,
      billId,
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
    billCurrency,
    activeRate
  );

  const isPaymentOverRemaining =
    type === 'payment' && fin
      ? previewBreakdown.netCreditInBillCurrency > fin.remainingAmount + 0.05
      : false;
  const isBillFullyPaid = type === 'payment' && fin ? fin.remainingAmount <= 0 : false;
  const newRemainingOnBill =
    type === 'payment' && fin
      ? Math.max(0, Math.round((fin.remainingAmount - previewBreakdown.netCreditInBillCurrency) * 100) / 100)
      : 0;

  const computeRemainingInCurrency = (targetCurr: Currency, rateToUse: number, remainingInBillCurr: number) => {
    const safeRate = normalizeExchangeRate(rateToUse, 1500);
    if (remainingInBillCurr <= 0) return 0;
    if (targetCurr === billCurrency) return remainingInBillCurr;
    if (billCurrency === 'USD' && targetCurr === 'IQD') {
      return Math.round(remainingInBillCurr * safeRate);
    }
    return Math.round((remainingInBillCurr / safeRate) * 100) / 100;
  };

  const handleCurrencySwitch = (newCurr: Currency) => {
    if (newCurr === currency) return;
    setCurrency(newCurr);
    setCommissionCurrency(newCurr);
    setFormError(null);

    if (type === 'payment' && fin && fin.remainingAmount > 0) {
      setIsAutoRemaining(true);
      setAmount(computeRemainingInCurrency(newCurr, activeRate, fin.remainingAmount));
    } else if (type === 'advance') {
      setAmount(newCurr === 'USD' ? 500 : 1000000);
    }
  };

  const handleRateChange = (rawVal: string) => {
    const rawNum = rawVal === '' ? 0 : Number(rawVal);
    setCustomRate(rawNum);
    setFormError(null);

    if (rawNum >= 100) {
      const normalized = normalizeExchangeRate(rawNum, 1500);
      if (type === 'payment' && fin && fin.remainingAmount > 0 && currency !== billCurrency && isAutoRemaining) {
        setAmount(computeRemainingInCurrency(currency, normalized, fin.remainingAmount));
      }
      if (onExchangeRateChange) {
        onExchangeRateChange(normalized, true);
      }
    }
  };

  const handleBillChange = (newBillId: string) => {
    setBillId(newBillId);
    setFormError(null);
    const tx = transactions.find(t => t.id === newBillId);
    if (tx) {
      const txCurr: Currency = tx.currency === 'USD' ? 'USD' : 'IQD';
      const rateToUse = normalizeExchangeRate(activeRate || exchangeRate || tx.exchangeRate, 1500);
      setCurrency(txCurr);
      setCustomRate(rateToUse);
      setIsAutoRemaining(true);
      setCommissionCurrency(txCurr);
      if (tx.employeeId) setEmployeeId(tx.employeeId);
      if (type === 'payment') {
        const txFin = getBillFinancials(tx, receipts, rateToUse);
        setAmount(txFin.remainingAmount > 0 ? txFin.remainingAmount : 0);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billId || amount <= 0) return;

    if (type === 'payment' && fin && previewBreakdown.netCreditInBillCurrency > fin.remainingAmount + 0.05) {
      setFormError(
        `لا يجوز أن يكون الصافي المسدد للبوليصة (${formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurrency)}) أكبر من المتبقي المستحق (${formatCurrency(fin.remainingAmount, billCurrency)})`
      );
      return;
    }

    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onSave({
      receiptNo,
      type,
      billId,
      companyId: currentTx?.companyId || 'naqaa_basra',
      customerId: currentTx?.customerId,
      employeeId: (type === 'advance' || type === 'settlement') ? employeeId : undefined,
      amount: Number(amount) || 0,
      currency,
      exchangeRate: activeRate,
      hasCommission,
      commissionAmount: hasCommission ? Number(commissionAmount) : 0,
      commissionCurrency: hasCommission ? commissionCurrency : undefined,
      commissionBearer: hasCommission ? commissionBearer : undefined,
      date,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl max-w-3xl lg:max-w-4xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              🧾
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>إضافة سند / وصل مالي جديد</span>
                {currentTx && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${COMPANIES[currentTx.companyId || 'naqaa_basra']?.badgeClass}`}>
                    🏢 {COMPANIES[currentTx.companyId || 'naqaa_basra']?.shortName}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                سند قبض دفعة زبون، سلفة مخلص، أو تسوية عهدة نقدية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          
          {/* Form Body */}
          <div className="p-3.5 sm:p-4 space-y-3 text-xs">
            {formError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {isBillFullyPaid && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-center font-bold">
                ✅ هذه البوليصة مسددة بالكامل (المتبقي 0). لا يمكن قبض دفعات إضافية عليها.
              </div>
            )}

            {/* Two Balanced Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <ReceiptPartiesCol
                currency={currency}
                onCurrencySwitch={handleCurrencySwitch}
                type={type}
                onTypeChange={(newType) => {
                  setType(newType);
                  if (newType === 'payment' && fin) {
                    setIsAutoRemaining(true);
                    setAmount(computeRemainingInCurrency(currency, activeRate, fin.remainingAmount));
                  } else if (newType === 'advance') {
                    setAmount(currency === 'USD' ? 500 : 1000000);
                  }
                }}
                billId={billId}
                onBillChange={handleBillChange}
                transactions={transactions}
                customers={customers}
                employees={employees}
                currentCust={currentCust}
                employeeId={employeeId}
                setEmployeeId={setEmployeeId}
              />

              <ReceiptFinancialCol
                type={type}
                fin={fin}
                billCurrency={billCurrency}
                currency={currency}
                amount={amount}
                setAmount={setAmount}
                setIsAutoRemaining={setIsAutoRemaining}
                isBillFullyPaid={isBillFullyPaid}
                isPaymentOverRemaining={isPaymentOverRemaining}
                date={date}
                setDate={setDate}
                customRate={customRate}
                handleRateChange={handleRateChange}
                activeRate={activeRate}
                previewBreakdown={previewBreakdown}
                isAutoRemaining={isAutoRemaining}
                computeRemainingInCurrency={computeRemainingInCurrency}
                notes={notes}
                setNotes={setNotes}
              />
            </div>

            {/* Compact Commission Section */}
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
              partyLabel={type === 'advance' || type === 'settlement' ? 'المخلص' : 'الزبون'}
              exchangeRate={activeRate}
            />

            {/* Live Financial Reflection */}
            <ReceiptLiveReflection
              type={type}
              fin={fin}
              amount={amount}
              hasCommission={hasCommission}
              currency={currency}
              billCurrency={billCurrency}
              commissionBearer={commissionBearer}
              commissionAmount={commissionAmount}
              commissionCurrency={commissionCurrency}
              previewBreakdown={previewBreakdown}
              newRemainingOnBill={newRemainingOnBill}
            />
          </div>

          {/* Footer */}
          <ReceiptModalFooter
            amount={amount}
            currency={currency}
            hasCommission={hasCommission}
            commissionAmount={commissionAmount}
            commissionCurrency={commissionCurrency}
            commissionBearer={commissionBearer}
            onClose={onClose}
            isBillFullyPaid={isBillFullyPaid}
            isPaymentOverRemaining={isPaymentOverRemaining}
          />
        </form>
      </div>
    </div>
  );
};
