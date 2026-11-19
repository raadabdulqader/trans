import React from 'react';
import { Coins, DollarSign, Receipt as ReceiptIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/storage';

interface ReceiptsMetricsCardsProps {
  totalCollectionsIQD: number;
  totalCollectionsUSD: number;
  totalAdvancesIQD: number;
  totalAdvancesUSD: number;
  totalCommissionsCount: number;
  totalCommissionsSumUSD: number;
  totalCommissionsSumIQD: number;
  exchangeRate: number;
}

export const ReceiptsMetricsCards: React.FC<ReceiptsMetricsCardsProps> = ({
  totalCollectionsIQD,
  totalCollectionsUSD,
  totalAdvancesIQD,
  totalAdvancesUSD,
  totalCommissionsCount,
  totalCommissionsSumUSD,
  totalCommissionsSumIQD,
  exchangeRate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* IQD Collections */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>مقبوضات الزبائن (دينار عراقي)</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            IQD
          </span>
        </div>
        <div className="text-xl font-black text-emerald-400 mt-2 font-mono" dir="ltr">
          {formatCurrency(totalCollectionsIQD, 'IQD')}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          دفعات أولى وسداد حسابات بالدينار
        </div>
      </div>

      {/* USD Collections */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>مقبوضات الزبائن (دولار أمريكي)</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            USD $
          </span>
        </div>
        <div className="text-xl font-black text-cyan-400 mt-2 font-mono" dir="ltr">
          {formatCurrency(totalCollectionsUSD, 'USD')}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span>المعادل:</span>
          <strong className="text-cyan-300 font-mono">
            ≈ {new Intl.NumberFormat('ar-IQ').format(totalCollectionsUSD * exchangeRate)} د.ع
          </strong>
        </div>
      </div>

      {/* Advances */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ReceiptIcon className="w-4 h-4 text-amber-400" />
            <span>إجمالي سلف المخلصين الميدانية</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            سلف كمركية
          </span>
        </div>
        <div className="text-xl font-black text-amber-400 mt-2 font-mono" dir="ltr">
          {formatCurrency(totalAdvancesIQD, 'IQD')}
          {totalAdvancesUSD > 0 && (
            <span className="text-sm font-bold text-cyan-300 mr-2"> + ${totalAdvancesUSD.toLocaleString()}</span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          سلف مصروفة لأجور الكمرك والموانئ
        </div>
      </div>

      {/* Commissions Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="text-amber-400">🏷️</span>
            <span>عمولات التحويل والصرافة</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {totalCommissionsCount} حركة
          </span>
        </div>
        <div className="text-xl font-black text-amber-400 mt-2 font-mono" dir="ltr">
          {totalCommissionsSumUSD > 0 ? (
            <div className="flex flex-col">
              <span>${totalCommissionsSumUSD.toLocaleString()}</span>
              {totalCommissionsSumIQD > 0 && (
                <span className="text-xs text-slate-300 font-normal">
                  + {formatCurrency(totalCommissionsSumIQD, 'IQD')}
                </span>
              )}
            </div>
          ) : totalCommissionsSumIQD > 0 ? (
            formatCurrency(totalCommissionsSumIQD, 'IQD')
          ) : (
            '0 د.ع'
          )}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          إجمالي عمولات الحوالات والصيرفة
        </div>
      </div>
    </div>
  );
};
