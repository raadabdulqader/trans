import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  Upload, 
  Paperclip, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  Building2, 
  DollarSign, 
  AlertCircle, 
  RefreshCw, 
  Coins, 
  FileText,
  Calendar,
  User,
  ShieldCheck,
  ArrowRightLeft,
  Landmark
} from 'lucide-react';
import { TreasuryTransaction, TreasuryMovementType, TreasuryAttachment, AppUser, CompanyId, COMPANIES, Currency } from '../../types/customs';
import { normalizeExchangeRate, formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CommissionSection } from '../ui/CommissionSection';

interface TreasuryModalProps {
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('حجم الملف يجب ألا يتجاوز 2 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
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
        <div className={`px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 ${
          type === 'deposit' 
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900' 
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
              type === 'deposit' 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                : 'bg-rose-500 text-white shadow-rose-500/20'
            }`}>
              {type === 'deposit' ? <ArrowDownRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {initialData ? 'تعديل قيد الصندوق' : type === 'deposit' ? 'إيداع نقدي في صندوق الشركة' : 'سحب نقدي من صندوق الشركة'}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-bold" dir="ltr">
                  {voucherNo || 'سند جديد'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                سند قبض / صرف نقدي رسمي مع التوجيه الدفتري المزدوج والأرشفة الإلكترونية
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          
          {/* Form Body - Smoothly Scrollable with Fixed Height */}
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
                  className="text-rose-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 1. Top Unified Control Bar: Type, Currency, and Target Entity */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
              {/* Type Switch */}
              <div className="md:col-span-5 grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTypeChange('deposit')}
                  className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                    type === 'deposit'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>إيداع نقدي (وارد +)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('withdrawal')}
                  className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                    type === 'withdrawal'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>سحب نقدي (صادر -)</span>
                </button>
              </div>

              {/* Currency Switch */}
              <div className="md:col-span-3 grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('IQD')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition ${
                    currency === 'IQD'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-3 h-3 text-emerald-400" />
                  <span>دينار (IQD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition ${
                    currency === 'USD'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3 h-3 text-cyan-400" />
                  <span>دولار ($)</span>
                </button>
              </div>

              {/* Target Entity / Company Box */}
              <div className="md:col-span-4 relative flex items-center">
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:border-cyan-500 focus:outline-none text-xs"
                >
                  <option value="shared">🏛️ صندوق مشترك / رأس المال الموحد</option>
                  <option value="naqaa_basra">🏢 شركة نقاء البصرة للتخليص</option>
                  <option value="sawt_aljanoub">🏢 شركة صوت الجنوب للتخليص</option>
                </select>
              </div>
            </div>

            {/* 2. Primary Form Fields: Two Balanced Symmetrical Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              
              {/* ================= العمود الأول: البيانات المالية ورقم السند ================= */}
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>البيانات المالية وتصنيف الحركة</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">القسم المالي</span>
                </div>

                {/* Amount Hero Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                      <span>مبلغ السند المطلوب</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    {amount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20" dir="ltr">
                        {formatCurrency(amount, currency)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
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
                      placeholder="أدخل المبلغ هنا..."
                      className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono font-black text-sm tracking-wide focus:outline-none transition ${
                        type === 'deposit' 
                          ? 'text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                          : 'text-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                      }`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      {currency === 'USD' ? 'USD $' : 'IQD د.ع'}
                    </span>
                  </div>
                </div>

                {/* Category & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تصنيف الحركة *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-medium focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      {categories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ الحركة *</label>
                    <DatePicker
                      value={date}
                      onChange={(d) => setDate(d)}
                      placeholder="اختر تاريخ الحركة..."
                    />
                  </div>
                </div>

                {/* Voucher Number (Auto-Generated / Editable) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم السند الدفتري *</label>
                  <input
                    type="text"
                    required
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none text-xs"
                  />
                </div>

                {/* FX Swap / Exchange Rate Details */}
                {(isSwap || currency === 'USD') && (
                  <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-200 text-[11px] space-y-2 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>سعر الصرف (1$):</span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={localRate === 0 ? '' : localRate}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = val === '' ? 0 : Number(val);
                            setLocalRate(num);
                            setCustomSwapAmount(null);
                            if (num >= 100 && onExchangeRateChange) {
                              onExchangeRateChange(normalizeExchangeRate(num, 1500), true);
                            }
                          }}
                          className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none text-center"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">د.ع</span>
                      </div>

                      {!isSwap && (
                        <div className="text-slate-300 font-mono text-[11px]">
                          المعادل بالدينار: <strong className="text-emerald-400 font-bold" dir="ltr">{new Intl.NumberFormat('ar-IQ').format(Math.round(amount * activeRate))} د.ع</strong>
                        </div>
                      )}
                    </div>

                    {isSwap && (
                      <div className="flex items-center justify-between border-t border-cyan-500/20 pt-1.5 text-[11px]">
                        <span className="font-bold text-cyan-300">المقابل في الصندوق ({targetSwapCurrency === 'IQD' ? 'د.ع' : '$'}):</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={targetSwapAmount === 0 ? '' : targetSwapAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSwapAmount(val === '' ? 0 : Number(val));
                          }}
                          className="w-32 bg-slate-950 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none text-center"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================= العمود الثاني: أطراف السند والبيان والأرشفة ================= */}
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>بيانات الطرف والأرشفة الإلكترونية</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">القسم التوثيقي</span>
                </div>

                {/* Party Name */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    {type === 'deposit' ? 'اسم المودع / الطرف الدافع *' : 'اسم المستلم / الجهة الصارفة *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder={type === 'deposit' ? 'مثال: المدير العام، مصرف بغداد، السيد جاسم...' : 'مثال: شركة الكهرباء، الموظف، صاحب العقار...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">البيان والتفاصيل الإيضاحية</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="شرح سبب وتفاصيل حركة الصندوق..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none resize-none text-xs"
                  />
                </div>

                {/* Receipt Archiving Section */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span>أرشفة وصل الإيداع أو السحب (صورة أو PDF):</span>
                    </span>

                    {attachment && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مؤرشف</span>
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {!attachment ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 border border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-300 transition bg-slate-950/60 text-[11px] group"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>اضغط لرفع وأرشفة صورة الوصل المالي / الإشعار البنكي</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-950 border border-slate-700/80">
                      <div className="flex items-center gap-2 truncate">
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.dataUrl}
                            alt="وصل مؤرشف"
                            className="h-8 w-8 object-cover rounded-lg border border-slate-700"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                            PDF
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-white truncate max-w-[160px] text-[11px]">{attachment.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{attachment.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 rounded-md font-bold"
                        >
                          تغيير
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachment(undefined)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded-md hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
            {amount > 0 && (
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
            )}
          </div>

          {/* Footer Buttons - Fixed and Always Visible at Bottom */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xl">
            <div>
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData)}
                  className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف القيد</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => executeSave(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold rounded-xl transition text-xs"
                title="حفظ القيد فقط دون فتح شاشة الطباعة"
              >
                حفظ فقط
              </button>
              <button
                type="submit"
                className={`px-5 py-2 font-black rounded-xl text-slate-950 transition shadow-lg text-xs flex items-center gap-2 ${
                  type === 'deposit'
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
                }`}
                title="حفظ القيد بالصندوق وفتح السند للطباعة فوراً"
              >
                <Printer className="w-4 h-4" />
                <span>حفظ وطباعة القيد</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
