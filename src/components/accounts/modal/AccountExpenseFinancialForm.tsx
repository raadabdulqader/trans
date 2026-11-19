import React from 'react';
import { Coins } from 'lucide-react';
import { CompanyId, Currency, Employee } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { DatePicker } from '../../ui/date-picker';
import { CurrencySelect } from '../../ui/currency-select';
import { SubAccountType } from './AccountExpensePresets';

interface AccountExpenseFinancialFormProps {
  companyId: CompanyId | 'shared';
  setCompanyId: (v: CompanyId | 'shared') => void;
  currency: Currency;
  setCurrency: (v: Currency) => void;
  amount: number;
  setAmount: (v: number) => void;
  date: string;
  setDate: (v: string) => void;
  period: string;
  setPeriod: (v: string) => void;
  subAccount: SubAccountType;
  employees: Employee[];
  selectedEmpId: string;
  onEmployeeSelect: (empId: string) => void;
  partyName: string;
  setPartyName: (v: string) => void;
}

export const AccountExpenseFinancialForm: React.FC<AccountExpenseFinancialFormProps> = ({
  companyId,
  setCompanyId,
  currency,
  setCurrency,
  amount,
  setAmount,
  date,
  setDate,
  period,
  setPeriod,
  subAccount,
  employees,
  selectedEmpId,
  onEmployeeSelect,
  partyName,
  setPartyName,
}) => {
  return (
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
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <label className="block text-slate-300 font-semibold text-[11px]">
            العملة والمبلغ المصروف من الصندوق <span className="text-rose-400">*</span>
          </label>
          <div className="w-[180px]">
            <CurrencySelect
              value={currency}
              onValueChange={setCurrency}
              size="xs"
            />
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
            onChange={(e) => onEmployeeSelect(e.target.value)}
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
  );
};
