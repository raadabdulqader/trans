import React, { useState, useEffect } from 'react';
import { X, Coins } from 'lucide-react';
import { Employee, Transaction } from '../../types/customs';
import { DatePicker } from '../ui/date-picker';

export interface BrokerAdvanceModalProps {
  isOpen: boolean;
  employee: Employee | null;
  transactions: Transaction[];
  onClose: () => void;
  onSave: (data: { employeeId: string; billId: string; amount: number; date: string; notes: string }) => void;
}

export const BrokerAdvanceModal: React.FC<BrokerAdvanceModalProps> = ({
  isOpen,
  employee,
  transactions,
  onClose,
  onSave,
}) => {
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState<number>(1000000);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (employee && isOpen) {
      const empBills = transactions.filter(t => t.employeeId === employee.id);
      setBillId(empBills[0]?.id || transactions[0]?.id || '');
      setAmount(1000000);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`صرف سلفة للمخلص ${employee.name}`);
    }
  }, [employee, isOpen, transactions]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onSave({
      employeeId: employee.id,
      billId,
      amount: Number(amount) || 0,
      date,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">صرف سلفة للمخلص</h2>
              <p className="text-xs text-slate-400">{employee.name} • صرف نقدية وتسجيل قيد الصندوق</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">البوليصة المستهدفة</label>
            <select
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
            >
              <option value="">-- سلفة عامة بدون ربط ببوليصة --</option>
              {transactions.map(t => (
                <option key={t.id} value={t.id}>
                  {t.billNo} {t.goodsType ? `(${t.goodsType})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold text-xs">مبلغ السلفة (د.ع) *</label>
                {amount > 0 && (
                  <span className="text-[11px] font-mono font-bold text-amber-400" dir="ltr">
                    {new Intl.NumberFormat('ar-IQ').format(amount)} د.ع
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">تاريخ الصرف *</label>
              <DatePicker
                value={date}
                onChange={(d) => setDate(d)}
                placeholder="اختر تاريخ الصرف..."
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">البيان وملاحظات الصرف</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: سلفة رسوم كشف، أرضيات موانئ، فحص مختبري..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">إلغاء</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20">
              صرف السلفة وتسجيل القيد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
