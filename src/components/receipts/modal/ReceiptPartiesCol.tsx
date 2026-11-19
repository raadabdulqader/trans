import React from 'react';
import { DollarSign } from 'lucide-react';
import { Currency, Receipt, Transaction, Customer, Employee, COMPANIES } from '../../../types/customs';
import { CurrencySelect } from '../../ui/currency-select';

interface ReceiptPartiesColProps {
  currency: Currency;
  onCurrencySwitch: (curr: Currency) => void;
  type: Receipt['type'];
  onTypeChange: (type: Receipt['type']) => void;
  billId: string;
  onBillChange: (billId: string) => void;
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  currentCust: Customer | null | undefined;
  employeeId: string;
  setEmployeeId: (empId: string) => void;
}

export const ReceiptPartiesCol: React.FC<ReceiptPartiesColProps> = ({
  currency,
  onCurrencySwitch,
  type,
  onTypeChange,
  billId,
  onBillChange,
  transactions,
  customers,
  employees,
  currentCust,
  employeeId,
  setEmployeeId,
}) => {
  return (
    <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
      <div className="pb-1.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
        <span>بيانات السند والأطراف</span>
        <span className="text-[10px] text-slate-500">القسم الأول</span>
      </div>

      {/* Currency Selection via Shadcn Select with RTL */}
      <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
        <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5 shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>عملة السند:</span>
        </span>
        <div className="flex-1 max-w-[220px]">
          <CurrencySelect
            value={currency}
            onValueChange={onCurrencySwitch}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">نوع السند / الوصل *</label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none text-xs"
          >
            <option value="payment">💳 قبض دفعة زبون</option>
            <option value="advance">🏦 صرف سلفة للمخلص</option>
            <option value="settlement">✅ تسوية سلفة مخلص</option>
          </select>
        </div>

        {type === 'payment' ? (
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">الزبون المسدد</label>
            <input
              type="text"
              readOnly
              value={currentCust?.name || 'اختر البوليصة أولاً'}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-400 font-semibold text-xs truncate"
            />
          </div>
        ) : (
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">المخلص المستلم *</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
            >
              <option value="">-- اختر المخلص --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم البوليصة المرتبطة *</label>
        <select
          required
          value={billId}
          onChange={(e) => onBillChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none text-xs"
        >
          <option value="">-- اختر البوليصة --</option>
          {transactions.map(t => {
            const c = customers.find(cust => cust.id === t.customerId);
            const comp = COMPANIES[t.companyId || 'naqaa_basra'];
            return (
              <option key={t.id} value={t.id}>
                [{comp?.shortName}] {t.billNo} - {c?.name || 'بدون زبون'}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
