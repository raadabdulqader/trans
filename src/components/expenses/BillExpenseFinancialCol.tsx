import React from 'react';
import { Coins, Wallet, ShieldCheck, DollarSign, Calendar, Hash } from 'lucide-react';
import { Currency, Transaction, AppUser } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';
import { CurrencySelect } from '../ui/currency-select';
import { DatePicker } from '../ui/date-picker';

interface BillExpenseFinancialColProps {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  exchangeRate: number;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  date: string;
  setDate: (d: string) => void;
  voucherNo: string;
  setVoucherNo: (v: string) => void;
  transaction: Transaction;
  currentUser: AppUser;
  approximateConversion: string | null;
}

export const BillExpenseFinancialCol: React.FC<BillExpenseFinancialColProps> = ({
  currency,
  setCurrency,
  exchangeRate,
  amount,
  setAmount,
  date,
  setDate,
  voucherNo,
  setVoucherNo,
  transaction,
  currentUser,
  approximateConversion,
}) => {
  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Coins className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          1. الحسابات والصندوق المالي (الخصم المباشر)
        </h3>
      </div>

      {/* Currency & Cashbox Selection */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span>عملة الصرف والخزينة المخصوم منها:</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
            سعر الصرف: 1$ = {exchangeRate.toLocaleString('ar-IQ')} د.ع
          </span>
        </div>

        <CurrencySelect
          value={currency}
          onValueChange={setCurrency}
          showSubText
        />

        {/* Cashbox Direct Impact Pill */}
        <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition ${
          currency === 'USD' 
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            {currency === 'USD'
              ? 'سيتم الخصم المباشر من [صندوق الدولار الأمريكي - USD]'
              : 'سيتم الخصم المباشر من [صندوق الدينار العراقي - IQD]'}
          </span>
        </div>
      </div>

      {/* Amount Box with Quick Increments */}
      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>مبلغ المصروف المطلوب صرفه <span className="text-rose-400">*</span></span>
          </label>
          {approximateConversion && (
            <span className="text-xs font-mono font-bold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              {approximateConversion}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            required
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            placeholder="0"
            className={`w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 font-mono text-2xl font-black focus:outline-none transition shadow-inner ${
              currency === 'USD' 
                ? 'text-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40' 
                : 'text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
            }`}
          />
          <div className="absolute left-4 top-3.5 flex items-center gap-1 pointer-events-none">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {currency === 'USD' ? 'USD $' : 'IQD د.ع'}
            </span>
          </div>
        </div>

        {/* Quick Add Pills */}
        <div>
          <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
            إضافة مبالغ سريعة بنقرة واحدة:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currency === 'IQD'
              ? [25000, 50000, 100000, 250000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount((prev) => (prev || 0) + val)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-750 hover:border-slate-600 transition cursor-pointer"
                  >
                    +{val.toLocaleString('ar-IQ')}
                  </button>
                ))
              : [20, 50, 100, 250, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount((prev) => (prev || 0) + val)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-750 hover:border-slate-600 transition cursor-pointer"
                  >
                    +${val}
                  </button>
                ))}
            {amount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(0)}
                className="px-3 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition mr-auto cursor-pointer"
              >
                تصفير المبلغ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date & Voucher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-slate-200 font-bold mb-1.5 text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>تاريخ الصرف <span className="text-rose-400">*</span></span>
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="اختر تاريخ الصرف"
            className="w-full bg-slate-900 border-slate-700 text-xs text-white rounded-xl"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1.5 text-xs flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>رقم السند الدفتري</span>
          </label>
          <input
            type="text"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder="EXP-XXXX"
            className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs font-bold focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Accounting Impact Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/25 text-amber-200 text-xs space-y-2.5">
        <div className="flex items-center gap-2 font-black text-amber-400 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>الأثر المحاسبي والرقابي المعتمد للعملية:</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed font-sans">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>خصم فوري من الخزينة:</strong> سيتم خصم{' '}
              <span className="font-mono font-bold text-white">
                {amount > 0 ? formatCurrency(amount, currency) : `0 ${currency}`}
              </span>{' '}
              من {currency === 'USD' ? 'صندوق الدولار' : 'صندوق الدينار'} بالسند رقم{' '}
              <span className="font-mono text-cyan-300">({voucherNo || 'EXP-AUTO'})</span>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>تحميل على كلفة البوليصة:</strong> يضاف المبلغ لتكاليف البوليصة (
              <span className="font-mono text-white font-bold">{transaction.billNo}</span>) لضبط صافي أرباح العملية الكمركية بدقة.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>المسؤول عن التسجيل:</strong> يتم التوثيق باسم (
              <span className="text-amber-300 font-semibold">{currentUser.name}</span>) لضمان متطلبات الرقابة والتدقيق المالي.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
