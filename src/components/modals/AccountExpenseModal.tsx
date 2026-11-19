import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Printer } from 'lucide-react';
import { TreasuryTransaction, TreasuryAttachment, Employee, AppUser, CompanyId, Currency } from '../../types/customs';
import { SubAccountType, SALARY_TYPES, DAILY_CATEGORIES, RENT_TYPES } from '../accounts/modal/AccountExpensePresets';
import { AccountExpenseCategoryPills } from '../accounts/modal/AccountExpenseCategoryPills';
import { AccountExpenseFinancialForm } from '../accounts/modal/AccountExpenseFinancialForm';
import { AccountExpenseClassificationForm } from '../accounts/modal/AccountExpenseClassificationForm';

export type { SubAccountType };
export { SALARY_TYPES, DAILY_CATEGORIES, RENT_TYPES };

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
        setExpenseSubCategory(SALARY_TYPES[0]);
        setPartyName(targetEmp?.name || '');
        setSelectedEmpId(targetEmp?.id || '');
        setDescription(`صرف راتب شهر ${currentMonth} للموظف ${targetEmp?.name || ''}`);
      } else if (defaultSubAccount === 'rents') {
        setAmount(1500000);
        setExpenseSubCategory(RENT_TYPES[0]);
        setPartyName('مالك العقار');
        setDescription(`دفعة إيجار عن ${currentMonth}`);
      } else {
        setAmount(75000);
        setExpenseSubCategory(DAILY_CATEGORIES[0]);
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
      setExpenseSubCategory(SALARY_TYPES[0]);
      setPartyName(targetEmp?.name || '');
      setSelectedEmpId(targetEmp?.id || '');
      setDescription(`صرف راتب شهر ${currentMonth} للموظف ${targetEmp?.name || ''}`);
      if (!initialData) setAmount(targetEmp?.baseSalary && targetEmp.baseSalary > 0 ? targetEmp.baseSalary : 1000000);
    } else if (type === 'rents') {
      setExpenseSubCategory(RENT_TYPES[0]);
      setPartyName('مالك العقار');
      setDescription(`دفعة إيجار عن ${currentMonth}`);
      if (!initialData) setAmount(1500000);
    } else {
      setExpenseSubCategory(DAILY_CATEGORIES[0]);
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
      type: 'withdrawal',
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
        <AccountExpenseCategoryPills
          subAccount={subAccount}
          onChange={handleSubAccountChange}
        />

        {/* Form Body - 2 Columns */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <AccountExpenseFinancialForm
              companyId={companyId}
              setCompanyId={setCompanyId}
              currency={currency}
              setCurrency={setCurrency}
              amount={amount}
              setAmount={setAmount}
              date={date}
              setDate={setDate}
              period={period}
              setPeriod={setPeriod}
              subAccount={subAccount}
              employees={employees}
              selectedEmpId={selectedEmpId}
              onEmployeeSelect={handleEmployeeSelect}
              partyName={partyName}
              setPartyName={setPartyName}
            />

            <AccountExpenseClassificationForm
              subAccount={subAccount}
              expenseSubCategory={expenseSubCategory}
              setExpenseSubCategory={setExpenseSubCategory}
              description={description}
              setDescription={setDescription}
              attachment={attachment}
              setAttachment={setAttachment}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />
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
