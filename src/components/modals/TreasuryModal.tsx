import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { TreasuryTransaction, TreasuryMovementType, TreasuryAttachment, AppUser, CompanyId, Currency } from '../../types/customs';
import { normalizeExchangeRate } from '../../utils/storage';
import { CommissionSection } from '../ui/CommissionSection';
import { TreasuryAccountingEntry } from '../treasury/modal/TreasuryAccountingEntry';
import { TreasuryFinancialForm } from '../treasury/modal/TreasuryFinancialForm';
import { TreasuryModalHeader } from '../treasury/modal/TreasuryModalHeader';
import { TreasuryModalControlsBar } from '../treasury/modal/TreasuryModalControlsBar';
import { TreasuryPartyArchivingCol } from '../treasury/modal/TreasuryPartyArchivingCol';
import { TreasuryModalFooter } from '../treasury/modal/TreasuryModalFooter';

export interface TreasuryModalProps {
  isOpen: boolean;
  type: TreasuryMovementType;
  initialData?: TreasuryTransaction | null;
  currentUser: AppUser;
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onClose: () => void;
  onSave: (transaction: Omit<TreasuryTransaction, 'id' | 'createdAt'> & { id?: string }, andPrint?: boolean) => void;
  onDelete?: (tx: TreasuryTransaction) => void;
}

export const TreasuryModal: React.FC<TreasuryModalProps> = ({
  isOpen,
  type: initialType,
  initialData,
  currentUser,
  exchangeRate = 1500,
  onExchangeRateChange,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TreasuryMovementType>(initialType);
  const [companyId, setCompanyId] = useState<CompanyId | 'shared'>('shared');
  const [voucherNo, setVoucherNo] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [localRate, setLocalRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [customSwapAmount, setCustomSwapAmount] = useState<number | null>(null);

  // Commission state
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('IQD');
  const [commissionBearer, setCommissionBearer] = useState<'company' | 'party'>('company');

  const depositCategories = [
    'رأس مال افتتاحي',
    'تمويل إضافي للصندوق',
    'تصريف وتحويل عملة داخل الصندوق (FX Swap)',
    'سحب من الحساب البنكي',
    'إيراد خدمات كمركية واستشارات',
    'استرداد عهدة متبقية',
    'أخرى (إيداع وارد)',
  ];

  const withdrawalCategories = [
    'تصريف وتحويل عملة داخل الصندوق (FX Swap)',
    'مصاريف تشغيلية ونثرية',
    'إيجار ومرافق المكتب',
    'رواتب ومكافآت كادر العمل',
    'صيانة ووقود مركبات النقل',
    'ضيافة ومطبوعات ومستلزمات مكتبية',
    'رسوم وأجور دوائر حكومية وموانئ',
    'سحب أرباح شركاء / سحب شخصي',
    'أخرى (سحب صادر)',
  ];

  useEffect(() => {
    setFormError(null);
    if (initialData) {
      setType(initialData.type);
      setCompanyId(initialData.companyId || 'shared');
      setVoucherNo(initialData.voucherNo);
      setCurrency(initialData.currency || 'IQD');
      setAmount(initialData.amount);
      setDate(initialData.date);
      setPartyName(initialData.partyName);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setAttachment(initialData.attachment);
      setHasCommission(!!initialData.hasCommission);
      setCommissionAmount(initialData.commissionAmount || 0);
      setCommissionCurrency(initialData.commissionCurrency || initialData.currency || 'IQD');
      setCommissionBearer(initialData.commissionBearer || 'company');
    } else {
      setType(initialType);
      setCompanyId('shared');
      const prefix = initialType === 'deposit' ? 'TR-DEP' : 'TR-WTH';
      const year = new Date().getFullYear();
      const rand = Math.floor(100 + Math.random() * 900);
      setVoucherNo(`${prefix}-${year}-${rand}`);
      setCurrency('IQD');
      setAmount(1000000);
      setDate(new Date().toISOString().split('T')[0]);
      setPartyName('');
      setCategory(initialType === 'deposit' ? depositCategories[0] : withdrawalCategories[0]);
      setDescription('');
      setAttachment(undefined);
      setHasCommission(false);
      setCommissionAmount(0);
      setCommissionCurrency('IQD');
      setCommissionBearer('company');
    }
    setLocalRate(normalizeExchangeRate(exchangeRate, 1500));
    setCustomSwapAmount(null);
  }, [initialData, initialType, isOpen, exchangeRate]);

  if (!isOpen) return null;

  const activeRate = normalizeExchangeRate(localRate, normalizeExchangeRate(exchangeRate, 1500));

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    setCommissionCurrency(newCurr);
  };

  const handleTypeChange = (newType: TreasuryMovementType) => {
    setType(newType);
    if (!initialData) {
      const prefix = newType === 'deposit' ? 'TR-DEP' : 'TR-WTH';
      const year = new Date().getFullYear();
      const rand = Math.floor(100 + Math.random() * 900);
      setVoucherNo(`${prefix}-${year}-${rand}`);
      setCategory(newType === 'deposit' ? depositCategories[0] : withdrawalCategories[0]);
    }
  };

  const isSwap = category.includes('تصريف وتحويل عملة');
  const targetSwapCurrency: Currency = currency === 'USD' ? 'IQD' : 'USD';
  const defaultSwapAmount = currency === 'USD' 
    ? Math.round(amount * activeRate) 
    : Math.round((amount / activeRate) * 100) / 100;
  const targetSwapAmount = customSwapAmount !== null ? customSwapAmount : defaultSwapAmount;

  const executeSave = (andPrint: boolean = true) => {
    if (!voucherNo || amount <= 0 || !partyName.trim()) {
      setFormError('يرجى إدخال كافة الحقول المطلوبة وقيمة المبلغ بشكل صحيح.');
      return;
    }

    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }

    onSave({
      id: initialData?.id,
      voucherNo,
      companyId,
      type,
      category,
      amount: Number(amount) || 0,
      currency,
      exchangeRate: activeRate,
      swapTargetCurrency: isSwap ? targetSwapCurrency : undefined,
      swapTargetAmount: isSwap ? targetSwapAmount : undefined,
      hasCommission,
      commissionAmount: hasCommission ? Number(commissionAmount) : 0,
      commissionCurrency: hasCommission ? commissionCurrency : undefined,
      commissionBearer: hasCommission ? commissionBearer : undefined,
      date,
      partyName: partyName.trim(),
      description: description.trim(),
      attachment,
      recordedBy: initialData?.recordedBy || currentUser.name,
    }, andPrint);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSave(true);
  };

  const categories = type === 'deposit' ? depositCategories : withdrawalCategories;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed at Top */}
        <TreasuryModalHeader
          type={type}
          voucherNo={voucherNo}
          isEdit={!!initialData}
          onClose={onClose}
        />

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Form Body */}
          <div className="flex-1 overflow-y-auto max-h-[calc(88vh-130px)] p-4 sm:p-5 space-y-3.5 custom-scrollbar text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 1. Top Control Bar: Type, Currency, and Target Entity */}
            <TreasuryModalControlsBar
              type={type}
              onTypeChange={handleTypeChange}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              companyId={companyId}
              onCompanyIdChange={setCompanyId}
            />

            {/* 2. Primary Form Fields: Two Balanced Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <TreasuryFinancialForm
                amount={amount}
                setAmount={setAmount}
                currency={currency}
                type={type}
                category={category}
                setCategory={setCategory}
                categories={categories}
                date={date}
                setDate={setDate}
                voucherNo={voucherNo}
                setVoucherNo={setVoucherNo}
                isSwap={isSwap}
                localRate={localRate}
                setLocalRate={setLocalRate}
                activeRate={activeRate}
                targetSwapCurrency={targetSwapCurrency}
                targetSwapAmount={targetSwapAmount}
                setCustomSwapAmount={setCustomSwapAmount}
                onExchangeRateChange={onExchangeRateChange}
              />

              <TreasuryPartyArchivingCol
                type={type}
                partyName={partyName}
                setPartyName={setPartyName}
                description={description}
                setDescription={setDescription}
                attachment={attachment}
                setAttachment={setAttachment}
                setFormError={setFormError}
              />
            </div>

            {/* 3. Compact Commission Section */}
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
              partyLabel={type === 'deposit' ? 'المودع' : 'المستلم'}
              exchangeRate={activeRate}
            />

            {/* 4. Automated Accounting Journal Entry & Financial Impact Card */}
            <TreasuryAccountingEntry
              amount={Number(amount) || 0}
              currency={currency}
              type={type}
              hasCommission={hasCommission}
              commissionAmount={Number(commissionAmount) || 0}
              commissionCurrency={commissionCurrency}
              commissionBearer={commissionBearer}
              partyName={partyName}
            />
          </div>

          {/* Footer Buttons */}
          <TreasuryModalFooter
            initialData={initialData}
            onDelete={onDelete}
            onClose={onClose}
            onExecuteSave={executeSave}
            type={type}
          />
        </form>
      </div>
    </div>
  );
};
