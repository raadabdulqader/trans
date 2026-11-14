import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Upload, Paperclip, Trash2, CheckCircle2, Printer, Building2, DollarSign, AlertCircle, RefreshCw, Coins, FileText } from 'lucide-react';
import { TreasuryTransaction, TreasuryMovementType, TreasuryAttachment, AppUser, CompanyId, COMPANIES, Currency } from '../../types/customs';
import { normalizeExchangeRate } from '../../utils/storage';
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
  const [commissionCurrency, setCommissionCurrency] = useState<Currency>('USD');
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
      setCommissionCurrency(initialData.commissionCurrency || initialData.currency || 'USD');
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
      setCommissionCurrency('USD');
      setCommissionBearer('company');
    }
    setLocalRate(normalizeExchangeRate(exchangeRate, 1500));
    setCustomSwapAmount(null);
  }, [initialData, initialType, isOpen, exchangeRate]);

  if (!isOpen) return null;

  const activeRate = normalizeExchangeRate(localRate, normalizeExchangeRate(exchangeRate, 1500));

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed at Top */}
        <div className={`px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 ${
          type === 'deposit' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold ${
              type === 'deposit' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'تعديل قيد الصندوق' : type === 'deposit' ? 'إيداع نقدي في صندوق الشركة' : 'سحب نقدي من صندوق الشركة'}
              </h2>
              <span className="text-[11px] text-slate-400">سند قبض / صرف نقدي رسمي مع أرشفة الوصل</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container - Compact layout */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          
          {/* Form Body */}
          <div className="p-3.5 sm:p-4 space-y-3 text-xs">
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
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

            {/* Top Quick Controls: Type Toggle & Currency Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTypeChange('deposit')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                    type === 'deposit'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>إيداع نقدي (وارد +)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('withdrawal')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                    type === 'withdrawal'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>سحب نقدي (صادر -)</span>
                </button>
              </div>

              {/* Currency Toggle (IQD vs USD) */}
              <div className="p-1.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-300 font-semibold shrink-0 pr-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>العملة:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => setCurrency('IQD')}
                    className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border ${
                      currency === 'IQD'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🇮🇶 دينار (IQD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border ${
                      currency === 'USD'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🇺🇸 دولار ($)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Two Balanced Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* ================= العمود الأول: البيانات المالية ورقم السند ================= */}
              <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    البيانات المالية ورقم السند
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">القسم الأول</span>
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold text-[11px] mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    <span>الجهة / الشركة المستفيدة من القيد</span>
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none text-xs"
                  >
                    <option value="shared">🏛️ صندوق مشترك / رأس المال الموحد للشركتين</option>
                    <option value="naqaa_basra">🏢 شركة نقاء البصرة للتخليص الكمركي</option>
                    <option value="sawt_aljanoub">🏢 شركة صوت الجنوب للتخليص الكمركي</option>
                  </select>
                </div>

                {/* Voucher No & Date */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم السند *</label>
                    <input
                      type="text"
                      required
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono font-bold focus:border-emerald-500 focus:outline-none text-xs"
                    />
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

                {/* Amount & Category side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold text-[11px]">
                        المبلغ {currency === 'USD' ? '($)' : '(د.ع)'} *
                      </label>
                      {amount > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-300" dir="ltr">
                          {currency === 'USD' ? `$${amount.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(amount)} د.ع`}
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
                      className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono font-extrabold text-xs focus:outline-none ${
                        type === 'deposit' ? 'text-emerald-400 focus:border-emerald-500' : 'text-rose-400 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تصنيف الحركة *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      {categories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FX Currency Swap Manual Input or USD Exchange Rate Bar */}
                {(isSwap || currency === 'USD') && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-200 text-[11px] flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>سعر الصرف (1$ أو 100$):</span>
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
                        className="w-24 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">
                        (1$ = {activeRate.toLocaleString('ar-IQ')} د.ع)
                      </span>
                    </div>
                    {isSwap ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">المقابل ({targetSwapCurrency === 'IQD' ? 'د.ع' : '$'}):</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={targetSwapAmount === 0 ? '' : targetSwapAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSwapAmount(val === '' ? 0 : Number(val));
                          }}
                          className="w-28 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="text-slate-300 font-mono">
                        يعادل: <strong className="text-emerald-400">{new Intl.NumberFormat('ar-IQ').format(Math.round(amount * activeRate))} د.ع</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================= العمود الثاني: أطراف السند والبيان والأرشفة ================= */}
              <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    الطرف والبيان وأرشفة الوصل
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">القسم الثاني</span>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">البيان والتفاصيل</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="شرح سبب وتفاصيل حركة الصندوق..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none text-xs"
                  />
                </div>

                {/* Receipt Archiving Section */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                      <Paperclip className="w-3 h-3 text-cyan-400" />
                      <span>أرشفة وصل الإيداع أو السحب (صورة أو PDF):</span>
                    </span>

                    {attachment && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مرفق</span>
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
                      className="w-full py-1.5 border border-dashed border-slate-700 hover:border-emerald-500/80 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition bg-slate-950/60 text-[11px]"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>اضغط لرفع وأرشفة صورة الوصل المالي</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-950 border border-slate-700/80">
                      <div className="flex items-center gap-2 truncate">
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.dataUrl}
                            alt="وصل مؤرشف"
                            className="h-7 w-7 object-cover rounded-lg border border-slate-700"
                          />
                        ) : (
                          <div className="h-7 w-7 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                            PDF
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-white truncate max-w-[160px] text-[11px]">{attachment.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                        >
                          تغيير
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachment(undefined)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
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
              partyLabel={type === 'deposit' ? 'المودع' : 'المستلم'}
              exchangeRate={activeRate}
            />
          </div>

        {/* Footer Buttons - Fixed and Always Visible at Bottom */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
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
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => executeSave(false)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold rounded-xl transition text-xs"
              title="حفظ القيد فقط دون فتح شاشة الطباعة"
            >
              حفظ فقط
            </button>
            <button
              type="submit"
              className={`px-5 py-1.5 font-bold rounded-xl text-slate-950 transition shadow-lg text-xs flex items-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
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
