import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Coins,
  DollarSign,
  RefreshCw,
  Printer,
  Save,
  Upload,
} from 'lucide-react';
import {
  TransportCompany,
  Transaction,
  TreasuryTransaction,
  TreasuryAttachment,
  CompanyId,
  COMPANIES,
  Currency,
} from '../../types/customs';
import {
  formatCurrency,
  getCarrierFinancials,
  normalizeExchangeRate,
} from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CommissionSection } from '../ui/CommissionSection';

export interface CarrierPaymentModalProps {
  isOpen: boolean;
  carrier: TransportCompany | null;
  transactions: Transaction[];
  treasury: TreasuryTransaction[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  defaultBillNo?: string;
  onClose: () => void;
  onSave: (
    txData: {
      carrierId: string;
      carrierName: string;
      companyId: CompanyId | 'shared';
      currency: Currency;
      exchangeRate: number;
      amount: number;
      date: string;
      relatedBillNo?: string;
      description: string;
      hasCommission?: boolean;
      commissionAmount?: number;
      commissionCurrency?: Currency;
      commissionBearer?: 'company' | 'party';
      attachment?: TreasuryAttachment;
    },
    shouldPrint: boolean
  ) => void;
}

export const CarrierPaymentModal: React.FC<CarrierPaymentModalProps> = ({
  isOpen,
  carrier,
  transactions,
  treasury,
  exchangeRate = 1500,
  onExchangeRateChange,
  defaultBillNo = '',
  onClose,
  onSave,
}) => {
  const [companyId, setCompanyId] = useState<CompanyId | 'shared'>('naqaa_basra');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [customRate, setCustomRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [relatedBillNo, setRelatedBillNo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);
  const [shouldPrintOnSubmit, setShouldPrintOnSubmit] = useState<boolean>(true);

  // Commission state
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('IQD');
  const [commissionBearer, setCommissionBearer] = useState<'company' | 'party'>('company');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRate = normalizeExchangeRate(customRate, normalizeExchangeRate(exchangeRate, 1500));
  const fin = carrier ? getCarrierFinancials(carrier, transactions, treasury, activeRate) : null;

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setCustomRate(prev => {
        if (prev > 0 && normalizeExchangeRate(prev, 1500) === normalizedProp) return prev;
        return normalizedProp;
      });
    }
  }, [exchangeRate]);

  useEffect(() => {
    if (carrier && isOpen) {
      const initRate = normalizeExchangeRate(exchangeRate, 1500);
      const cFin = getCarrierFinancials(carrier, transactions, treasury, initRate);
      const initCurr: Currency =
        cFin.remainingUSD > 0 && cFin.remainingIQD === 0 ? 'USD' : 'IQD';
      const initAmt =
        initCurr === 'USD'
          ? cFin.remainingUSD > 0
            ? cFin.remainingUSD
            : 0
          : cFin.remainingIQD > 0
          ? cFin.remainingIQD
          : 0;

      setCurrency(initCurr);
      setCustomRate(initRate);
      setAmount(initAmt);
      setDate(new Date().toISOString().split('T')[0]);
      setRelatedBillNo(defaultBillNo || (cFin.trips[0]?.bill.billNo ?? ''));
      setDescription(
        `تسديد دفعة من أجور النقل البري لشركة ${carrier.name}${
          defaultBillNo ? ` (بوليصة ${defaultBillNo})` : ''
        }`
      );
      setAttachment(undefined);
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency(initCurr);
      setCommissionBearer('company');
    }
  }, [carrier, isOpen, defaultBillNo, exchangeRate]);

  if (!isOpen || !carrier || !fin) return null;

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    setCommissionCurrency(newCurr);
    if (newCurr === 'USD') {
      setAmount(fin.remainingUSD > 0 ? fin.remainingUSD : Math.round((fin.remainingIQD / activeRate) * 100) / 100);
    } else {
      setAmount(fin.remainingIQD > 0 ? fin.remainingIQD : Math.round(fin.remainingUSD * activeRate));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }
    onSave(
      {
        carrierId: carrier.id,
        carrierName: carrier.name,
        companyId,
        currency,
        exchangeRate: activeRate,
        amount: Number(amount),
        date,
        relatedBillNo: relatedBillNo || undefined,
        description:
          description.trim() ||
          `تسديد دفعة أجور نقل لشركة ${carrier.name}`,
        hasCommission,
        commissionAmount: hasCommission ? Number(commissionAmount) : 0,
        commissionCurrency: hasCommission ? commissionCurrency : currency,
        commissionBearer: hasCommission ? commissionBearer : 'company',
        attachment,
      },
      shouldPrintOnSubmit
    );
  };

  const companyCommInCurr =
    hasCommission && commissionBearer === 'company' && commissionAmount > 0 && commissionCurrency === currency
      ? commissionAmount
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              تسديد دفعة لشركة النقل ({carrier.name})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
          {/* 2-Column Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Right Column: Carrier Balances, Currency & Amount */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              {/* Carrier Remaining Debt Summary */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">إجمالي مستحقات الناقل:</span>
                  <span className="font-mono font-bold text-slate-200" dir="ltr">
                    {formatCurrency(fin.totalCostIQD, 'IQD')}
                    {fin.totalCostUSD > 0 ? ` + ${formatCurrency(fin.totalCostUSD, 'USD')}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">المسدد سابقاً من الصندوق:</span>
                  <span className="font-mono font-bold text-emerald-400" dir="ltr">
                    {formatCurrency(fin.paidIQD, 'IQD')}
                    {fin.paidUSD > 0 ? ` + ${formatCurrency(fin.paidUSD, 'USD')}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
                  <span className="text-amber-300 font-bold">المتبقي لشركة النقل بذمتنا:</span>
                  <div className="font-mono font-black text-sm text-amber-400" dir="ltr">
                    {fin.remainingIQD > 0 && <span>{formatCurrency(fin.remainingIQD, 'IQD')}</span>}
                    {fin.remainingIQD > 0 && fin.remainingUSD > 0 && <span> + </span>}
                    {fin.remainingUSD > 0 && <span className="text-cyan-400">{formatCurrency(fin.remainingUSD, 'USD')}</span>}
                    {fin.remainingIQD === 0 && fin.remainingUSD === 0 && (
                      <span className="text-emerald-400">0 د.ع (مصفى بالكامل)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1 shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>عملة التسديد:</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('IQD')}
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
                    onClick={() => handleCurrencyChange('USD')}
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

              {/* Payment Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold text-xs">
                    مبلغ الدفعة المسددة للناقل ({currency === 'USD' ? '$' : 'د.ع'}) *
                  </label>
                  {amount > 0 && (
                    <span className="text-[11px] font-mono font-bold text-amber-400" dir="ltr">
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
                  onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Exchange Rate Box */}
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>سعر الصرف (1$ أو 100$):</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customRate === 0 ? '' : customRate}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setCustomRate(val);
                        if (val >= 100 && onExchangeRateChange) {
                          onExchangeRateChange(normalizeExchangeRate(val, 1500), true);
                        }
                      }}
                      className="w-24 bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-0.5 font-mono text-cyan-300 focus:outline-none"
                    />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    1$ = {activeRate.toLocaleString('ar-IQ')} د.ع
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Bill Link, Company, Date, Notes & Archive */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الشركة المسددة</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value as CompanyId | 'shared')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="naqaa_basra">{COMPANIES.naqaa_basra.shortName}</option>
                    <option value="sawt_aljanoub">{COMPANIES.sawt_aljanoub.shortName}</option>
                    <option value="shared">مشترك (الصندوق العام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البوليصة المرتبطة</label>
                  <select
                    value={relatedBillNo}
                    onChange={(e) => setRelatedBillNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">-- دفعة عامة على الحساب --</option>
                    {fin.trips.map(({ trip, bill }) => (
                      <option key={trip.id} value={bill.billNo}>
                        بوليصة {bill.billNo} ({trip.destination} - {formatCurrency(trip.carrierCost, trip.currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">تاريخ التسديد</label>
                <DatePicker value={date} onChange={(d) => setDate(d)} placeholder="اختر التاريخ..." />
              </div>

              {/* Cashbox Reflection Box */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">إجمالي المنصرف من الصندوق:</span>
                  <strong className="font-mono text-rose-400" dir="ltr">
                    -{formatCurrency((Number(amount) || 0) + companyCommInCurr, currency)}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">يُحتسب تسديداً لحساب شركة النقل:</span>
                  <strong className="font-mono text-emerald-400" dir="ltr">
                    {formatCurrency(Number(amount) || 0, currency)}
                  </strong>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">بيان وملاحظات سند الصرف</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{attachment ? '✓ تم إرفاق وصل' : 'أرشفة وصل التسديد'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-amber-400 focus:outline-none resize-none"
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
            partyLabel="شركة النقل"
            exchangeRate={activeRate}
          />

          {/* Footer with Default "Save and Print" Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              يُقيد هذا السند في الصندوق ويُخصم مباشرة من الرصيد المتبقي لشركة النقل.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                onClick={() => setShouldPrintOnSubmit(false)}
                disabled={amount <= 0}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ فقط</span>
              </button>
              <button
                type="submit"
                onClick={() => setShouldPrintOnSubmit(true)}
                disabled={amount <= 0}
                className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>حفظ وطباعة القيد</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
