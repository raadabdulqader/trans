import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Coins, 
  Printer, 
  Building2 
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
import { BILL_EXPENSE_PRESETS, BillExpenseCategory } from '../expenses/BillExpensePresets';
import { BillExpenseContextStrip } from '../expenses/BillExpenseContextStrip';
import { BillExpenseFinancialCol } from '../expenses/BillExpenseFinancialCol';
import { BillExpenseCategoryCol } from '../expenses/BillExpenseCategoryCol';

export { BILL_EXPENSE_PRESETS };
export type { BillExpenseCategory };

export interface BillExpenseModalProps {
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
  const [category, setCategory] = useState<string>(BILL_EXPENSE_PRESETS[0].name);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);

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
    if (!partyName || BILL_EXPENSE_PRESETS.some((p) => p.defaultParty === partyName)) {
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

  const handleSubmit = (andPrint: boolean = false) => {
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ المصروف بشكل صحيح');
      return;
    }

    if (!partyName.trim()) {
      alert('يرجى إدخال الجهة المستلمة أو الصادر لأمره');
      return;
    }

    onSave(
      {
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
      },
      andPrint
    );
  };

  // Approximate currency conversion for clarity
  const approximateConversion =
    currency === 'USD'
      ? amount > 0
        ? `≈ ${(amount * exchangeRate).toLocaleString('ar-IQ')} د.ع`
        : null
      : amount > 0 && exchangeRate > 0
      ? `≈ $${(amount / exchangeRate).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-5xl xl:max-w-6xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700 cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Context KPI Strip */}
        <BillExpenseContextStrip
          transaction={transaction}
          customer={customer}
          employee={employee}
        />

        {/* Two-Column Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Column 1: Financial & Cashbox */}
            <BillExpenseFinancialCol
              currency={currency}
              setCurrency={setCurrency}
              exchangeRate={exchangeRate}
              amount={amount}
              setAmount={setAmount}
              date={date}
              setDate={setDate}
              voucherNo={voucherNo}
              setVoucherNo={setVoucherNo}
              transaction={transaction}
              currentUser={currentUser}
              approximateConversion={approximateConversion}
            />

            {/* Column 2: Classification, Beneficiary & Documentation */}
            <BillExpenseCategoryCol
              category={category}
              setCategory={setCategory}
              onSelectPreset={handleSelectPreset}
              partyName={partyName}
              setPartyName={setPartyName}
              employee={employee}
              description={description}
              setDescription={setDescription}
              attachment={attachment}
              setAttachment={setAttachment}
              onViewArchive={onViewArchive}
              voucherNo={voucherNo}
              billNo={transaction.billNo}
              date={date}
              processFile={processFile}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData)}
                className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
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
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs transition border border-slate-750 cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={amount <= 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition border cursor-pointer ${
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
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition shadow-lg cursor-pointer ${
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
