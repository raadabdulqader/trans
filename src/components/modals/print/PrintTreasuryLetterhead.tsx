'use client';

import React from 'react';
import { CompanyInfo } from '../../../types/customs';

export interface PrintTreasuryLetterheadProps {
  comp: CompanyInfo | null;
  todayStr: string;
  docRef?: string;
}

export const PrintTreasuryLetterhead: React.FC<PrintTreasuryLetterheadProps> = ({
  comp,
  todayStr,
  docRef = 'TREASURY-REPORT',
}) => {
  return (
    <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
      <div className="text-right space-y-1">
        {comp ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <h1 className="text-2xl font-black text-slate-900">{comp.fullName}</h1>
            </div>
            <p className="text-xs text-slate-600 font-semibold">{comp.slogan}</p>
            <p className="text-[11px] text-slate-500">{comp.address} • هاتف: {comp.phone}</p>
            <p className="text-[10px] text-emerald-800 font-bold font-mono">
              حساب صندوق الشركة المشترك • رأس مال موحد مع شركة صوت الجنوب
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <h1 className="text-xl font-black text-slate-900">
                الإدارة المالية المشتركة • حساب صندوق الشركة الرئيسي
              </h1>
            </div>
            <p className="text-xs text-slate-700 font-bold">
              شركة نقاء البصرة للتخليص الكمركي & شركة صوت الجنوب للخدمات اللوجستية
            </p>
            <p className="text-[11px] text-slate-500">
              رأس مال موحد وصندوق مالي مشترك • البصرة - ميناء أم قصر - المنافذ الحدودية
            </p>
          </>
        )}
      </div>
      <div className="text-left font-mono text-xs text-slate-600 space-y-1" dir="ltr">
        <div className="font-bold text-slate-900 text-sm">{comp ? comp.shortName : 'JOINT TREASURY'}</div>
        <div>Date: {todayStr}</div>
        <div>Doc Ref: {docRef}</div>
      </div>
    </div>
  );
};
