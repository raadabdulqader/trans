import React, { useState, useEffect } from 'react';
import { X, CheckCheck } from 'lucide-react';
import { Transaction, Employee, Receipt, Currency } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { CurrencySelect } from '../ui/currency-select';

export interface QuickSettlementModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  employeeId: string;
  employees: Employee[];
  receipts: Receipt[];
  exchangeRate?: number;
  onClose: () => void;
  onSave: (amount: number, empId: string, date: string, notes: string, settlementCurrency?: Currency) => void;
}

export const QuickSettlementModal: React.FC<QuickSettlementModalProps> = ({
  isOpen,
  transaction,
  employeeId,
  employees,
  receipts,
  onClose,
  onSave,
}) => {
  const [empId, setEmpId] = useState(employeeId);
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const targetEmpId = empId || employeeId || transaction?.employeeId || '';
  const emp = employees.find(e => e.id === targetEmpId);

  // Calculate open advances for this bill & broker separated by IQD and USD
  const billAdvReceipts = transaction 
    ? receipts.filter(r => r.status !== 'cancelled' && r.billId === transaction.id && r.employeeId === targetEmpId)
    : [];
  const advIQD = billAdvReceipts.filter(r => r.type === 'advance' && (r.currency || 'IQD') === 'IQD').reduce((s, r) => s + r.amount, 0);
  const setIQD = billAdvReceipts.filter(r => r.type === 'settlement' && (r.currency || 'IQD') === 'IQD').reduce((s, r) => s + r.amount, 0);
  const openIQD = Math.max(0, advIQD - setIQD);

  const advUSD = billAdvReceipts.filter(r => r.type === 'advance' && r.currency === 'USD').reduce((s, r) => s + r.amount, 0);
  const setUSD = billAdvReceipts.filter(r => r.type === 'settlement' && r.currency === 'USD').reduce((s, r) => s + r.amount, 0);
  const openUSD = Math.max(0, advUSD - setUSD);

  useEffect(() => {
    if (transaction && isOpen) {
      setEmpId(employeeId || transaction.employeeId || '');
      const defaultCurr: Currency = openUSD > 0 && openIQD === 0 ? 'USD' : openIQD > 0 ? 'IQD' : (transaction.currency || 'IQD');
      setCurrency(defaultCurr);
      setAmount(defaultCurr === 'USD' ? openUSD : openIQD);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`تصفية وتسوية سلف البوليصة ${transaction.billNo}`);
    }
  }, [transaction, employeeId, isOpen, openIQD, openUSD]);

  if (!isOpen || !transaction) return null;

  const currentOpenForCurr = currency === 'USD' ? openUSD : openIQD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId || amount <= 0) return;
    onSave(amount, targetEmpId, date, notes, currency);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-purple-500/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-purple-400" />
            <span>تسوية حساب سلفة المخلص ({emp?.name || 'المخلص'})</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>السلف المفتوحة بهذه البوليصة:</span>
              <div className="font-mono font-bold text-rose-400 text-xs text-left" dir="ltr">
                {openIQD > 0 && <div>{formatCurrency(openIQD, 'IQD')}</div>}
                {openUSD > 0 && <div className="text-amber-400">{formatCurrency(openUSD, 'USD')}</div>}
                {openIQD === 0 && openUSD === 0 && <div className="text-emerald-400">0 (مصفاة)</div>}
              </div>
            </div>
            <div className="text-[10px] text-slate-500">
              البوليصة: {transaction.billNo}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold text-[11px]">عملة التسوية</label>
            <CurrencySelect
              value={currency}
              onValueChange={(newCurr) => {
                setCurrency(newCurr);
                setAmount(newCurr === 'USD' ? openUSD : openIQD);
              }}
              size="sm"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">المخلص المسوي حسابه</label>
            <select
              value={targetEmpId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-purple-400 focus:outline-none"
            >
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold text-xs">
                مبلغ التسوية المصفّى ({currency === 'USD' ? '$' : 'د.ع'}) *
              </label>
              {currentOpenForCurr > 0 && (
                <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                  المفتوح: {formatCurrency(currentOpenForCurr, currency)}
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-purple-400 font-mono font-bold focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">التاريخ</label>
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              placeholder="اختر التاريخ..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ملاحظات التسوية / أرقام وصولات الكمرك</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تمت التسوية بموجب وصولات كمرك أم قصر الرسمية رقم..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">إلغاء</button>
            <button type="submit" className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold">✅ تسوية الحساب</button>
          </div>
        </form>
      </div>
    </div>
  );
};
