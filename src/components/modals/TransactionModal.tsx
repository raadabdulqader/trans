import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Trash2, 
  FileText, 
  Coins, 
  Building2, 
  Sparkles,
  AlertCircle,
  DollarSign,
  Paperclip,
  Truck
} from 'lucide-react';
import { Transaction, Customer, Employee, Receipt, CompanyId, COMPANIES, Currency, TreasuryAttachment, TransportCompany, BillTransportTrip } from '../../types/customs';
import { getBillFinancials, normalizeExchangeRate, formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { ContainersEditor } from '../transactions/ContainersEditor';
import { AgencyDocumentUploader } from '../transactions/AgencyDocumentUploader';
import { CustomsNotesPicker } from '../transactions/CustomsNotesPicker';
import { BillTransportSection } from '../transactions/BillTransportSection';

interface TransactionModalProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  carriers?: TransportCompany[];
  onQuickAddCarrier?: (carrier: Omit<TransportCompany, 'id' | 'createdAt'>) => TransportCompany;
  receipts?: Receipt[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialData,
  customers,
  employees,
  carriers = [],
  onQuickAddCarrier,
  receipts = [],
  exchangeRate = 1500,
  onExchangeRateChange,
  onViewArchive,
  onClose,
  onSave,
  onDelete,
}) => {
  const [billNo, setBillNo] = useState('');
  const [companyId, setCompanyId] = useState<CompanyId>('naqaa_basra');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [localRate, setLocalRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [isMixedCurrency, setIsMixedCurrency] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [status, setStatus] = useState<Transaction['status']>('pending');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [initialPaid, setInitialPaid] = useState<number>(0);
  const [totalAmountUSD, setTotalAmountUSD] = useState<number>(0);
  const [initialPaidUSD, setInitialPaidUSD] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [containers, setContainers] = useState<string[]>([]);
  const [agencyDocument, setAgencyDocument] = useState<TreasuryAttachment | undefined>(undefined);
  const [hasTransport, setHasTransport] = useState<boolean>(false);
  const [transportTrips, setTransportTrips] = useState<BillTransportTrip[]>([]);
  const [transportDocument, setTransportDocument] = useState<TreasuryAttachment | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const footerAgencyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setLocalRate(prev => {
        if (prev > 0 && normalizeExchangeRate(prev, 1500) === normalizedProp) {
          return prev;
        }
        return normalizedProp;
      });
    }
  }, [exchangeRate]);

  useEffect(() => {
    setFormError(null);
    if (initialData) {
      setBillNo(initialData.billNo);
      setCompanyId(initialData.companyId || 'naqaa_basra');
      setCurrency(initialData.currency || 'IQD');
      setIsMixedCurrency(!!initialData.isMixedCurrency);
      setCustomerId(initialData.customerId);
      setEmployeeId(initialData.employeeId);
      setDate(initialData.date);
      setGoodsType(initialData.goodsType || '');
      setStatus(initialData.status);
      setTotalAmount(initialData.totalAmount || 0);
      setInitialPaid(initialData.initialPaid || 0);
      setTotalAmountUSD(initialData.totalAmountUSD || 0);
      setInitialPaidUSD(initialData.initialPaidUSD || 0);
      setNotes(initialData.notes || '');
      setContainers(initialData.containers || []);
      setAgencyDocument(initialData.agencyDocument);
      setHasTransport(!!(initialData.hasTransport || (initialData.transportTrips && initialData.transportTrips.length > 0)));
      setTransportTrips(initialData.transportTrips || []);
      setTransportDocument(initialData.transportDocument);
    } else {
      const randomBill = `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setBillNo(randomBill);
      setCompanyId('naqaa_basra');
      setCurrency('IQD');
      setIsMixedCurrency(false);
      setCustomerId(customers[0]?.id || '');
      setEmployeeId(employees[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setGoodsType('');
      setStatus('pending');
      setTotalAmount(10000000);
      setInitialPaid(2000000);
      setTotalAmountUSD(0);
      setInitialPaidUSD(0);
      setNotes('');
      setContainers([]);
      setAgencyDocument(undefined);
      setHasTransport(false);
      setTransportTrips([]);
      setTransportDocument(undefined);
    }
    setLocalRate(normalizeExchangeRate(exchangeRate, 1500));
  }, [initialData, isOpen, customers, employees, exchangeRate]);

  if (!isOpen) return null;

  const activeRate = normalizeExchangeRate(localRate, normalizeExchangeRate(exchangeRate, 1500));

  // Existing customer payments recorded on this bill (converted to bill currency and excluding cancelled receipts)
  const existingFin = (initialData && receipts)
    ? getBillFinancials({ ...initialData, currency, exchangeRate: activeRate }, receipts, activeRate)
    : null;
  const existingPayments = existingFin ? existingFin.additionalPayments : 0;

  const tripCarrierCostSum = hasTransport
    ? transportTrips.reduce((sum, t) => {
        const amt = Math.max(0, Number(t.carrierCost) || 0);
        if (currency === 'USD') {
          return sum + (t.currency === 'USD' ? amt : (activeRate > 0 ? amt / activeRate : amt));
        }
        return sum + (t.currency === 'IQD' ? amt : (activeRate > 0 ? amt * activeRate : amt));
      }, 0)
    : 0;

  const tripCarrierCostSumIQD = hasTransport
    ? transportTrips.filter(t => (t.currency || 'IQD') === 'IQD').reduce((s, t) => s + (Number(t.carrierCost) || 0), 0)
    : 0;
  const tripCarrierCostSumUSD = hasTransport
    ? transportTrips.filter(t => t.currency === 'USD').reduce((s, t) => s + (Number(t.carrierCost) || 0), 0)
    : 0;

  const isInitialExceeded = totalAmount > 0 && initialPaid > totalAmount;
  const isInitialUSDExceeded = isMixedCurrency && totalAmountUSD > 0 && initialPaidUSD > totalAmountUSD;
  const isTotalLessThanExisting = existingPayments > 0 && totalAmount < (existingPayments + Math.min(totalAmount, initialPaid));
  const remaining = Math.max(0, Math.round((totalAmount - Math.min(totalAmount, initialPaid) - existingPayments) * 100) / 100);
  const remainingUSD = Math.max(0, totalAmountUSD - Math.min(totalAmountUSD, initialPaidUSD));

  const handleGenerateNewBillNo = () => {
    const randomBill = `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setBillNo(randomBill);
  };

  const handleFooterAgencyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setFormError('حجم ملف ورقة الوكالة يجب ألا يتجاوز 4 ميغابايت');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAgencyDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTransportDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFormError('حجم ملف وصل استلام النقل يجب ألا يتجاوز 4 ميغابايت');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTransportDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddTransportTrip = () => {
    const defaultCarrier = carriers[0];
    const newTrip: BillTransportTrip = {
      id: `trip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      carrierId: defaultCarrier?.id || '',
      carrierName: defaultCarrier?.name || '',
      destination: 'ميناء أم قصر ← بغداد',
      truckCount: 1,
      driverName: '',
      truckPlateNo: '',
      driverPhone: '',
      currency: 'IQD',
      carrierCost: 700000,
      customerCharge: 0,
      notes: '',
    };
    setHasTransport(true);
    setTransportTrips(prev => [...prev, newTrip]);
  };

  const handleUpdateTrip = (tripId: string, patch: Partial<BillTransportTrip>) => {
    setTransportTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        const updated = { ...t, ...patch };
        if (patch.carrierId) {
          const found = carriers.find(c => c.id === patch.carrierId);
          if (found) updated.carrierName = found.name;
        }
        return updated;
      })
    );
  };

  const handleRemoveTrip = (tripId: string) => {
    setTransportTrips(prev => {
      const next = prev.filter(t => t.id !== tripId);
      if (next.length === 0) setHasTransport(false);
      return next;
    });
  };

  const handleTripFileUpload = (tripId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateTrip(tripId, {
        transportDocument: {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
          date: new Date().toISOString().split('T')[0],
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleQuickCarrierCreated = (created: TransportCompany) => {
    if (transportTrips.length === 0) {
      setHasTransport(true);
      setTransportTrips([
        {
          id: `trip-${Date.now()}`,
          carrierId: created.id,
          carrierName: created.name,
          destination: 'ميناء أم قصر ← بغداد',
          truckCount: 1,
          driverName: '',
          truckPlateNo: '',
          driverPhone: '',
          currency: 'IQD',
          carrierCost: 700000,
        },
      ]);
    } else {
      const last = transportTrips[transportTrips.length - 1];
      handleUpdateTrip(last.id, { carrierId: created.id, carrierName: created.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNo || !customerId) return;

    if (totalAmount <= 0 && (!isMixedCurrency || totalAmountUSD <= 0)) {
      setFormError('يرجى إدخال المبلغ الكلي للبوليصة بشكل صحيح');
      return;
    }

    if (initialPaid > totalAmount) {
      setFormError(`لا يجوز أن تكون الدفعة الأولى أكبر من المبلغ الكلي للبوليصة`);
      return;
    }

    if (isMixedCurrency && initialPaidUSD > totalAmountUSD) {
      setFormError(`لا يجوز أن تكون الدفعة الأولى بالدولار ($${initialPaidUSD}) أكبر من إجمالي الدولار ($${totalAmountUSD})`);
      return;
    }

    if (existingPayments > 0 && totalAmount < (existingPayments + initialPaid)) {
      setFormError(`المبلغ الكلي لا يمكن أن يكون أقل من مجموع المبالغ المسددة بالفعل لهذه البوليصة`);
      return;
    }

    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }

    const validTrips = hasTransport ? transportTrips.filter(t => t.carrierId && t.carrierCost > 0) : [];

    onSave({
      id: initialData?.id,
      billNo,
      companyId,
      customerId,
      employeeId,
      date,
      goodsType,
      status,
      totalAmount: Number(totalAmount) || 0,
      initialPaid: Math.min(Number(totalAmount) || 0, Number(initialPaid) || 0),
      currency: isMixedCurrency ? 'IQD' : currency,
      exchangeRate: activeRate,
      isMixedCurrency,
      totalAmountUSD: isMixedCurrency ? Number(totalAmountUSD) || 0 : undefined,
      initialPaidUSD: isMixedCurrency ? Number(initialPaidUSD) || 0 : undefined,
      notes,
      containers,
      agencyDocument,
      hasTransport: validTrips.length > 0,
      transportTrips: validTrips,
      transportDocument: validTrips.length > 0 || transportDocument ? transportDocument : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed at top */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {initialData ? 'تعديل بيانات البوليصة الكمركية' : 'بوليصة / فاتورة كمركية جديدة'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {billNo || 'جديد'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${COMPANIES[companyId]?.badgeClass}`}>
                  {COMPANIES[companyId]?.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إدخال بيانات المعاملة، تحديد الشركة، التخليص الكمركي، الحاويات، والدفعة الأولى
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container - Flex column with scrollable middle area */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {formError && (
            <div className="mx-5 mt-3 p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-400 hover:text-white text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {initialData?.status === 'cancelled' && (
            <div className="mx-5 mt-3 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>هذه البوليصة ملغاة دفترياً ومحاسبياً. التعديل هنا للبيانات الإيضاحية فقط دون التأثير على القيود المحاسبية الملغاة.</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 p-3.5 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* ================= العمود الأول: بيانات البوليصة والجهات والحاويات ================= */}
              <div className="space-y-3 bg-slate-950/40 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    بيانات البوليصة والجهات
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">القسم الأول</span>
                </div>

                {/* اختيار الشركة المسؤولة عن البوليصة والفاتورة */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-750 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-200 font-bold text-[11px] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الشركة التابعة لها البوليصة / الفاتورة <span className="text-rose-400">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">صندوق مشترك</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCompanyId('naqaa_basra')}
                      className={`p-2 rounded-xl border text-right transition flex items-center gap-2 ${
                        companyId === 'naqaa_basra'
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-emerald-300 truncate">شركة نقاء البصرة</div>
                        <div className="text-[10px] text-slate-400 truncate">للتخليص الكمركي والنقل</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompanyId('sawt_aljanoub')}
                      className={`p-2 rounded-xl border text-right transition flex items-center gap-2 ${
                        companyId === 'sawt_aljanoub'
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-cyan-300 truncate">شركة صوت الجنوب</div>
                        <div className="text-[10px] text-slate-400 truncate">للتخليص واللوجستيات</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Row 1: رقم البوليصة + تاريخ الاستلام */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold text-[11px]">
                        رقم البوليصة <span className="text-rose-400">*</span>
                      </label>
                      {!initialData && (
                        <button
                          type="button"
                          onClick={handleGenerateNewBillNo}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                          title="توليد رقم عشوائي جديد"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> توليد
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      placeholder="BL-2026-..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ الاستلام</label>
                    <DatePicker
                      value={date}
                      onChange={(d) => setDate(d)}
                      placeholder="اختر التاريخ..."
                    />
                  </div>
                </div>

                {/* Row 2: الزبون (الشركة) + المخلص المسؤول */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      الزبون (الشركة) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      required
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="">-- اختر الزبون --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">المخلص المسؤول</label>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="">-- اختر المخلص --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: نوع البضاعة + حالة المعاملة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">نوع البضاعة</label>
                    <input
                      type="text"
                      value={goodsType}
                      onChange={(e) => setGoodsType(e.target.value)}
                      placeholder="مثال: أجهزة كهربائية، مواد غذائية..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">حالة المعاملة</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="pending">⏳ قيد التنفيذ</option>
                      <option value="issue">⚠️ معلقة</option>
                      <option value="completed">✅ منجزة</option>
                    </select>
                  </div>
                </div>

                {/* Subcomponent 1: Containers Editor */}
                <ContainersEditor
                  containers={containers}
                  setContainers={setContainers}
                />

                {/* Subcomponent 2: Agency Document Uploader */}
                <AgencyDocumentUploader
                  agencyDocument={agencyDocument}
                  setAgencyDocument={setAgencyDocument}
                  billNo={billNo}
                  onViewArchive={onViewArchive}
                  setFormError={setFormError}
                />
              </div>

              {/* ================= العمود الثاني: البيانات المالية والملاحظات ================= */}
              <div className="space-y-3 bg-slate-950/40 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    الحساب المالي والملاحظات
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">القسم الثاني</span>
                </div>

                {/* Currency Selector Pill Bar */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>عملة الفاتورة / البوليصة:</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span>سعر الصرف:</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={localRate === 0 ? '' : localRate}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === '' ? 0 : Number(val);
                          setLocalRate(num);
                          if (num >= 100 && onExchangeRateChange) {
                            onExchangeRateChange(normalizeExchangeRate(num, 1500), true);
                          }
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none text-center"
                      />
                      <span>(1$ = {activeRate.toLocaleString('ar-IQ')} د.ع)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsMixedCurrency(false); setCurrency('IQD'); }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                        !isMixedCurrency && currency === 'IQD'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🇮🇶 دينار (IQD)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMixedCurrency(false); setCurrency('USD'); }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                        !isMixedCurrency && currency === 'USD'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🇺🇸 دولار ($)
                    </button>
                  </div>
                </div>

                {!isMixedCurrency ? (
                  <>
                    {/* Single Currency Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          المبلغ الكلي ({currency === 'USD' ? '$' : 'د.ع'}) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={totalAmount || ''}
                          onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {currency === 'USD' && totalAmount > 0 && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            المعادل: ≈ <strong className="text-emerald-400">{new Intl.NumberFormat('ar-IQ').format(Math.round(totalAmount * activeRate))} د.ع</strong>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          الدفعة الأولى / المقدم ({currency === 'USD' ? '$' : 'د.ع'})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={initialPaid || ''}
                          onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-emerald-400 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {currency === 'USD' && initialPaid > 0 && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            المعادل: ≈ <strong className="text-emerald-400">{new Intl.NumberFormat('ar-IQ').format(Math.round(initialPaid * activeRate))} د.ع</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {tripCarrierCostSum > 0 && (
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-1 animate-in fade-in">
                        <div className="flex items-center justify-between text-cyan-300 font-bold">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <Truck className="w-3.5 h-3.5" />
                            <span>أجور نقل متضمنة (تكلفة تشغيلية للنواقل):</span>
                          </span>
                          <span className="font-mono text-xs">{formatCurrency(tripCarrierCostSum, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300 text-[10px] pt-1 border-t border-cyan-500/20">
                          <span>طبيعة التكلفة:</span>
                          <span className="text-slate-300">تُدفع للناقل مقدماً ولا تُخصم من دين الزبون</span>
                        </div>
                      </div>
                    )}

                    {isInitialExceeded && (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-rose-200">خطأ: المسدد أكبر من إجمالي البوليصة!</div>
                        </div>
                      </div>
                    )}

                    {/* Remaining Calculated Box */}
                    <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-semibold">
                        المبلغ المتبقي بذمة الزبون:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold text-sm ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                          {currency === 'USD' ? `$${remaining.toLocaleString()}` : `${new Intl.NumberFormat('ar-IQ').format(remaining)} د.ع`}
                        </span>
                        {remaining === 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold mr-1">
                            خالص
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mixed Currency Section (د.ع + $) */}
                    <div className="space-y-2.5 p-2.5 bg-slate-950/60 rounded-xl border border-amber-500/20">
                      <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🏛️ رسوم ومصاريف محلية (بالدينار العراقي):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">المبلغ (د.ع) *</label>
                          <input
                            type="number"
                            min="0"
                            value={totalAmount || ''}
                            onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                            placeholder="المبلغ بالدينار..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">المقدم (د.ع)</label>
                          <input
                            type="number"
                            min="0"
                            value={initialPaid || ''}
                            onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                            placeholder="المدفوع دينار..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                        <span>🚢 أجور شحن بحري (بالدولار الأمريكي):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">المبلغ ($) *</label>
                          <input
                            type="number"
                            min="0"
                            value={totalAmountUSD || ''}
                            onChange={(e) => setTotalAmountUSD(Number(e.target.value) || 0)}
                            placeholder="المبلغ بالدولار..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">المقدم ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={initialPaidUSD || ''}
                            onChange={(e) => setInitialPaidUSD(Number(e.target.value) || 0)}
                            placeholder="المدفوع دولار..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">الإجمالي المعادل:</span>
                        <strong className="text-emerald-400 font-mono font-bold" dir="ltr">
                          {new Intl.NumberFormat('ar-IQ').format((totalAmount || 0) + (totalAmountUSD || 0) * (exchangeRate || 1500))} د.ع
                        </strong>
                      </div>
                    </div>
                  </>
                )}

                {/* Subcomponent 3: Customs Notes Picker */}
                <CustomsNotesPicker
                  notes={notes}
                  setNotes={setNotes}
                />
              </div>
            </div>

            {/* Subcomponent 4: Land Transport Trips Section */}
            <BillTransportSection
              billNo={billNo}
              transportTrips={transportTrips}
              carriers={carriers}
              transportDocument={transportDocument}
              onTransportDocUpload={handleTransportDocUpload}
              onAddTrip={handleAddTransportTrip}
              onUpdateTrip={handleUpdateTrip}
              onRemoveTrip={handleRemoveTrip}
              onTripFileUpload={handleTripFileUpload}
              onQuickAddCarrier={onQuickAddCarrier}
              onQuickCarrierCreated={handleQuickCarrierCreated}
              onViewArchive={onViewArchive}
            />
          </div>

          {/* Hidden input for footer agency upload button */}
          <input
            ref={footerAgencyInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFooterAgencyUpload}
            className="hidden"
          />

          {/* Footer - Always Visible at the Bottom */}
          <div className="px-5 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-slate-500">الإجمالي:</span>
                <span className="font-mono font-bold text-slate-200">
                  {isMixedCurrency
                    ? `${new Intl.NumberFormat('ar-IQ').format(totalAmount || 0)} د.ع + $${totalAmountUSD || 0}`
                    : currency === 'USD'
                    ? `$${(totalAmount || 0).toLocaleString()}`
                    : `${new Intl.NumberFormat('ar-IQ').format(totalAmount || 0)} د.ع`}
                </span>
              </span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500">المقدم:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isMixedCurrency
                    ? `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع + $${initialPaidUSD || 0}`
                    : currency === 'USD'
                    ? `$${(initialPaid || 0).toLocaleString()}`
                    : `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع`}
                </span>
              </span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500">الحاويات:</span>
                <span className="font-mono font-bold text-cyan-400">{containers.length}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => footerAgencyInputRef.current?.click()}
                className={`px-3.5 py-1.5 font-bold rounded-xl transition text-xs flex items-center gap-1.5 border ${
                  agencyDocument
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                    : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/40'
                }`}
                title="رفع وأرشفة ورقة الوكالة الخاصة بالعمل لهذه البوليصة"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{agencyDocument ? '✓ تم أرشفة الوكالة' : 'أرشفة الوكالة'}</span>
              </button>

              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData)}
                  className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف البوليصة</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isInitialExceeded || isTotalLessThanExisting}
                className={`px-5 py-1.5 font-bold rounded-xl transition text-xs flex items-center gap-1.5 ${
                  isInitialExceeded || isTotalLessThanExisting
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <span>💾</span>
                <span>{initialData ? 'حفظ التعديلات' : 'حفظ البوليصة'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
