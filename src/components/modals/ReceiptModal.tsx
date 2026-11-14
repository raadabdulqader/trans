import React, { useState, useEffect } from 'react';
import { X, AlertCircle, DollarSign, RefreshCw } from 'lucide-react';
import { Receipt, Transaction, Customer, Employee, COMPANIES, Currency } from '../../types/customs';
import { getBillFinancials, getReceiptBreakdownForBill, formatCurrency, normalizeExchangeRate } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CommissionSection } from '../ui/CommissionSection';

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
      // Always prioritize the Control Panel's current exchangeRate (normalized to per-1$)
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

  // Live Breakdown of this draft receipt against the bill
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
        
        {/* Modal Header - Fixed at Top */}
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

        {/* Modal Form - Compact layout without unnecessary scrollbars */}
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
              
              {/* Column 1: Details & Parties */}
              <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                <div className="pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>بيانات السند والأطراف</span>
                  <span className="text-[10px] text-slate-500">القسم الأول</span>
                </div>

                {/* Currency Toggle */}
                <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>عملة السند:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => handleCurrencySwitch('IQD')}
                      className={`py-1 px-2.5 rounded-lg font-bold transition border text-[11px] ${
                        currency === 'IQD'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🇮🇶 دينار (IQD)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencySwitch('USD')}
                      className={`py-1 px-2.5 rounded-lg font-bold transition border text-[11px] ${
                        currency === 'USD'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🇺🇸 دولار ($)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">نوع السند / الوصل *</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setType(newType);
                        if (newType === 'payment' && fin) {
                          setIsAutoRemaining(true);
                          setAmount(computeRemainingInCurrency(currency, activeRate, fin.remainingAmount));
                        } else if (newType === 'advance') {
                          setAmount(currency === 'USD' ? 500 : 1000000);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="payment">💳 قبض دفعة زبون</option>
                      <option value="advance">🏦 صرف سلفة للمخلص</option>
                      <option value="settlement">✅ تسوية سلفة مخلص</option>
                    </select>
                  </div>

                  {type === 'payment' ? (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">الزبون المسدد</label>
                      <input
                        type="text"
                        readOnly
                        value={currentCust?.name || 'اختر البوليصة أولاً'}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-400 font-semibold text-xs truncate"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">المخلص المستلم *</label>
                      <select
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                      >
                        <option value="">-- اختر المخلص --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم البوليصة المرتبطة *</label>
                  <select
                    required
                    value={billId}
                    onChange={(e) => handleBillChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none text-xs"
                  >
                    <option value="">-- اختر البوليصة --</option>
                    {transactions.map(t => {
                      const c = customers.find(cust => cust.id === t.customerId);
                      const comp = COMPANIES[t.companyId || 'naqaa_basra'];
                      return (
                        <option key={t.id} value={t.id}>
                          [{comp?.shortName}] {t.billNo} - {c?.name || 'بدون زبون'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Column 2: Financials & Notes */}
              <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                <div className="pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>المبلغ والتوثيق المالي</span>
                  {type === 'payment' && fin && (
                    <span className="text-[10px] text-slate-400">
                      المتبقي للبوليصة: <strong className={fin.remainingAmount === 0 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'} dir="ltr">{formatCurrency(fin.remainingAmount, billCurrency)}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold text-[11px]">
                        المبلغ {currency === 'USD' ? '($)' : '(د.ع)'} *
                      </label>
                      {amount > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400" dir="ltr">
                          {currency === 'USD' ? `$${amount.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(amount)} د.ع`}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      disabled={isBillFullyPaid}
                      value={amount === 0 ? '' : amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIsAutoRemaining(false);
                        setAmount(val === '' ? 0 : Number(val));
                      }}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-1.5 font-mono font-bold focus:outline-none text-xs ${
                        isPaymentOverRemaining
                          ? 'border-rose-500 text-rose-400'
                          : 'border-slate-700 text-emerald-400 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">التاريخ *</label>
                    <DatePicker
                      value={date}
                      onChange={(d) => setDate(d)}
                      placeholder="اختر تاريخ السند..."
                    />
                  </div>
                </div>

                {/* Cross-Currency Conversion Bar when Receipt Currency != Bill Currency */}
                {fin && currency !== billCurrency && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[11px] flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>تحويل عملة (1$ أو 100$):</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={customRate === 0 ? '' : customRate}
                        onChange={(e) => handleRateChange(e.target.value)}
                        placeholder="1500 أو 150000"
                        className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">
                        (1$ = {activeRate.toLocaleString('ar-IQ')} د.ع)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>
                        يعادل من البوليصة:{' '}
                        <strong className="font-mono text-emerald-400" dir="ltr">
                          {formatCurrency(previewBreakdown.grossInBillCurrency, billCurrency)}
                        </strong>
                      </span>
                      {type === 'payment' && !isAutoRemaining && fin.remainingAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoRemaining(true);
                            setAmount(computeRemainingInCurrency(currency, activeRate, fin.remainingAmount));
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold transition"
                          title="حساب مبلغ تسديد كامل المتبقي وفق سعر الصرف المحدد"
                        >
                          كامل المتبقي
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isPaymentOverRemaining && fin && (
                  <p className="text-[10px] text-rose-400 font-semibold">
                    ⚠️ الصافي المحتسب للبوليصة ({formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurrency)}) يتجاوز المتبقي ({formatCurrency(fin.remainingAmount, billCurrency)})
                  </p>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">ملاحظات السند</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: دفعة بموجب إشعار بنكي، سلفة رسوم فحص، تصفية وصولات..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none text-xs"
                  />
                </div>
              </div>
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

            {/* Live Financial Reflection Preview on Bill & Cashbox */}
            {type === 'payment' && fin && amount > 0 && (hasCommission || currency !== billCurrency) && (
              <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">انعكاس الصندوق:</span>
                  <strong className="font-mono text-emerald-400" dir="ltr">
                    {hasCommission && commissionBearer === 'company' && commissionAmount > 0
                      ? commissionCurrency === currency
                        ? `+${formatCurrency(Math.max(0, amount - commissionAmount), currency)} (صافي بعد استقطاع عمولة الشركة)`
                        : `+${formatCurrency(amount, currency)} (يُستقطع -${formatCurrency(commissionAmount, commissionCurrency)} عمولة على الشركة)`
                      : `+${formatCurrency(amount, currency)}${hasCommission && commissionAmount > 0 ? ' (العمولة على الزبون لا تؤثر على الصندوق)' : ''}`}
                  </strong>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    <span className="text-slate-400">يُحتسب للبوليصة (الحوالة): </span>
                    <strong className="font-mono text-cyan-300" dir="ltr">
                      {formatCurrency(previewBreakdown.netCreditInBillCurrency, billCurrency)}
                    </strong>
                    {hasCommission && commissionAmount > 0 && (
                      <span className="text-[10px] text-amber-300 mr-1">
                        ({commissionBearer === 'party' ? 'العمولة على الزبون لا تؤثر على الحوالة' : 'العمولة على الشركة تُستقطع من الدفعة'})
                      </span>
                    )}
                  </span>
                  <span className="text-slate-700">|</span>
                  <span>
                    <span className="text-slate-400">المتبقي الجديد: </span>
                    <strong className={`font-mono ${newRemainingOnBill === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                      {formatCurrency(newRemainingOnBill, billCurrency)}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Always Fixed and Visible at Bottom */}
          <div className="px-5 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-slate-500">المبلغ:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currency === 'USD' ? `$${(amount || 0).toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(amount || 0)} د.ع`}
                </span>
              </span>
              {hasCommission && commissionAmount > 0 && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-300">
                    <span>العمولة:</span>
                    <span className="font-mono font-bold">
                      {commissionCurrency === 'USD' ? `$${commissionAmount.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(commissionAmount)} د.ع`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({commissionBearer === 'company' ? 'على الشركة' : 'على الزبون'})
                    </span>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isBillFullyPaid || isPaymentOverRemaining || amount <= 0}
                className={`px-5 py-1.5 font-bold rounded-xl transition text-xs flex items-center gap-1.5 ${
                  isBillFullyPaid || isPaymentOverRemaining || amount <= 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <span>💾</span>
                <span>حفظ السند</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
