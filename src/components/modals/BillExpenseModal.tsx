import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Paperclip,
  Trash2,
  CheckCircle2,
  Coins,
  DollarSign,
  Calendar,
  FileText,
  Printer,
  Building2,
  AlertCircle,
  Eye,
  Wallet,
  Sparkles,
  Receipt,
  UserCheck,
  Package,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Hash
} from 'lucide-react';
import { 
  Transaction, 
  TreasuryTransaction, 
  TreasuryAttachment, 
  AppUser, 
  Customer, 
  Employee, 
  Currency, 
  CompanyId, 
  COMPANIES 
} from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CurrencySelect } from '../ui/currency-select';

export interface BillExpenseCategory {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  defaultParty: string;
  defaultDesc: string;
  badgeColor: string;
}

export const BILL_EXPENSE_PRESETS: BillExpenseCategory[] = [
  {
    id: 'customs_duty',
    name: '🏛️ رسوم كمركية وضريبية',
    icon: '🏛️',
    shortDesc: 'رسم كمركي وضريبة استيراد نظامية',
    defaultParty: 'الهيئة العامة للكمارك - المنفذ الجمركي',
    defaultDesc: 'رسوم كمركية وضريبة استيراد نظامية للبوليصة',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  {
    id: 'port_fees',
    name: '⚓ عوائد موانئ ومناولة وتفريغ',
    icon: '⚓',
    shortDesc: 'أجور الميناء والأرصفة والمناولة',
    defaultParty: 'الشركة العامة لموانئ العراق',
    defaultDesc: 'أجور عوائد الميناء والأرصفة والمناولة',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20',
  },
  {
    id: 'sonar_inspection',
    name: '🔬 فحص كمركي وسونار ومختبر',
    icon: '🔬',
    shortDesc: 'كشف السونار والسيطرة النوعية',
    defaultParty: 'جهاز التقييس والسيطرة النوعية / محطة السونار',
    defaultDesc: 'أجور كشف السونار والفحص النوعي والمختبري',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'weighbridge',
    name: '⚖️ ميزان وأجور وزن الشاحنات',
    icon: '⚖️',
    shortDesc: 'رسوم القبان والوزن بالمنفذ',
    defaultParty: 'محطة الميزان الجمركي',
    defaultDesc: 'أجور وزن شاحنات البوليصة بالمنفذ',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20',
  },
  {
    id: 'attestation',
    name: '📑 تصاديق وتوكيلات وغرفة تجارة',
    icon: '📑',
    shortDesc: 'تصديق شهادة المنشأ والوكالات',
    defaultParty: 'غرفة التجارة / العدل',
    defaultDesc: 'أجور تصديق شهادة المنشأ والوكالات والمستندات',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20',
  },
  {
    id: 'demurrage',
    name: '📦 أرضيات وغرامات تأخير الحاويات',
    icon: '📦',
    shortDesc: 'مبيت الحاويات والخط الملاحي',
    defaultParty: 'محطة الحاويات / الخط الملاحي',
    defaultDesc: 'رسوم أرضيات ومبيت أو غرامات تأخير الحاويات',
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20',
  },
  {
    id: 'labor',
    name: '👷 عمال وعتالة وتحميل وتفريغ',
    icon: '👷',
    shortDesc: 'أجور العتالة وتفريغ الحاويات',
    defaultParty: 'مقاولة عمال التحميل والتفريغ',
    defaultDesc: 'أجور عتالة وتفريغ الحاويات وتنسيق البضاعة',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'overtime',
    name: '👮‍♂️ خفارة وكشف ومطابقة كمركية',
    icon: '👮‍♂️',
    shortDesc: 'أجور الخفارة والكشف الميداني',
    defaultParty: 'لجنة الكشف والمطابقة الجمركية',
    defaultDesc: 'أجور خفارة وإنجاز الكشف الجمركي الفوري',
    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-500/10 hover:bg-teal-500/20',
  },
  {
    id: 'petty_cash',
    name: '☕ نثريات وتسهيلات ومصاريف أخرى',
    icon: '☕',
    shortDesc: 'نثريات وتسهيلات ميدانية طارئة',
    defaultParty: 'المخلص الكمركي الميداني',
    defaultDesc: 'مصاريف نثرية وتسهيلات تشغيلية طارئة للبوليصة',
    badgeColor: 'border-slate-600 text-slate-300 bg-slate-800/60 hover:bg-slate-800',
  },
];

const BILL_EXPENSES_PRESETS_DEFAULT_CAT = BILL_EXPENSE_PRESETS[0].name;

interface BillExpenseModalProps {
  isOpen: boolean;
  transaction: Transaction;
  initialData?: TreasuryTransaction | null;
  customer?: Customer;
  employee?: Employee;
  currentUser: AppUser;
  exchangeRate?: number;
  onClose: () => void;
  onSave: (expenseData: Omit<TreasuryTransaction, 'id' | 'createdAt'> & { id?: string }, andPrint?: boolean) => void;
  onDelete?: (tx: TreasuryTransaction) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
}

export const BillExpenseModal: React.FC<BillExpenseModalProps> = ({
  isOpen,
  transaction,
  initialData,
  customer,
  employee,
  currentUser,
  exchangeRate = 1500,
  onClose,
  onSave,
  onDelete,
  onViewArchive,
}) => {
  const [currency, setCurrency] = useState<Currency>(transaction.currency === 'USD' ? 'USD' : 'IQD');
  const [voucherNo, setVoucherNo] = useState('');
  const [category, setCategory] = useState<string>(BILL_EXPENSES_PRESETS_DEFAULT_CAT);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const companyKey: CompanyId = transaction.companyId || 'naqaa_basra';
  const comp = COMPANIES[companyKey] || COMPANIES.naqaa_basra;

  // Initialize or load existing data
  useEffect(() => {
    if (initialData) {
      setVoucherNo(initialData.voucherNo);
      setCurrency(initialData.currency || 'IQD');
      setCategory(initialData.category || BILL_EXPENSE_PRESETS[0].name);
      setAmount(initialData.amount || 0);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPartyName(initialData.partyName || '');
      setDescription(initialData.description || '');
      setAttachment(initialData.attachment);
    } else {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setVoucherNo(`EXP-${year}-${rand}`);
      setCurrency(transaction.currency === 'USD' ? 'USD' : 'IQD');
      setCategory(BILL_EXPENSE_PRESETS[0].name);
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
      setPartyName(BILL_EXPENSE_PRESETS[0].defaultParty);
      setDescription(`مصاريف بوليصة كمركية ${transaction.billNo} - ${BILL_EXPENSE_PRESETS[0].defaultDesc}`);
      setAttachment(undefined);
    }
  }, [initialData, transaction, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: BillExpenseCategory) => {
    setCategory(preset.name);
    if (!partyName || BILL_EXPENSE_PRESETS.some(p => p.defaultParty === partyName)) {
      setPartyName(preset.defaultParty);
    }
    if (!description || description.startsWith('مصاريف بوليصة')) {
      setDescription(`بوليصة ${transaction.billNo}: ${preset.defaultDesc}`);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميغابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        date: new Date().toISOString().split('T')[0],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (andPrint: boolean = false) => {
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ المصروف بشكل صحيح');
      return;
    }

    if (!partyName.trim()) {
      alert('يرجى إدخال الجهة المستلمة أو الصادر لأمره');
      return;
    }

    onSave({
      id: initialData?.id,
      voucherNo: voucherNo || `EXP-${Date.now()}`,
      companyId: transaction.companyId || 'naqaa_basra',
      type: 'withdrawal',
      subAccount: 'bill_expenses',
      relatedBillNo: transaction.billNo,
      category,
      amount,
      currency,
      exchangeRate,
      date: date || new Date().toISOString().split('T')[0],
      partyName: partyName.trim() || 'مصاريف كمركية',
      description: description.trim() || `مصروف تشغيلي على البوليصة ${transaction.billNo}`,
      attachment,
      recordedBy: currentUser.name,
    }, andPrint);
  };

  // Approximate currency conversion for clarity
  const approximateConversion = currency === 'USD' 
    ? (amount > 0 ? `≈ ${(amount * exchangeRate).toLocaleString('ar-IQ')} د.ع` : null)
    : (amount > 0 && exchangeRate > 0 ? `≈ $${(amount / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-5xl xl:max-w-6xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ===================== Header ===================== */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shadow-inner shrink-0">
              💸
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {initialData ? 'تعديل سند مصروف كمركي / تشغيلي' : 'صرف مصروف كمركي / تشغيلي على البوليصة'}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shadow-xs">
                  بوليصة: {transaction.billNo}
                </span>
                {transaction.jobNumber && (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    معاملة: {transaction.jobNumber}
                  </span>
                )}
                <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border shadow-xs ${comp.badgeClass}`}>
                  {comp.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {customer ? customer.name : 'عميل نقدي'}
                </span>
                <span className="text-slate-600">•</span>
                <span>البضاعة: {transaction.goodsType || 'بضاعة عامة'}</span>
                {employee && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300/90 font-medium">المخلص: {employee.name}</span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  خصم مباشر من الصندوق
                </span>
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================== Bill Context KPI Strip ===================== */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-slate-500">رقم البوليصة</span>
              <span className="font-mono font-bold text-white truncate">{transaction.billNo}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-slate-500">الزبون / التاجر</span>
              <span className="font-bold text-white truncate">{customer?.name || 'غير محدد'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Package className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-slate-500">نوع البضاعة</span>
              <span className="font-medium text-slate-200 truncate">{transaction.goodsType || 'بضاعة عامة'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-slate-500">المخلص الكمركي</span>
              <span className="font-medium text-slate-200 truncate">{employee?.name || 'غير محدد'}</span>
            </div>
          </div>
        </div>

        {/* ===================== Two-Column Form Body ===================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* ----------------- COLUMN 1: Financial & Cashbox Details (المالية والخزينة) ----------------- */}
            <div className="space-y-5">
              
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  1. الحسابات والصندوق المالي (الخصم المباشر)
                </h3>
              </div>

              {/* Currency & Cashbox Selection */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>عملة الصرف والخزينة المخصوم منها:</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    سعر الصرف: 1$ = {exchangeRate.toLocaleString('ar-IQ')} د.ع
                  </span>
                </div>

                <CurrencySelect
                  value={currency}
                  onValueChange={setCurrency}
                  showSubText
                />

                {/* Cashbox Direct Impact Pill */}
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition ${
                  currency === 'USD' 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {currency === 'USD'
                      ? 'سيتم الخصم المباشر من [صندوق الدولار الأمريكي - USD]'
                      : 'سيتم الخصم المباشر من [صندوق الدينار العراقي - IQD]'}
                  </span>
                </div>
              </div>

              {/* Amount Box with Quick Increments */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>مبلغ المصروف المطلوب صرفه <span className="text-rose-400">*</span></span>
                  </label>
                  {approximateConversion && (
                    <span className="text-xs font-mono font-bold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {approximateConversion}
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
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className={`w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 font-mono text-2xl font-black focus:outline-none transition shadow-inner ${
                      currency === 'USD' 
                        ? 'text-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40' 
                        : 'text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
                    }`}
                  />
                  <div className="absolute left-4 top-3.5 flex items-center gap-1 pointer-events-none">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {currency === 'USD' ? 'USD $' : 'IQD د.ع'}
                    </span>
                  </div>
                </div>

                {/* Quick Add Pills */}
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                    إضافة مبالغ سريعة بنقرة واحدة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currency === 'IQD'
                      ? [25000, 50000, 100000, 250000, 500000, 1000000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(prev => (prev || 0) + val)}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-750 hover:border-slate-600 transition"
                          >
                            +{val.toLocaleString('ar-IQ')}
                          </button>
                        ))
                      : [20, 50, 100, 250, 500, 1000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(prev => (prev || 0) + val)}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-750 hover:border-slate-600 transition"
                          >
                            +${val}
                          </button>
                        ))}
                    {amount > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(0)}
                        className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition mr-auto"
                      >
                        تصفير المبلغ
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Voucher Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>تاريخ الصرف <span className="text-rose-400">*</span></span>
                  </label>
                  <DatePicker
                    value={date}
                    onChange={setDate}
                    placeholder="اختر تاريخ الصرف"
                    className="w-full bg-slate-900 border-slate-700 text-xs text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 text-xs flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>رقم السند الدفتري</span>
                  </label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    placeholder="EXP-XXXX"
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Accounting Impact Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/25 text-amber-200 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-black text-amber-400 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>الأثر المحاسبي والرقابي المعتمد للعملية:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      <strong>خصم فوري من الخزينة:</strong> سيتم خصم{' '}
                      <span className="font-mono font-bold text-white">
                        {amount > 0 ? formatCurrency(amount, currency) : `0 ${currency}`}
                      </span>{' '}
                      من {currency === 'USD' ? 'صندوق الدولار' : 'صندوق الدينار'} بالسند رقم{' '}
                      <span className="font-mono text-cyan-300">({voucherNo || 'EXP-AUTO'})</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      <strong>تحميل على كلفة البوليصة:</strong> يضاف المبلغ لتكاليف البوليصة (
                      <span className="font-mono text-white font-bold">{transaction.billNo}</span>) لضبط صافي أرباح العملية الكمركية بدقة.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      <strong>المسؤول عن التسجيل:</strong> يتم التوثيق باسم (
                      <span className="text-amber-300 font-semibold">{currentUser.name}</span>) لضمان متطلبات الرقابة والتدقيق المالي.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* ----------------- COLUMN 2: Classification, Beneficiary & Documentation (التصنيف والمستند) ----------------- */}
            <div className="space-y-5">
              
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  2. تصنيف المصروف، المستلم، والوصل
                </h3>
              </div>

              {/* Expense Category Preset Grid */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>تصنيف المصروف الكمركي / التشغيلي:</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    انقر على البند للتعبئة التلقائية
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {BILL_EXPENSE_PRESETS.map((preset) => {
                    const isSelected = category === preset.name;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl text-right transition border flex flex-col justify-between gap-1 text-xs relative ${
                          isSelected
                            ? 'bg-amber-500/20 text-white border-amber-500 ring-2 ring-amber-500/40 shadow-md'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold truncate text-[11px]">{preset.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">
                          {preset.shortDesc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom / Active Category Name Input */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    اسم التصنيف المعتمد للسند (يمكنك تخصيصه إذا أردت):
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
                    placeholder="اكتب تصنيف المصروف..."
                  />
                </div>
              </div>

              {/* Beneficiary / Payee */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>الجهة المستلمة / الصادر لأمره <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="مثلاً: كمرك أم قصر، شركة الموانئ، فحص سونار، مقاول العمال..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                />

                {/* Quick Party Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-500 text-[10px]">اقتراحات سريعة:</span>
                  {employee && (
                    <button
                      type="button"
                      onClick={() => setPartyName(employee.name)}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition"
                    >
                      المخلص: {employee.name}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPartyName('الهيئة العامة للكمارك - المنفذ الجمركي')}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition"
                  >
                    الكمارك
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartyName('الشركة العامة لموانئ العراق')}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition"
                  >
                    الموانئ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartyName('محطة الفحص وسونار أم قصر')}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition"
                  >
                    السونار
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartyName('إدارة الميزان الجمركي')}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition"
                  >
                    الميزان
                  </button>
                </div>
              </div>

              {/* Statement / Description */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>البيان / تفاصيل سبب الصرف</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل أو سبب الصرف ورقم الحاوية أو المنفذ أو رقم الإيصال..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Receipt Attachment & Archive Box */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>أرشفة وصل / مستند المصروف (صورة أو PDF):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 transition shadow-xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{attachment ? 'تغيير الوصل' : 'رفع الوصل'}</span>
                  </button>
                </div>

                {attachment ? (
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs shadow-inner">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-white font-mono font-bold block truncate">{attachment.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {(attachment.size / 1024).toFixed(1)} KB • {attachment.date || date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {onViewArchive && (
                        <button
                          type="button"
                          onClick={() => onViewArchive(attachment, `وصل مصروف ${voucherNo} - بوليصة ${transaction.billNo}`)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/30 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachment(undefined)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                        title="إزالة المرفق"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                      isDragging 
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span className="text-xs font-medium">اسحب وأفلت صورة الوصل هنا، أو انقر للاختيار</span>
                    <span className="text-[10px] text-slate-500">يدعم الصور وملفات PDF بحد أقصى 5 ميغابايت</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ===================== Modal Footer ===================== */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData)}
                className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>إلغاء السند واسترداد المبلغ للصندوق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 mr-auto sm:mr-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs transition border border-slate-750"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={amount <= 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition border ${
                amount <= 0
                  ? 'bg-slate-850 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 shadow-xs'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>حفظ وطباعة السند</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={amount <= 0}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition shadow-lg ${
                amount <= 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات بالسند' : 'صرف وخصم من الصندوق 💸'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
