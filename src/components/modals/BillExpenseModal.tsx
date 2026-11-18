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
  Receipt
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
  defaultParty: string;
  defaultDesc: string;
  badgeColor: string;
}

export const BILL_EXPENSE_PRESETS: BillExpenseCategory[] = [
  {
    id: 'customs_duty',
    name: '🏛️ رسوم كمركية وضريبية',
    defaultParty: 'الهيئة العامة للكمارك - المنفذ الجمركي',
    defaultDesc: 'رسوم كمركية وضريبة استيراد نظامية للبوليصة',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'port_fees',
    name: '⚓ عوائد موانئ ومناولة وتفريغ',
    defaultParty: 'الشركة العامة لموانئ العراق',
    defaultDesc: 'أجور عوائد الميناء والأرصفة والمناولة',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'sonar_inspection',
    name: '🔬 فحص كمركي وسونار ومختبر',
    defaultParty: 'جهاز التقييس والسيطرة النوعية / محطة السونار',
    defaultDesc: 'أجور كشف السونار والفحص النوعي والمختبري',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    id: 'weighbridge',
    name: '⚖️ ميزان وأجور وزن الشاحنات',
    defaultParty: 'محطة الميزان الجمركي',
    defaultDesc: 'أجور وزن شاحنات البوليصة بالمنفذ',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'attestation',
    name: '📑 تصاديق وتوكيلات وغرفة تجارة',
    defaultParty: 'غرفة التجارة / العدل',
    defaultDesc: 'أجور تصديق شهادة المنشأ والوكالات والمستندات',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'demurrage',
    name: '📦 أرضيات وغرامات تأخير الحاويات',
    defaultParty: 'محطة الحاويات / الخط الملاحي',
    defaultDesc: 'رسوم أرضيات ومبيت أو غرامات تأخير الحاويات',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  {
    id: 'labor',
    name: '👷 عمال وعتالة وتحميل وتفريغ',
    defaultParty: 'مقاولة عمال التحميل والتفريغ',
    defaultDesc: 'أجور عتالة وتفريغ الحاويات وتنسيق البضاعة',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'overtime',
    name: '👮‍♂️ خفارة وكشف ومطابقة كمركية',
    defaultParty: 'لجنة الكشف والمطابقة الجمركية',
    defaultDesc: 'أجور خفارة وإنجاز الكشف الجمركي الفوري',
    badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  {
    id: 'petty_cash',
    name: '☕ نثريات وتسهيلات ومصاريف أخرى',
    defaultParty: 'المخلص الكمركي الميداني',
    defaultDesc: 'مصاريف نثرية وتسهيلات تشغيلية طارئة للبوليصة',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
  },
];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى هو 5 ميغابايت.');
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
    e.target.value = '';
  };

  const handleSubmit = (andPrint: boolean = false) => {
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ المصروف بشكل صحيح');
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center text-lg">
              💸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {initialData ? 'تعديل سند مصروف على البوليصة' : 'صرف مصروف كمركي / تشغيلي على البوليصة'}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                  {transaction.billNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {comp.shortName} • {customer ? `العميل: ${customer.name}` : ''} • خصم مباشر من الصندوق
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">

          {/* Currency Selection via Shadcn Select with RTL */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-bold text-xs">
                عملة الصرف (تحدد الصندوق المخصوم منه):
              </label>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                سعر الصرف: 1$ = {exchangeRate.toLocaleString('ar-IQ')} د.ع
              </span>
            </div>
            <CurrencySelect
              value={currency}
              onValueChange={setCurrency}
              showSubText
            />
          </div>

          {/* Quick Expense Preset Chips */}
          <div className="space-y-1.5">
            <span className="block text-slate-400 font-semibold text-[11px]">
              اختر تصنيف المصروف الكمركي / التشغيلي:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BILL_EXPENSE_PRESETS.map((preset) => {
                const isSelected = category === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition border text-right flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-xs ring-1 ring-amber-500/30'
                        : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount and Voucher No Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                مبلغ المصروف ({currency === 'USD' ? 'دولار أمريكي $' : 'دينار عراقي د.ع'}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-base font-bold focus:outline-none ${
                    currency === 'USD' ? 'text-cyan-400 focus:border-cyan-500' : 'text-emerald-400 focus:border-emerald-500'
                  }`}
                />
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500 pointer-events-none">
                  {currency === 'USD' ? 'USD' : 'IQD'}
                </span>
              </div>

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {currency === 'IQD'
                  ? [25000, 50000, 100000, 250000, 500000, 1000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(prev => (prev || 0) + val)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                      >
                        +{val.toLocaleString('ar-IQ')}
                      </button>
                    ))
                  : [20, 50, 100, 250, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(prev => (prev || 0) + val)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                      >
                        +${val}
                      </button>
                    ))}
                {amount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(0)}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 transition"
                  >
                    تصفير
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                رقم السند الدفتري
              </label>
              <input
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Party Name & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                الجهة المستلمة / الصادر لأمره <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="مثلاً: كمرك أم قصر، شركة الموانئ، فحص سونار..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                <span className="text-slate-500">مقترحات:</span>
                {employee && (
                  <button
                    type="button"
                    onClick={() => setPartyName(employee.name)}
                    className="hover:text-amber-300 underline"
                  >
                    المخلص: {employee.name}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPartyName('الهيئة العامة للكمارك')}
                  className="hover:text-amber-300 underline"
                >
                  الكمارك
                </button>
                <button
                  type="button"
                  onClick={() => setPartyName('الشركة العامة للموانئ')}
                  className="hover:text-amber-300 underline"
                >
                  الموانئ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                تاريخ الصرف <span className="text-rose-400">*</span>
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="اختر تاريخ الصرف"
                className="w-full bg-slate-950 border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Description / Statement */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-xs">
              البيان / تفاصيل المصروف
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل أو سبب الصرف ورقم الحاوية أو المنفذ..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Attachment / Receipt Document */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                <span>إرفاق وصل / مستند المصروف (صورة أو PDF):</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-700 transition"
              >
                <Upload className="w-3 h-3" />
                <span>{attachment ? 'تغيير المستند' : 'رفع المستند'}</span>
              </button>
            </div>

            {attachment ? (
              <div className="p-2 bg-slate-900 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="text-white font-mono">{attachment.name}</span>
                  <span className="text-[10px] text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="flex items-center gap-2">
                  {onViewArchive && (
                    <button
                      type="button"
                      onClick={() => onViewArchive(attachment, `وصل مصروف ${voucherNo}`)}
                      className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 text-[10px] font-bold"
                    >
                      معاينة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAttachment(undefined)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="إزالة المرفق"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
                لم يتم إرفاق وصل حتى الآن. يفضل أرشفة صورة الوصل لسلامة التدقيق والرقابة المالية.
              </div>
            )}
          </div>

          {/* Cashbox Impact Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Wallet className="w-4 h-4 shrink-0" />
              <span>الأثر المحاسبي المباشر على الخزينة والصندوق:</span>
            </div>
            <p className="text-[11px] text-amber-300/90 leading-relaxed font-sans">
              سيتم قيد هذا المبلغ كسند صرف رسمي (<strong className="font-mono text-white">{voucherNo}</strong>) وخصمه فوراً من{' '}
              <strong className="text-white">{currency === 'USD' ? 'صندوق الدولار الأمريكي' : 'صندوق الدينار العراقي'}</strong>، مع تسجيله في تكاليف البوليصة رقم (<strong className="font-mono text-white">{transaction.billNo}</strong>) لضبط أرباح العملية.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData)}
                className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إلغاء واسترداد المبلغ للصندوق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold text-xs transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={amount <= 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border ${
                amount <= 0
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>حفظ وطباعة السند</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={amount <= 0}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
                amount <= 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{initialData ? 'حفظ التعديلات' : 'صرف وخصم من الصندوق 💸'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const BILL_EXPENSES_PRESETS_DEFAULT_CAT = BILL_EXPENSE_PRESETS[0].name;
