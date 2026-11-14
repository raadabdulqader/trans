import React, { useState, useEffect } from 'react';
import { 
  Ban, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  RotateCcw,
  Building2,
  FileText,
  UserCheck,
  Receipt as ReceiptIcon,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, AppUser, CompanyId, COMPANIES, TreasuryTransaction } from '../../types/customs';
import { formatCurrency, getBillFinancials } from '../../utils/storage';

export type VoidResolutionMode = 'void_and_refund' | 'credit_customer' | 'void_bill_only';

export interface VoidBillFinancialModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  treasury?: TreasuryTransaction[];
  currentUser: AppUser;
  onClose: () => void;
  onConfirmVoid: (
    tx: Transaction,
    resolution: VoidResolutionMode,
    reason: string,
    refundCash: boolean
  ) => void;
}

const PRESET_VOID_REASONS = [
  'إلغاء الشحنة في الميناء بطلب الزبون وإرجاع المبالغ',
  'تسجيل بوليصة مكررة أو خاطئة وتحييد أثر الصندوق',
  'إلغاء المعاملة الكمركية وتصفية حسابات السلف',
  'تحويل المبالغ المحصلة إلى رصيد أمانات دائن للزبون',
  'عدم وصول الحاويات وإلغاء التعاقد التجاري',
];

export const VoidBillFinancialModal: React.FC<VoidBillFinancialModalProps> = ({
  isOpen,
  transaction,
  customers,
  employees,
  receipts,
  treasury = [],
  currentUser,
  onClose,
  onConfirmVoid,
}) => {
  const [resolution, setResolution] = useState<VoidResolutionMode>('void_and_refund');
  const [reason, setReason] = useState('');
  const [refundCash, setRefundCash] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setResolution('void_and_refund');
      setReason('');
      setRefundCash(true);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const cust = customers.find(c => c.id === transaction.customerId);
  const emp = employees.find(e => e.id === transaction.employeeId);
  const fin = getBillFinancials(transaction, receipts);
  const activeReceipts = receipts.filter(r => r.billId === transaction.id && r.status !== 'cancelled');
  const companyKey: CompanyId = transaction.companyId || 'naqaa_basra';
  const comp = COMPANIES[companyKey];

  // Calculations for Financial Impact
  const totalCollected = fin.totalCollected; // Payments & deposit entering treasury
  const openAdvances = fin.openAdvances;     // Unsettled broker advances
  const settledAdvances = fin.totalSettled;  // Settled customs broker receipts
  const totalAdvances = fin.totalAdvances;

  // Active carrier payments linked to this bill
  const carrierPaymentsOnBill = (treasury || []).filter(
    t =>
      t.status !== 'cancelled' &&
      t.type === 'withdrawal' &&
      (t.carrierId || t.subAccount === 'carriers') &&
      t.relatedBillNo &&
      t.relatedBillNo.trim().toLowerCase() === transaction.billNo.trim().toLowerCase()
  );
  const carrierPaidOnBill = carrierPaymentsOnBill.reduce((s, t) => s + (t.amount || 0), 0);

  // Net Cashbox Impact for Option 1:
  // Refund customer collections (-totalCollected) + Recover open advances (+openAdvances) + Recover carrier payments (+carrierPaidOnBill)
  const netCashboxImpactOption1 = -totalCollected + openAdvances + carrierPaidOnBill;

  const handleConfirm = () => {
    const finalReason = reason.trim() || 'إلغاء دفتري محاسبي للبوليصة وتحديث الصندوق';
    onConfirmVoid(transaction, resolution, finalReason, refundCash);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  إلغاء دفتري للبوليصة والمعالجة المالية بالصندوق
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  VOID / تحييد الأثر
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبيق الإلغاء الدفتري المحاسبي وضبط رصيد الصندوق وسلف المخلصين بدقة
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Target Bill Info Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono font-bold text-white">{transaction.billNo}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${comp.badgeColor}`}>
                  {comp.shortName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{cust?.name || 'زبون غير محدد'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">المبلغ الكلي للبوليصة</span>
                <strong className="text-white text-xs" dir="ltr">{formatCurrency(transaction.totalAmount || 0)}</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">المحصل بالصندوق</span>
                <strong className="text-emerald-400 text-xs" dir="ltr">{formatCurrency(totalCollected)}</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">سلف المخلص المفتوحة</span>
                <strong className="text-amber-400 text-xs" dir="ltr">{formatCurrency(openAdvances)}</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">الوصولات المرتبطة</span>
                <strong className="text-cyan-400 text-xs">{activeReceipts.length} سندات نشطة</strong>
              </div>
            </div>
          </div>

          {/* Resolution Options Selection */}
          <div className="space-y-3">
            <label className="font-bold text-slate-200 block text-xs flex items-center justify-between">
              <span>حدد طريقة المعالجة المحاسبية لانعكاس الإلغاء على الصندوق:</span>
              <span className="text-[10px] text-emerald-400 font-normal">خيارات محاسبية قياسية</span>
            </label>

            {/* Option 1: Cascading Void & Cashbox Refund (Recommended) */}
            <div 
              onClick={() => setResolution('void_and_refund')}
              className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 relative ${
                resolution === 'void_and_refund'
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    resolution === 'void_and_refund'
                      ? 'border-emerald-400 bg-emerald-500'
                      : 'border-slate-600'
                  }`}>
                    {resolution === 'void_and_refund' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    1️⃣ تحييد الأثر المالي كاملاً وإلغاء قيود الصندوق دفترياً (الموصى به)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  المعيار المحاسبي
                </span>
              </div>

              <p className="text-[11px] text-slate-300 pr-6 leading-relaxed">
                يتم إلغاء وصولات القبض والدفعة الأولى المرتبطة بالبوليصة دفترياً، واستبعاد <strong className="text-emerald-300 font-mono" dir="ltr">{formatCurrency(totalCollected)}</strong> من إجمالي مقبوضات الصندوق (إرجاع للزبون)، مع استرداد السلف المفتوحة غير المصفاة بقيمة <strong className="text-amber-300 font-mono" dir="ltr">{formatCurrency(openAdvances)}</strong>{carrierPaidOnBill > 0 ? ` واسترداد أجور النقل المسددة للناقل بقيمة ${formatCurrency(carrierPaidOnBill)}` : ''} إلى الصندوق.
              </p>

              {resolution === 'void_and_refund' && (
                <div className="mt-2 pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-[11px] font-mono pr-6">
                  <span className="text-slate-400">صافي الأثر على رصيد الصندوق:</span>
                  <span className={`font-bold ${netCashboxImpactOption1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                    {netCashboxImpactOption1 >= 0 ? `+${formatCurrency(netCashboxImpactOption1)}` : formatCurrency(netCashboxImpactOption1)}
                  </span>
                </div>
              )}
            </div>

            {/* Option 2: Credit to Customer Account (Deposit Stays in Cashbox) */}
            <div 
              onClick={() => setResolution('credit_customer')}
              className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                resolution === 'credit_customer'
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    resolution === 'credit_customer'
                      ? 'border-cyan-400 bg-cyan-500'
                      : 'border-slate-600'
                  }`}>
                    {resolution === 'credit_customer' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    2️⃣ إبقاء المبالغ في الصندوق كـ «أمانات ورصيد دائن» للزبون
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  أمانات زبائن
                </span>
              </div>

              <p className="text-[11px] text-slate-300 pr-6 leading-relaxed">
                إذا كان الزبون قد سلّم الأموال فعلياً ولا يرغب في استرجاعها نقداً، تبقى المبالغ (<strong className="text-cyan-300 font-mono" dir="ltr">{formatCurrency(totalCollected)}</strong>) داخل صندوق الشركة كأمانات ورصيد دائن لحسابه للاستفادة منها في فواتير قادمة، وتُلغى البوليصة فقط مع استرداد سلف المخلصين المفتوحة.
              </p>
            </div>

            {/* Option 3: Void Bill Only (Leave receipts for manual review) */}
            <div 
              onClick={() => setResolution('void_bill_only')}
              className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                resolution === 'void_bill_only'
                  ? 'bg-amber-950/30 border-amber-500/60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    resolution === 'void_bill_only'
                      ? 'border-amber-400 bg-amber-500'
                      : 'border-slate-600'
                  }`}>
                    {resolution === 'void_bill_only' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    3️⃣ إلغاء البوليصة دفترياً فقط مع إبقاء الوصولات الحالية للمراجعة اليدوية
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pr-6">
                تُحوّل حالة البوليصة فقط إلى "ملغاة"، مع إبقاء وصولاتها وسلفها نشطة في الصندوق ليقوم المحاسب بإلغائها لاحقاً بشكل يدوي سنداً بسند.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 block text-xs">
              سبب الإلغاء الدفتري المحاسبي (إلزامي للتدقيق والرقابة):
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_VOID_REASONS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${
                    reason === r 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب إلغاء البوليصة دفترياً والمعالجة المالية..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Execution Note */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>المسؤول المنفّذ: <strong className="text-slate-200">{currentUser.name} ({currentUser.roleTitle})</strong></span>
            <span>التاريخ: <strong className="font-mono text-slate-200">{new Date().toISOString().split('T')[0]}</strong></span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
          >
            تراجع وإلغاء الأمر
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition shadow-lg shadow-rose-500/20 text-xs flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            <span>تنفيذ الإلغاء الدفتري وتحديث الصندوق فوراً</span>
          </button>
        </div>

      </div>
    </div>
  );
};
