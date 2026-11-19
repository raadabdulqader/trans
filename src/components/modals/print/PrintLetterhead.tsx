'use client';

import React from 'react';
import { CompanyInfo } from '../../../types/customs';

export interface PrintLetterheadProps {
  comp: CompanyInfo;
  todayStr: string;
  docRef: string;
}

export const PrintLetterhead: React.FC<PrintLetterheadProps> = ({ comp, todayStr, docRef }) => {
  return (
    <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
      <div className="text-right space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          <h1 className="text-2xl font-black text-slate-900">{comp.fullName}</h1>
        </div>
        <p className="text-xs text-slate-600 font-semibold">{comp.slogan}</p>
        <p className="text-[11px] text-slate-500">
          {comp.address} • هاتف: {comp.phone} • {comp.email}
        </p>
        <div className="text-[10px] text-emerald-800 font-bold font-mono">
          {comp.regNo} • حساب صندوق الشركة المالي المشترك
        </div>
      </div>
      <div className="text-left font-mono text-xs text-slate-600 space-y-1" dir="ltr">
        <div className="font-bold text-slate-900 text-sm">{comp.shortName}</div>
        <div>Date: {todayStr}</div>
        <div>Doc Ref: {docRef}</div>
      </div>
    </div>
  );
};
