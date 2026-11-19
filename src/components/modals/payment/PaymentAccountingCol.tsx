import React from 'react';
import { Currency } from '../../../types/customs';
import { formatCurrency } from '../../../utils/storage';
import { DatePicker } from '../../ui/date-picker';

interface PaymentAccountingColProps {
  date: string;
  setDate: (d: string) => void;
  netCashboxIQD: number;
  netCashboxUSD: number;
  effectiveCreditInRefCurr: number;
  newRemainingRef: number;
  billCurr: Currency;
  isMixed: boolean;
  notes: string;
  setNotes: (n: string) => void;
}

export const PaymentAccountingCol: React.FC<PaymentAccountingColProps> = ({
  date,
  setDate,
  netCashboxIQD,
  netCashboxUSD,
  effectiveCreditInRefCurr,
  newRemainingRef,
  billCurr,
  isMixed,
  notes,
  setNotes,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
      <div>
        <label className="block text-slate-300 font-semibold mb-1">التاريخ</label>
        <DatePicker
          value={date}
          onChange={(d) => setDate(d)}
          placeholder="اختر التاريخ..."
        />
      </div>

      {/* Live Accounting Summary Box */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">انعكاس صندوق الدينار:</span>
          <strong className="font-mono text-emerald-400 text-xs" dir="ltr">
            +{formatCurrency(netCashboxIQD, 'IQD')}
          </strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">انعكاس صندوق الدولار:</span>
          <strong className="font-mono text-cyan-400 text-xs" dir="ltr">
            +{formatCurrency(netCashboxUSD, 'USD')}
          </strong>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">الخصم من ذمة الزبون:</span>
          <strong className="font-mono text-white text-xs" dir="ltr">
            -{formatCurrency(effectiveCreditInRefCurr, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}
          </strong>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">المتبقي الجديد على الزبون:</span>
          <strong className={`font-mono text-xs ${newRemainingRef === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
            {formatCurrency(newRemainingRef, billCurr === 'USD' && !isMixed ? 'USD' : 'IQD')}
          </strong>
        </div>
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">ملاحظات الدفعة</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};
