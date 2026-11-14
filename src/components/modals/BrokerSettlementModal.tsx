import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCheck, Upload, Paperclip, CheckCircle2, Trash2 } from 'lucide-react';
import { Employee, Transaction, Receipt, TreasuryAttachment } from '../../types/customs';
import { formatCurrency, getEmployeeAdvances } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';

export interface BrokerSettlementModalProps {
  isOpen: boolean;
  employee: Employee | null;
  transactions: Transaction[];
  receipts: Receipt[];
  onClose: () => void;
  onSave: (data: { 
    employeeId: string; 
    billId: string; 
    amount: number; 
    date: string; 
    notes: string;
    attachment?: TreasuryAttachment;
  }) => void;
}

export const BrokerSettlementModal: React.FC<BrokerSettlementModalProps> = ({
  isOpen,
  employee,
  transactions,
  receipts,
  onClose,
  onSave,
}) => {
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<TreasuryAttachment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const adv = employee
    ? getEmployeeAdvances(employee.id, receipts)
    : { advances: 0, settled: 0, open: 0, advancesIQD: 0, settledIQD: 0, openIQD: 0, advancesUSD: 0, settledUSD: 0, openUSD: 0 };

  useEffect(() => {
    if (employee && isOpen) {
      const empBills = transactions.filter(t => t.employeeId === employee.id);
      setBillId(empBills[0]?.id || transactions[0]?.id || '');
      setAmount(adv.open > 0 ? adv.open : 1000000);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes(`تصفية وتسوية سلف بموجب وصولات كمركية رسمية للمخلص ${employee.name}`);
      setAttachment(undefined);
    }
  }, [employee, isOpen, transactions, adv.open]);

  if (!isOpen || !employee) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف يجب ألا يتجاوز 2MB');
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
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onSave({
      employeeId: employee.id,
      billId,
      amount: Number(amount) || 0,
      date,
      notes: notes.trim(),
      attachment,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-purple-500/10">
          <div className="flex items-center gap-2.5">
            <CheckCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white">تسوية سلفة (المسدد بالوصولات)</h2>
              <p className="text-xs text-slate-400">{employee.name} • تصفية العهدة المالية وأرشفة الوصل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Status */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">السلف المفتوحة الحالية للمخلص:</span>
            <div className="font-mono font-bold text-left text-sm" dir="ltr">
              <span className="text-rose-400 block">{formatCurrency(adv.openIQD, 'IQD')}</span>
              {adv.openUSD > 0 && (
                <span className="text-amber-400 text-xs block">+ {formatCurrency(adv.openUSD, 'USD')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">البوليصة المراد تصفيتها</label>
            <select
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-purple-400 focus:outline-none"
            >
              <option value="">-- تسوية سلف عامة للمخلص --</option>
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
                <label className="block text-slate-300 font-semibold text-xs">المبلغ المسدد بالوصولات (د.ع) *</label>
                {amount > 0 && (
                  <span className="text-[11px] font-mono font-bold text-purple-400" dir="ltr">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-purple-400 font-mono font-bold text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">تاريخ التسوية *</label>
              <DatePicker
                value={date}
                onChange={(d) => setDate(d)}
                placeholder="اختر تاريخ التسوية..."
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">بيان التسوية / أرقام وصولات الكمرك</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: وصولات كمرك أم قصر الرسمية رقم 45892 ورسوم فحص..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Archiving Section: Upload Settled Receipt (أرشفة الوصل المسدد) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-purple-400" />
                <span>أرشفة الوصل المسدد (صورة الوصل أو PDF):</span>
              </span>

              {attachment && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم إرفاق الوصل</span>
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
                className="w-full py-3 border border-dashed border-slate-700 hover:border-purple-500 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-purple-300 transition bg-slate-900/40"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>اضغط لرفع وأرشفة وصل الكمرك المسدد</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-2 truncate">
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold">
                    📎
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-white truncate max-w-[200px]">{attachment.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{(attachment.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-xs text-purple-400 hover:underline"
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition">إلغاء</button>
            <button type="submit" className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20">
              ✅ اعتماد التسوية وأرشفة الوصل
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
