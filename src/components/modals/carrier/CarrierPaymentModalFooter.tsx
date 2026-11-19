'use client';

import React from 'react';
import { Save, Printer } from 'lucide-react';

export interface CarrierPaymentModalFooterProps {
  onClose: () => void;
  amount: number;
  setShouldPrintOnSubmit: (val: boolean) => void;
}

export const CarrierPaymentModalFooter: React.FC<CarrierPaymentModalFooterProps> = ({
  onClose,
  amount,
  setShouldPrintOnSubmit,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
      <span className="text-[11px] text-slate-400">
        يُقيد هذا السند في الصندوق ويُخصم مباشرة من الرصيد المتبقي لشركة النقل.
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          onClick={() => setShouldPrintOnSubmit(false)}
          disabled={amount <= 0}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>حفظ فقط</span>
        </button>
        <button
          type="submit"
          onClick={() => setShouldPrintOnSubmit(true)}
          disabled={amount <= 0}
          className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>حفظ وطباعة القيد</span>
        </button>
      </div>
    </div>
  );
};
