import React, { useRef } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Eye, 
  Edit2, 
  Trash2, 
  Upload, 
  Ban, 
  Info, 
  Printer 
} from 'lucide-react';
import { TreasuryTransaction, Receipt, AppUser, TreasuryAttachment, COMPANIES } from '../../types/customs';
import { UnifiedRecord } from '../../types/treasuryUnified';
import { formatCurrency, TreasuryFinancialSummary } from '../../utils/storage';

export interface TreasuryTableProps {
  filteredRecords: UnifiedRecord[];
  summary: TreasuryFinancialSummary;
  currentUser: AppUser;
  onViewArchive: (attachment: TreasuryAttachment, title: string) => void;
  onPrintVoucher: (tx: TreasuryTransaction) => void;
  onEditTransaction: (tx: TreasuryTransaction) => void;
  onDeleteTransaction: (tx: TreasuryTransaction) => void;
  onDeleteReceipt?: (rcpt: Receipt) => void;
  onAttachReceiptToTreasury: (tx: TreasuryTransaction, file: File) => void;
  onAttachReceiptToBillReceipt: (rcpt: Receipt, file: File) => void;
}

export const TreasuryTable: React.FC<TreasuryTableProps> = ({
  filteredRecords,
  summary,
  currentUser,
  onViewArchive,
  onPrintVoucher,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteReceipt,
  onAttachReceiptToTreasury,
  onAttachReceiptToBillReceipt,
}) => {
  const fileInputMap = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileChange = (record: UnifiedRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (record.source === 'treasury' && record.rawTreasury) {
      onAttachReceiptToTreasury(record.rawTreasury, file);
    } else if (record.rawReceipt) {
      onAttachReceiptToBillReceipt(record.rawReceipt, file);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
              <th className="py-3.5 px-4">رقم السند</th>
              <th className="py-3.5 px-4">نوع الحركة</th>
              <th className="py-3.5 px-4">التاريخ</th>
              <th className="py-3.5 px-4">الطرف (المودع / المستلم)</th>
              <th className="py-3.5 px-4">التصنيف والبيان</th>
              <th className="py-3.5 px-4">المبلغ والعملة</th>
              <th className="py-3.5 px-4 text-center">أرشفة ومعاينة الوصل</th>
              <th className="py-3.5 px-4">المصدر والمستخدم</th>
              <th className="py-3.5 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="space-y-2">
                    <div className="text-3xl">📭</div>
                    <div className="text-sm font-bold text-white">لا توجد قيود مسجلة تطابق البحث أو الفلاتر</div>
                    <p className="text-xs text-slate-500">
                      يمكنك إضافة إيداع أو سحب نقدي جديد، أو تسجيل دفعات وسلف من شاشة البوالص والمخلصين.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => {
                const isSettlement = item.source === 'broker_settlement';
                const isDeposit = item.type === 'deposit' && !isSettlement;
                const isCancelled = item.status === 'cancelled';
                const itemCurrency = item.currency || 'IQD';

                return (
                  <tr 
                    key={item.id} 
                    className={`transition ${
                      isCancelled 
                        ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-l-rose-500 text-slate-400' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Voucher No & Bill badge */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const itemComp = item.companyId && item.companyId !== 'shared' ? COMPANIES[item.companyId] : null;
                          if (itemComp) {
                            return (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border shrink-0 ${itemComp.badgeColor}`}>
                                {itemComp.shortName}
                              </span>
                            );
                          }
                          return (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-sans font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                              صندوق عام
                            </span>
                          );
                        })()}
                        <span className={isCancelled ? 'line-through text-slate-500' : 'text-white'}>
                          {item.voucherNo}
                        </span>
                        {isCancelled && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold inline-flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5" />
                            <span>ملغي دفترياً</span>
                          </span>
                        )}
                      </div>
                      {item.relatedBillNo && (
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                          بوليصة: {item.relatedBillNo}
                        </div>
                      )}
                    </td>

                    {/* Movement Type */}
                    <td className="py-3.5 px-4">
                      {isSettlement ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          <span>تسوية وصولات (✓)</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isDeposit
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {isDeposit ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isDeposit ? 'وارد (+)' : 'صادر (-)'}</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.date}
                    </td>

                    {/* Party */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.partyName}
                    </td>

                    {/* Category & Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.category}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={item.description}>
                        {item.description || '—'}
                      </div>
                      {isCancelled && (
                        <div className="mt-1 text-[10px] text-rose-300 font-medium flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                          <Info className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">السبب: {item.cancelReason || 'إلغاء دفتري'}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount with Currency */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm" dir="ltr">
                      {isCancelled ? (
                        <div className="flex flex-col">
                          <span className="line-through text-slate-500">
                            {isSettlement ? '' : isDeposit ? '+' : '-'}{formatCurrency(item.amount, itemCurrency)}
                          </span>
                          <span className="text-[10px] text-rose-400 font-normal">محيد من رصيد الصندوق</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className={
                            isSettlement
                              ? 'text-indigo-400 font-bold'
                              : itemCurrency === 'USD' 
                              ? (isDeposit ? 'text-cyan-400 font-black' : 'text-amber-400 font-black') 
                              : (isDeposit ? 'text-emerald-400' : 'text-rose-400')
                          }>
                            {isSettlement ? '' : isDeposit ? '+' : '-'}{formatCurrency(item.amount, itemCurrency)}
                          </span>
                          {isSettlement && (
                            <span className="text-[10px] text-indigo-300/80 font-sans font-normal">
                              تصفية ذمة سلفة بالوصولات
                            </span>
                          )}
                          {itemCurrency === 'USD' && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(item.amount * (summary.exchangeRate || item.exchangeRate || 1500)))} د.ع
                            </span>
                          )}
                          {item.hasCommission && (item.commissionAmount || 0) > 0 && (
                            <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-amber-400 font-mono">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded font-sans font-bold">
                                  عمولة: {item.commissionBearer === 'party' ? '' : '-'}{formatCurrency(item.commissionAmount || 0, item.commissionCurrency || itemCurrency)}
                                </span>
                                <span className="text-[9px] text-slate-400 font-sans">
                                  ({item.commissionBearer === 'party' ? 'على الزبون - لا تؤثر على الصندوق' : 'على الشركة - مستقطعة'})
                                </span>
                              </div>
                              {(item.commissionCurrency || itemCurrency) === itemCurrency && !isSettlement && (
                                <span className="text-[10px] text-emerald-300 font-sans">
                                  صافي الصندوق:{' '}
                                  <strong className="font-mono" dir="ltr">
                                    {item.commissionBearer === 'party'
                                      ? `${isDeposit ? '+' : '-'}${formatCurrency(item.amount, itemCurrency)}`
                                      : isDeposit
                                      ? `+${formatCurrency(Math.max(0, item.amount - (item.commissionAmount || 0)), itemCurrency)}`
                                      : `-${formatCurrency(item.amount + (item.commissionAmount || 0), itemCurrency)}`}
                                  </strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Archiving / Direct Preview Column */}
                    <td className="py-3.5 px-4 text-center">
                      {item.attachment ? (
                        <button
                          onClick={() => onViewArchive(item.attachment!, `وصل السند ${item.voucherNo} (${item.partyName})`)}
                          title="معاينة الوصل فوراً على الشاشة دون الحاجة للتحميل"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition shadow-xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span>معاينة الوصل 👁️</span>
                        </button>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            ref={(el) => { fileInputMap.current[item.id] = el; }}
                            onChange={(e) => handleFileChange(item, e)}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputMap.current[item.id]?.click()}
                            title="رفع صورة الوصل أو الإشعار"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] transition"
                          >
                            <Upload className="w-3 h-3 text-cyan-400" />
                            <span>+ أرشفة وصل</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Source & Recorded By */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>{item.recordedBy}</div>
                      <div className="text-[9px] text-slate-500">
                        {item.source === 'treasury' 
                          ? 'صندوق مباشر' 
                          : item.source === 'bill_payment' 
                            ? 'تحصيل بوليصة' 
                            : item.source === 'broker_advance' 
                              ? 'سلفة مخلص' 
                              : item.source === 'broker_settlement' 
                                ? 'تسوية مخلص' 
                                : 'دفعة أولى'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.rawTreasury && (
                          <>
                            {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
                              <button
                                onClick={() => onPrintVoucher(item.rawTreasury!)}
                                title={isCancelled ? "طباعة السند مع ختم الإلغاء" : "طباعة سند نقدي رسمي"}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onEditTransaction(item.rawTreasury!)}
                              title="تعديل القيد"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteTransaction(item.rawTreasury!)}
                              title={isCancelled ? "حذف القيد نهائياً من الأرشيف" : "إلغاء القيد دفترياً من الصندوق"}
                              className={`p-1.5 rounded-lg transition ${
                                isCancelled
                                  ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200'
                                  : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                              }`}
                            >
                              {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}

                        {item.rawReceipt && onDeleteReceipt && (
                          <button
                            onClick={() => onDeleteReceipt(item.rawReceipt!)}
                            title={isCancelled ? "حذف السند نهائياً" : "إلغاء السند دفترياً"}
                            className={`p-1.5 rounded-lg transition ${
                              isCancelled
                                ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300'
                            }`}
                          >
                            {isCancelled ? <Trash2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
