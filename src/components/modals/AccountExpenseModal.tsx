import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Paperclip, 
  Trash2, 
  CheckCircle2, 
  Coins, 
  Users, 
  Building2, 
  Coffee, 
  Calendar,
  FileText,
  DollarSign,
  Printer
} from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment, Employee, AppUser, CompanyId, COMPANIES, Currency } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';

export type SubAccountType = 'salaries' | 'daily' | 'rents';

interface AccountExpenseModalProps {
  isOpen: boolean;
  defaultSubAccount?: SubAccountType;
  initialData?: TreasuryTransaction | null;
  initialEmployee?: Employee | null;
  employees: Employee[];
  currentUser: AppUser;
  onClose: () => void;
  onSave: (txData: Omit<TreasuryTransaction, 'id' | 'createdAt'> & { id?: string }, andPrint?: boolean) => void;
  onDelete?: (tx: TreasuryTransaction) => void;
}

export const AccountExpenseModal: React.FC<AccountExpenseModalProps> = ({
  isOpen,
  defaultSubAccount = 'salaries',
  initialData,
  initialEmployee,
  employees,
  currentUser,
  onClose,
  onSave,
  onDelete,
}) => {
  const [subAccount, setSubAccount] = useState<SubAccountType>(defaultSubAccount);
  const [companyId, setCompanyId] = useState<CompanyId | 'shared'>('shared');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [voucherNo, setVoucherNo] = useState('');
  const [amount, setAmount] = useState<number>(500000);
  const [date, setDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [expenseSubCategory, setExpenseSubCategory] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Salaries Presets
  const salaryTypes = [
    'راتب شهري أساسي',
    'مكافأة تشجيعية / حافز إنجاز',
    'أجور ساعات إضافية',
    'بدل نقل ومواصلات',
    'مستحقات نهاية خدمة / تسوية',
  ];

  // Daily Expenses Presets
  const dailyCategories = [
    'ضيافة وبوفيه ومأكولات',
    'وقود وزيوت ونقل داخلي',
    'قرطاسية ومطبوعات ومستلزمات مكتب',
    'صيانة مكاتب ونظافة ومياه',
    'اشتراكات إنترنت وهاتف واتصالات',
    'رسوم طوابع وتصاديق ومعاملات يومية',
    'نثريات ومصاريف طارئة',
    'أخرى (مصروف يومي)',
  ];

  // Rents Presets
  const rentTypes = [
    'إيجار المقر الرئيسي / المكتب',
    'إيجار مستودع ومخزن بضائع',
    'إيجار ساحة الحاويات والميناء',
    'إيجار كراج سيارات وشاحنات',
    'رسوم مرافق وخدمات عقارية',
    'أخرى (إيجار عقار)',
  ];

  useEffect(() => {
    if (initialData) {
      setVoucherNo(initialData.voucherNo);
      setAmount(initialData.amount);
      setCurrency(initialData.currency || 'IQD');
      setDate(initialData.date);
      setPartyName(initialData.partyName);
      setDescription(initialData.description);
      setAttachment(initialData.attachment);
      setPeriod(initialData.period || '');
      setCompanyId(initialData.companyId || 'shared');
      
      if (initialData.subAccount) {
        setSubAccount(initialData.subAccount as SubAccountType);
      } else if (initialData.category.includes('راتب') || initialData.category.includes('رواتب')) {
        setSubAccount('salaries');
      } else if (initialData.category.includes('إيجار') || initialData.category.includes('ايجار')) {
        setSubAccount('rents');
      } else {
        setSubAccount('daily');
      }
      setExpenseSubCategory(initialData.category);
    } else {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setVoucherNo(`VCH-${year}-${rand}`);
      setDate(new Date().toISOString().split('T')[0]);
      setSubAccount(defaultSubAccount);
      setCurrency('IQD');
      setAttachment(undefined);
      setSelectedEmpId('');

      const currentMonth = new Intl.DateTimeFormat('ar-IQ', { month: 'long', year: 'numeric' }).format(new Date());
      setPeriod(currentMonth);

      if (defaultSubAccount === 'salaries') {
        const targetEmp = initialEmployee || employees[0];
        setAmount(targetEmp?.baseSalary && targetEmp.baseSalary > 0 ? targetEmp.baseSalary : 1000000);
        setExpenseSubCategory(salaryTypes[0]);
        setPartyName(targetEmp?.name || '');
        setSelectedEmpId(targetEmp?.id || '');
        setDescription(`صرف راتب شهر ${currentMonth} للموظف ${targetEmp?.name || ''}`);
      } else if (defaultSubAccount === 'rents') {
        setAmount(1500000);
        setExpenseSubCategory(rentTypes[0]);
        setPartyName('مالك العقار');
        setDescription(`دفعة إيجار عن ${currentMonth}`);
      } else {
        setAmount(75000);
        setExpenseSubCategory(dailyCategories[0]);
        setPartyName('نثريات المكتب');
        setDescription('مصاريف يومية ونثرية نقدية');
      }
    }
  }, [initialData, initialEmployee, isOpen, defaultSubAccount, employees]);

  if (!isOpen) return null;

  const handleSubAccountChange = (type: SubAccountType) => {
    setSubAccount(type);
    const currentMonth = new Intl.DateTimeFormat('ar-IQ', { month: 'long', year: 'numeric' }).format(new Date());
    setPeriod(currentMonth);

    if (type === 'salaries') {
      const targetEmp = initialEmployee || employees[0];
      setExpenseSubCategory(salaryTypes[0]);
      setPartyName(targetEmp?.name || '');
      setSelectedEmpId(targetEmp?.id || '');
      setDescription(`صرف راتب شهر ${currentMonth} للموظف ${targetEmp?.name || ''}`);
      if (!initialData) setAmount(targetEmp?.baseSalary && targetEmp.baseSalary > 0 ? targetEmp.baseSalary : 1000000);
    } else if (type === 'rents') {
      setExpenseSubCategory(rentTypes[0]);
      setPartyName('مالك العقار');
      setDescription(`دفعة إيجار عن ${currentMonth}`);
      if (!initialData) setAmount(1500000);
    } else {
      setExpenseSubCategory(dailyCategories[0]);
      setPartyName('نثريات المكتب');
      setDescription('مصاريف يومية ونثرية نقدية');
      if (!initialData) setAmount(75000);
    }
  };

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setPartyName(emp.name);
      if (emp.baseSalary && emp.baseSalary > 0) {
        setAmount(emp.baseSalary);
      }
      setDescription(`صرف راتب شهر ${period || ''} للموظف ${emp.name}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الملف كبير جداً، الحد الأقصى 8 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const executeSave = (andPrint: boolean = true) => {
    if (!amount || amount <= 0 || !partyName) return;

    // Build clear category description
    let fullCategory = '';
    if (subAccount === 'salaries') {
      fullCategory = `رواتب: ${expenseSubCategory}`;
    } else if (subAccount === 'rents') {
      fullCategory = `إيجارات: ${expenseSubCategory}`;
    } else {
      fullCategory = `مصاريف يومية: ${expenseSubCategory}`;
    }

    onSave({
      id: initialData?.id,
      voucherNo,
      companyId,
      type: 'withdrawal', // Automatically recorded as withdrawal from company treasury
      category: fullCategory,
      amount: Number(amount) || 0,
      currency,
      date,
      partyName,
      description: description || fullCategory,
      attachment,
      subAccount,
      period,
      recordedBy: initialData?.recordedBy || currentUser.name,
    }, andPrint);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSave(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
              {subAccount === 'salaries' ? '👥' : subAccount === 'rents' ? '🏢' : '☕'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {initialData ? 'تعديل قيد صرف بالحسابات' : 'إضافة قيد صرف جديد (خصم من الصندوق)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-amber-300 border border-slate-700">
                  {voucherNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                يرتبط القيد مباشرة بصندوق الشركة ويخصم من الرصيد النقدي كحركة صرف رسمية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-account Selector Pills */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/30 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSubAccountChange('salaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subAccount === 'salaries'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>رواتب وأجور الكادر</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubAccountChange('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subAccount === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>مصاريف يومية ونثرية</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubAccountChange('rents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subAccount === 'rents'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>إيجارات ومرافق</span>
          </button>
        </div>

        {/* Form Body - 2 Columns */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* Column 1: Financial & Party info */}
            <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  المبلغ والجهة المستفيدة
                </span>
                <span className="text-[10px] text-slate-500">حركة صرف نقدية</span>
              </div>

              {/* Company Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  الشركة التابع لها المصروف / القيد
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="shared">🏛️ مصاريف مشتركة (صندوق الشركة الموحد)</option>
                  <option value="naqaa_basra">🏢 شركة نقاء البصرة للتخليص الكمركي</option>
                  <option value="sawt_aljanoub">🏢 شركة صوت الجنوب للتخليص الكمركي</option>
                </select>
              </div>

              {/* Currency Selection + Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold text-[11px]">
                    العملة والمبلغ المصروف من الصندوق <span className="text-rose-400">*</span>
                  </label>
                  <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrency('IQD')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                        currency === 'IQD'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇮🇶 دينار (د.ع)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                        currency === 'USD'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇺🇸 دولار ($)
                    </button>
                  </div>
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
                    placeholder={currency === 'USD' ? 'أدخل المبلغ بالدولار ($)' : 'أدخل المبلغ بالدينار العراقي'}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-base font-bold focus:outline-none ${
                      currency === 'USD' ? 'text-cyan-400 focus:border-cyan-500' : 'text-rose-400 focus:border-rose-500'
                    }`}
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                    {currency === 'USD' ? 'USD ($)' : 'د.ع'}
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(currency === 'USD'
                    ? [50, 100, 250, 500, 1000, 2000]
                    : [25000, 50000, 100000, 250000, 500000, 1000000]
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold transition ${
                        amount === preset
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {formatCurrency(preset, currency)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ الصرف</label>
                  <DatePicker
                    value={date}
                    onChange={(d) => setDate(d)}
                    placeholder="اختر تاريخ الصرف..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">عن شهر / فترة</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="مثال: تشرين الأول 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Specific Party Selection */}
              {subAccount === 'salaries' ? (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold text-[11px]">
                    الموظف / المستفيد <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- اختر من قائمة الموظفين والمخلصين --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} {emp.jobTitle ? `• [${emp.jobTitle}]` : ''} {emp.baseSalary ? `(${new Intl.NumberFormat('ar-IQ').format(emp.baseSalary)} د.ع)` : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="أو اكتب اسم الموظف يدوياً إذا لم يكن بالقائمة"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ) : subAccount === 'rents' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    اسم المؤجر / العقار <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="مثال: شركة العقارات المتحدة / صاحب الملك"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    الجهة المستلمة للمصروف <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="مثال: كافتيريا، محطة وقود، مكتبة..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Column 2: Classification, Notes & Receipt Archiving */}
            <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  تصنيف البند والأرشيف
                </span>
                <span className="text-[10px] text-slate-500">أرشفة الوصل</span>
              </div>

              {/* Sub-category selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  نوع البند التفصيلي <span className="text-rose-400">*</span>
                </label>
                <select
                  value={expenseSubCategory}
                  onChange={(e) => setExpenseSubCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  {subAccount === 'salaries' && salaryTypes.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                  {subAccount === 'daily' && dailyCategories.map((dc, i) => (
                    <option key={i} value={dc}>{dc}</option>
                  ))}
                  {subAccount === 'rents' && rentTypes.map((rt, i) => (
                    <option key={i} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">البيان / الوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات تفصيلية حول عملية الصرف..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Attachment / Receipt Archiving */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px] flex items-center justify-between">
                  <span>أرشفة وصل أو فاتورة الصرف</span>
                  <span className="text-[10px] text-slate-500">صور أو مستندات أو PDF</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {attachment ? (
                  <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs text-white font-medium truncate">{attachment.name}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          {(attachment.size / 1024).toFixed(1)} KB • مؤرشف وجاهز للمعاينة
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(undefined)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-slate-200 text-xs transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>رفع وأرشفة وصل الدفع أو الفاتورة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>المسجل:</span>
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
              </div>
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => executeSave(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold rounded-xl transition text-xs"
                title="حفظ القيد فقط دون فتح شاشة الطباعة"
              >
                حفظ فقط
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5"
                title="حفظ قيد الصرف وخصمه من الصندوق ثم فتح السند للطباعة فوراً"
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
