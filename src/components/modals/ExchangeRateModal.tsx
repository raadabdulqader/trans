import React, { useState, useEffect } from 'react';
import { X, DollarSign, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/storage';

interface ExchangeRateModalProps {
  isOpen: boolean;
  currentRate: number; // e.g. 1500 (IQD per 1 USD)
  onClose: () => void;
  onSaveRate: (newRate: number) => void;
}

const COMMON_IRAQ_RATES = [
  1480, // 148,000
  1500, // 150,000
  1510, // 151,000
  1520, // 152,000
  1530, // 153,000
  1550, // 155,000
];

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({
  isOpen,
  currentRate,
  onClose,
  onSaveRate,
}) => {
  const [oneDollarRate, setOneDollarRate] = useState<string>('1500');
  const [hundredRate, setHundredRate] = useState<string>('150000');

  useEffect(() => {
    if (isOpen) {
      const rate = currentRate > 0 ? currentRate : 1500;
      setOneDollarRate(String(rate));
      setHundredRate(String(Math.round(rate * 100)));
    }
  }, [isOpen, currentRate]);

  if (!isOpen) return null;

  const parsedOneDollar = Number(oneDollarRate) || 0;
  const parsedHundred = Number(hundredRate) || 0;

  // Determine effective rate per 1 USD
  const ratePerDollar =
    parsedOneDollar > 0
      ? parsedOneDollar
      : parsedHundred > 0
      ? parsedHundred < 10000
        ? parsedHundred // In case user typed 1500 into the 100$ box
        : parsedHundred / 100
      : 1500;

  const handleOneDollarChange = (val: string) => {
    setOneDollarRate(val);
    const num = Number(val);
    if (num > 0) {
      setHundredRate(String(Math.round(num * 100)));
    } else {
      setHundredRate('');
    }
  };

  const handleHundredChange = (val: string) => {
    setHundredRate(val);
    const num = Number(val);
    if (num > 0) {
      // If user typed something like 150000 -> 1$ = 1500
      if (num >= 10000) {
        setOneDollarRate(String(Math.round((num / 100) * 100) / 100));
      } else {
        setOneDollarRate(String(num));
      }
    } else {
      setOneDollarRate('');
    }
  };

  const handleSelectPreset = (presetOneDollar: number) => {
    setOneDollarRate(String(presetOneDollar));
    setHundredRate(String(presetOneDollar * 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratePerDollar <= 0) return;
    onSaveRate(ratePerDollar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>تحويل العملة وسعر الصرف المعتمد</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  USD / IQD
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ينعكس تلقائياً على كافة النوافذ والفواتير والصندوق ويُحفظ عند إغلاق البرنامج
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Dual Synchronized Inputs: 1$ and 100$ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Input 1: 1 USD */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30">
              <label className="block text-cyan-300 font-bold text-[11px] flex items-center justify-between">
                <span>سعر الـ 1 دولار ($1):</span>
                <RefreshCw className="w-3 h-3 text-cyan-400" />
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={oneDollarRate}
                  onChange={(e) => handleOneDollarChange(e.target.value)}
                  placeholder="1500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-[10px] font-bold text-slate-400">
                  د.ع / 1$
                </span>
              </div>
            </div>

            {/* Input 2: 100 USD */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30">
              <label className="block text-emerald-300 font-bold text-[11px] flex items-center justify-between">
                <span>سعر الـ 100 دولار ($100):</span>
                <span className="text-[10px] font-mono text-emerald-400">دفتر</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={hundredRate}
                  onChange={(e) => handleHundredChange(e.target.value)}
                  placeholder="150000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-[10px] font-bold text-slate-400">
                  د.ع / 100$
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-semibold">
              خيارات سريعة لأسعار الصرف الشائعة (1$ / 100$):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_IRAQ_RATES.map((preset) => {
                const presetHundred = preset * 100;
                const isSelected = Math.abs(ratePerDollar - preset) < 0.01;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-2 px-2 rounded-xl border text-center font-mono text-xs font-bold transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{preset} د.ع</span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ({new Intl.NumberFormat('en-US').format(presetHundred)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Conversion Preview Card */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>معاينة التحويل الفوري وفق السعر المعتمد:</span>
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">1 دولار ($1)</span>
                <strong className="text-cyan-400">{formatCurrency(ratePerDollar, 'IQD')}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">100 دولار ($100)</span>
                <strong className="text-emerald-400">{formatCurrency(ratePerDollar * 100, 'IQD')}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">1,000 دولار ($1,000)</span>
                <strong className="text-amber-400">{formatCurrency(ratePerDollar * 1000, 'IQD')}</strong>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>حفظ وتعميم على كافة النوافذ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
