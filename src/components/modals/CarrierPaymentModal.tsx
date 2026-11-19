import React, { useState, useEffect } from 'react';
import { X, Coins } from 'lucide-react';
import {
  TransportCompany,
  Transaction,
  TreasuryTransaction,
  TreasuryAttachment,
  CompanyId,
  Currency,
} from '../../types/customs';
import {
  getCarrierFinancials,
  normalizeExchangeRate,
} from '../../utils/storage';
import { CommissionSection } from '../ui/CommissionSection';
import { CarrierPaymentFinancialCol } from './carrier/CarrierPaymentFinancialCol';
import { CarrierPaymentContextCol } from './carrier/CarrierPaymentContextCol';
import { CarrierPaymentModalFooter } from './carrier/CarrierPaymentModalFooter';

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

  const handleCustomRateChange = (val: number) => {
    setCustomRate(val);
    if (val >= 100 && onExchangeRateChange) {
      onExchangeRateChange(normalizeExchangeRate(val, 1500), true);
    }
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
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
          {/* 2-Column Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <CarrierPaymentFinancialCol
              fin={fin}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              amount={amount}
              onAmountChange={setAmount}
              customRate={customRate}
              onCustomRateChange={handleCustomRateChange}
              activeRate={activeRate}
            />

            <CarrierPaymentContextCol
              companyId={companyId}
              onCompanyIdChange={setCompanyId}
              relatedBillNo={relatedBillNo}
              onRelatedBillNoChange={setRelatedBillNo}
              trips={fin.trips}
              date={date}
              onDateChange={setDate}
              amount={amount}
              currency={currency}
              companyCommInCurr={companyCommInCurr}
              description={description}
              onDescriptionChange={setDescription}
              attachment={attachment}
              onAttachmentChange={setAttachment}
            />
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

          <CarrierPaymentModalFooter
            onClose={onClose}
            amount={amount}
            setShouldPrintOnSubmit={setShouldPrintOnSubmit}
          />
        </form>
      </div>
    </div>
  );
};
