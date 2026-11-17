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
  Truck,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarClock,
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { 
  Transaction, 
  Customer, 
  Employee, 
  Receipt, 
  CompanyId, 
  COMPANIES, 
  Currency, 
  TreasuryAttachment, 
  TransportCompany, 
  BillTransportTrip, 
  TreasuryTransaction 
} from '../../types/customs';
import { getBillFinancials, normalizeExchangeRate, formatCurrency } from '../../utils/storage';
import { DatePicker } from '../ui/date-picker';
import { ContainersEditor } from '../transactions/ContainersEditor';
import { AgencyDocumentUploader } from '../transactions/AgencyDocumentUploader';
import { CustomsNotesPicker } from '../transactions/CustomsNotesPicker';
import { BillTransportSection } from '../transactions/BillTransportSection';
import { BillMilestonesEditor } from '../transactions/BillMilestonesEditor';

export type ModalTab = 'general' | 'financial' | 'transport' | 'notes';

interface TransactionModalProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  carriers?: TransportCompany[];
  onQuickAddCarrier?: (carrier: Omit<TransportCompany, 'id' | 'createdAt'>) => TransportCompany;
  receipts?: Receipt[];
  treasury?: TreasuryTransaction[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (transaction: Transaction) => void;
  onOpenAddExpense?: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialData,
  customers,
  employees,
  carriers = [],
  onQuickAddCarrier,
  receipts = [],
  treasury = [],
  exchangeRate = 1500,
  onExchangeRateChange,
  onViewArchive,
  onClose,
  onSave,
  onDelete,
  onOpenAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [billNo, setBillNo] = useState('');
  const [companyId, setCompanyId] = useState<CompanyId>('naqaa_basra');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [localRate, setLocalRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [isMixedCurrency, setIsMixedCurrency] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [deliveryOrderDate, setDeliveryOrderDate] = useState<string>('');
  const [clearanceDate, setClearanceDate] = useState<string>('');
  const [exitDate, setExitDate] = useState<string>('');
  const [containerReturnDate, setContainerReturnDate] = useState<string>('');
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
    setActiveTab('general');
    if (initialData) {
      setBillNo(initialData.billNo);
      setCompanyId(initialData.companyId || 'naqaa_basra');
      setCurrency(initialData.currency || 'IQD');
      setIsMixedCurrency(!!initialData.isMixedCurrency);
      setCustomerId(initialData.customerId);
      setEmployeeId(initialData.employeeId);
      setDate(initialData.date);
      setDeliveryOrderDate(initialData.deliveryOrderDate || '');
      setClearanceDate(initialData.clearanceDate || '');
      setExitDate(initialData.exitDate || '');
      setContainerReturnDate(initialData.containerReturnDate || '');
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
      setDeliveryOrderDate('');
      setClearanceDate('');
      setExitDate('');
      setContainerReturnDate('');
      setGoodsType('');
      setStatus('pending');
      setTotalAmount(0);
      setInitialPaid(0);
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

  const existingFin = initialData
    ? getBillFinancials({ ...initialData, currency, exchangeRate: activeRate }, receipts, activeRate)
    : null;
  const existingPayments = existingFin ? existingFin.additionalPayments : 0;
  const existingPaymentsUSD = existingFin?.additionalPaymentsUSD || 0;

  const tripCarrierCostSum = hasTransport
    ? transportTrips.reduce((sum, t) => {
        const amt = Number(t.carrierCost) || 0;
        if (t.currency === currency) return sum + amt;
        if (currency === 'USD') {
          return sum + (t.currency === 'USD' ? amt : (activeRate > 0 ? amt / activeRate : amt));
        }
        return sum + (t.currency === 'IQD' ? amt : (activeRate > 0 ? amt * activeRate : amt));
      }, 0)
    : 0;

  const equivalentInitialInBillCurr = isMixedCurrency
    ? (Number(initialPaid) || 0)
    : currency === 'USD'
    ? (Number(initialPaidUSD) || 0) + (activeRate > 0 ? (Number(initialPaid) || 0) / activeRate : 0)
    : (Number(initialPaid) || 0) + ((Number(initialPaidUSD) || 0) * activeRate);

  const isInitialExceeded = isMixedCurrency
    ? (totalAmount > 0 && initialPaid > totalAmount)
    : (totalAmount > 0 && equivalentInitialInBillCurr > totalAmount + 0.05);
  const isInitialUSDExceeded = isMixedCurrency && (totalAmountUSD || 0) > 0 && (initialPaidUSD || 0) > (totalAmountUSD || 0);

  const isTotalLessThanExisting = isMixedCurrency
    ? (existingPayments > 0 && totalAmount < (existingPayments + Math.min(totalAmount, initialPaid))) ||
      (existingPaymentsUSD > 0 && (totalAmountUSD || 0) < (existingPaymentsUSD + Math.min(totalAmountUSD || 0, initialPaidUSD || 0)))
    : (existingPayments > 0 && totalAmount < (existingPayments + Math.min(totalAmount, equivalentInitialInBillCurr)));

  const remaining = Math.max(0, Math.round((totalAmount - Math.min(totalAmount, isMixedCurrency ? initialPaid : equivalentInitialInBillCurr) - existingPayments) * 100) / 100);
  const remainingUSD = Math.max(0, Math.round(((totalAmountUSD || 0) - Math.min(totalAmountUSD || 0, initialPaidUSD || 0) - existingPaymentsUSD) * 100) / 100);

  // Check if there are active carrier payments disbursed from treasury on this bill
  const activeCarrierPaymentsOnBill = (treasury || []).filter(
    t =>
      t.status !== 'cancelled' &&
      t.type === 'withdrawal' &&
      (t.carrierId || t.subAccount === 'carriers') &&
      t.relatedBillNo &&
      initialData &&
      t.relatedBillNo.trim().toLowerCase() === initialData.billNo.trim().toLowerCase()
  );

  const carrierPaidIQDOnBill = activeCarrierPaymentsOnBill
    .filter(t => (t.currency || 'IQD') === 'IQD')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const carrierPaidUSDOnBill = activeCarrierPaymentsOnBill
    .filter(t => t.currency === 'USD')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const hasPaidCarriersOnBill = carrierPaidIQDOnBill > 0 || carrierPaidUSDOnBill > 0;

  // Direct customs & operational expenses on this bill from treasury
  const directExpensesOnBill = (treasury || []).filter(
    t =>
      t.status !== 'cancelled' &&
      t.type === 'withdrawal' &&
      !(t.carrierId || t.subAccount === 'carriers') &&
      t.relatedBillNo &&
      initialData &&
      t.relatedBillNo.trim().toLowerCase() === initialData.billNo.trim().toLowerCase()
  );

  const directExpensesIQDOnBill = directExpensesOnBill
    .filter(t => (t.currency || 'IQD') === 'IQD')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const directExpensesUSDOnBill = directExpensesOnBill
    .filter(t => t.currency === 'USD')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const milestonesCount = [deliveryOrderDate, clearanceDate, exitDate, containerReturnDate].filter(Boolean).length;

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
    if (!billNo || !customerId) {
      setFormError('يرجى تحديد رقم البوليصة واسم الزبون');
      setActiveTab('general');
      return;
    }

    if (totalAmount <= 0 && (!isMixedCurrency || (totalAmountUSD || 0) <= 0)) {
      setFormError('يرجى إدخال المبلغ الكلي للبوليصة بشكل صحيح');
      setActiveTab('financial');
      return;
    }

    if (isMixedCurrency) {
      if (initialPaid > totalAmount) {
        setFormError(`لا يجوز أن تكون الدفعة الأولى بالدينار أكبر من إجمالي الدينار للبوليصة`);
        setActiveTab('financial');
        return;
      }
      if ((initialPaidUSD || 0) > (totalAmountUSD || 0)) {
        setFormError(`لا يجوز أن تكون الدفعة الأولى بالدولار ($${initialPaidUSD}) أكبر من إجمالي الدولار ($${totalAmountUSD})`);
        setActiveTab('financial');
        return;
      }
    } else {
      if (equivalentInitialInBillCurr > totalAmount + 0.05) {
        setFormError(`لا يجوز أن يكون إجمالي المقدم المقبوض (المعادل: ${formatCurrency(equivalentInitialInBillCurr, currency)}) أكبر من إجمالي البوليصة (${formatCurrency(totalAmount, currency)})`);
        setActiveTab('financial');
        return;
      }
    }

    if (existingPayments > 0 && totalAmount < (existingPayments + (isMixedCurrency ? initialPaid : equivalentInitialInBillCurr))) {
      setFormError(`المبلغ الكلي لا يمكن أن يكون أقل من مجموع المبالغ المسددة بالفعل لهذه البوليصة`);
      setActiveTab('financial');
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
      deliveryOrderDate: deliveryOrderDate || undefined,
      clearanceDate: clearanceDate || undefined,
      exitDate: exitDate || undefined,
      containerReturnDate: containerReturnDate || undefined,
      goodsType,
      status,
      totalAmount: Number(totalAmount) || 0,
      initialPaid: Number(initialPaid) || 0,
      currency: isMixedCurrency ? 'IQD' : currency,
      exchangeRate: activeRate,
      isMixedCurrency,
      totalAmountUSD: isMixedCurrency ? Number(totalAmountUSD) || 0 : undefined,
      initialPaidUSD: Number(initialPaidUSD) || 0,
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed at top */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-xs">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  {initialData ? 'تعديل بيانات البوليصة الكمركية' : 'تسجيل بوليصة كمركية جديدة'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {billNo || 'جديد'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${COMPANIES[companyId]?.badgeClass}`}>
                  {COMPANIES[companyId]?.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إدخال بيانات المعاملة، التخليص الكمركي، المراحل التشغيلية، الحساب المالي، والنقل
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

        {/* Form Container */}
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

          {/* Elegant Top Tabs Navigation Bar */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Tab 1 */}
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTab === 'general'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. البيانات والمراحل</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-950 text-emerald-300 border border-slate-800">
                  {milestonesCount}/4
                </span>
              </button>

              {/* Tab 2 */}
              <button
                type="button"
                onClick={() => setActiveTab('financial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTab === 'financial'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>2. الاتفاق المالي</span>
                {(totalAmount > 0 || (totalAmountUSD || 0) > 0) && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-950 text-amber-300 border border-slate-800">
                    {isMixedCurrency ? 'مركب' : currency}
                  </span>
                )}
              </button>

              {/* Tab 3 */}
              <button
                type="button"
                onClick={() => setActiveTab('transport')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTab === 'transport'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. الحاويات والنقل</span>
                {containers.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-950 text-cyan-300 border border-slate-800">
                    {containers.length}
                  </span>
                )}
              </button>

              {/* Tab 4 */}
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTab === 'notes'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs ring-1 ring-purple-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                <span>4. الوكالة والملاحظات</span>
                {agencyDocument && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ الوكالة
                  </span>
                )}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
              <span>القسم:</span>
              <strong className="text-white">
                {activeTab === 'general' ? 'البيانات الأساسية والمراحل التشغيلية' : activeTab === 'financial' ? 'الاتفاق المالي وحساب الزبون' : activeTab === 'transport' ? 'الحاويات وأجور النقل البري' : 'ورقة الوكالة والملاحظات'}
              </strong>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-5">
            
            {/* ===================== TAB 1: البيانات والمراحل ===================== */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                {/* 1. اختيار الشركة المسؤولة */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>الشركة التابعة لها البوليصة / الفاتورة <span className="text-rose-400">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">نظام مالي وصندوق موحد</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCompanyId('naqaa_basra')}
                      className={`p-3 rounded-xl border text-right transition flex items-center gap-3 ${
                        companyId === 'naqaa_basra'
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-emerald-300">شركة نقاء البصرة</div>
                        <div className="text-[10px] text-slate-400">للتخليص الكمركي والنقل العام</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompanyId('sawt_aljanoub')}
                      className={`p-3 rounded-xl border text-right transition flex items-center gap-3 ${
                        companyId === 'sawt_aljanoub'
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-cyan-300">شركة صوت الجنوب</div>
                        <div className="text-[10px] text-slate-400">للتخليص الكمركي والخدمات اللوجستية</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. بيانات المعاملة والجهات */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>البيانات الأساسية وأطراف المعاملة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ فتح المعاملة / الاستلام</label>
                      <DatePicker
                        value={date}
                        onChange={(d) => setDate(d)}
                        placeholder="اختر التاريخ..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">حالة المعاملة</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                      >
                        <option value="pending">⏳ قيد التنفيذ</option>
                        <option value="issue">⚠️ معلقة</option>
                        <option value="completed">✅ منجزة</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        الزبون (الشركة / التاجر) <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                      >
                        <option value="">-- اختر الزبون --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">المخلص الكمركي المسؤول</label>
                      <select
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs font-semibold"
                      >
                        <option value="">-- اختر المخلص --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">نوع البضاعة والوصف</label>
                      <input
                        type="text"
                        value={goodsType}
                        onChange={(e) => setGoodsType(e.target.value)}
                        placeholder="مثال: أجهزة كهربائية، حاسبات، مواد كيمياوية..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. المراحل والتواريخ التشغيلية للشحنة */}
                <BillMilestonesEditor
                  deliveryOrderDate={deliveryOrderDate}
                  onDeliveryOrderDateChange={setDeliveryOrderDate}
                  clearanceDate={clearanceDate}
                  onClearanceDateChange={setClearanceDate}
                  exitDate={exitDate}
                  onExitDateChange={setExitDate}
                  containerReturnDate={containerReturnDate}
                  onContainerReturnDateChange={setContainerReturnDate}
                />

                {/* Navigation Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('financial')}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <span>المتابعة إلى الاتفاق المالي</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: الاتفاق المالي ===================== */}
            {activeTab === 'financial' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                {/* Currency Selector Pill Bar */}
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>تحديد عملة اتفاق البوليصة مع الزبون:</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>سعر الصرف (1$ أو 100$):</span>
                      <input
                        type="number"
                        min="1"
                        value={localRate === 0 ? '' : localRate}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === '' ? 0 : Number(val);
                          setLocalRate(num);
                          if (num >= 100 && onExchangeRateChange) {
                            onExchangeRateChange(normalizeExchangeRate(num, 1500), true);
                          }
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none text-center font-mono"
                      />
                      <span className="text-slate-500 font-mono">(1$ = {activeRate.toLocaleString('ar-IQ')} د.ع)</span>
                    </div>
                  </div>

                  {/* 3 Currency Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsMixedCurrency(false); setCurrency('IQD'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                        !isMixedCurrency && currency === 'IQD'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>🇮🇶 دينار عراقي فقط (IQD)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMixedCurrency(false); setCurrency('USD'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                        !isMixedCurrency && currency === 'USD'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>🇺🇸 دولار أمريكي فقط ($)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMixedCurrency(true); setCurrency('IQD'); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                        isMixedCurrency
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs ring-1 ring-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>🔄 اتفاق مركب (دينار + دولار معاً)</span>
                    </button>
                  </div>
                </div>

                {/* Single Currency Inputs */}
                {!isMixedCurrency ? (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-xs">
                          المبلغ الكلي للبوليصة ({currency === 'USD' ? 'دولار $' : 'دينار عراقي'}) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={totalAmount === 0 ? '' : totalAmount}
                          onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
                        />
                        {currency === 'USD' && totalAmount > 0 && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            المعادل التقديري: ≈ <strong className="text-emerald-400">{new Intl.NumberFormat('ar-IQ').format(Math.round(totalAmount * activeRate))} د.ع</strong>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">المتبقي على الزبون:</span>
                        <span className={`font-mono font-bold text-sm ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                          {formatCurrency(remaining, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Dual-currency initial payment fields */}
                    <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>استلام الدفعة الأولى (المقدم) من الزبون (دينار و/أو دولار معاً):</span>
                        </span>
                        {(initialPaid > 0 || (initialPaidUSD || 0) > 0) && (
                          <span className="text-[11px] font-mono text-emerald-400 font-bold" dir="ltr">
                            المعادل المخصوم: {formatCurrency(equivalentInitialInBillCurr, currency)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
                            المقبوض نقداً بالدينار (د.ع)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={initialPaid === 0 ? '' : initialPaid}
                            onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                            placeholder="0 د.ع"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-emerald-400 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
                          />
                          {currency === 'USD' && initialPaid > 0 && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              يعادل: ≈ <strong className="text-emerald-400">${(Math.round((initialPaid / activeRate) * 100) / 100).toLocaleString()}</strong>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
                            المقبوض نقداً بالدولار ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={initialPaidUSD === 0 ? '' : initialPaidUSD}
                            onChange={(e) => setInitialPaidUSD(Number(e.target.value) || 0)}
                            placeholder="$0"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-400 font-mono text-sm font-bold focus:border-cyan-500 focus:outline-none"
                          />
                          {currency === 'IQD' && (initialPaidUSD || 0) > 0 && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              يعادل: ≈ <strong className="text-cyan-400">{new Intl.NumberFormat('ar-IQ').format(Math.round((initialPaidUSD || 0) * activeRate))} د.ع</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Live Treasury Reflection Preview */}
                      {(initialPaid > 0 || (initialPaidUSD || 0) > 0) && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-1">
                          <span>انعكاس الصندوق اللحظي:</span>
                          <div className="font-mono font-bold flex items-center gap-2">
                            {initialPaid > 0 && <span className="text-emerald-400">+{new Intl.NumberFormat('ar-IQ').format(initialPaid)} د.ع (صندوق الدينار)</span>}
                            {initialPaid > 0 && (initialPaidUSD || 0) > 0 && <span className="text-slate-600">|</span>}
                            {(initialPaidUSD || 0) > 0 && <span className="text-cyan-400">+${(initialPaidUSD || 0).toLocaleString()} (صندوق الدولار)</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Mixed Currency Section (د.ع + $) */
                  <div className="space-y-3 p-4 bg-slate-950/70 rounded-2xl border border-amber-500/30">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>تحديد اتفاق البوليصة بالعملتين مع الزبون (دينار + دولار معاً):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        سعر الصرف: 1$ = {activeRate.toLocaleString('ar-IQ')} د.ع
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Part 1: IQD Agreement */}
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <span>🇮🇶 اتفاق الدينار العراقي (د.ع)</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            المتبقي: <strong className={`font-mono ${remaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">{formatCurrency(remaining, 'IQD')}</strong>
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-300 text-[10px] font-semibold mb-1">
                              المبلغ الكلي بالدينار (د.ع) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={totalAmount === 0 ? '' : totalAmount}
                              onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                              placeholder="مثال: 1,000 د.ع أو 5,000,000 د.ع"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-300 text-[10px] font-semibold mb-1">
                              المقدم المقبوض بالدينار (د.ع)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={initialPaid === 0 ? '' : initialPaid}
                              onChange={(e) => setInitialPaid(Number(e.target.value) || 0)}
                              placeholder="0 د.ع"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Part 2: USD Agreement */}
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                            <span>🇺🇸 اتفاق الدولار الأمريكي ($)</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            المتبقي: <strong className={`font-mono ${remainingUSD === 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">{formatCurrency(remainingUSD, 'USD')}</strong>
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-300 text-[10px] font-semibold mb-1">
                              المبلغ الكلي بالدولار ($) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={totalAmountUSD === 0 ? '' : totalAmountUSD}
                              onChange={(e) => setTotalAmountUSD(Number(e.target.value) || 0)}
                              placeholder="مثال: $500 أو $2,000"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-300 text-[10px] font-semibold mb-1">
                              المقدم المقبوض بالدولار ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={initialPaidUSD === 0 ? '' : initialPaidUSD}
                              onChange={(e) => setInitialPaidUSD(Number(e.target.value) || 0)}
                              placeholder="$0"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mixed Contract Live Summary Box */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">المبلغ الإجمالي المتفق عليه:</span>
                        <span className="font-mono font-bold text-white text-xs" dir="ltr">
                          {formatCurrency(totalAmount || 0, 'IQD')} + {formatCurrency(totalAmountUSD || 0, 'USD')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>المعادل التقديري الإجمالي:</span>
                        <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                          ≈ {new Intl.NumberFormat('ar-IQ').format((totalAmount || 0) + ((totalAmountUSD || 0) * activeRate))} د.ع
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-semibold">المتبقي الصافي بذمة الزبون:</span>
                        <span className="font-mono font-bold text-amber-400 text-xs" dir="ltr">
                          {formatCurrency(remaining, 'IQD')} + {formatCurrency(remainingUSD, 'USD')}
                        </span>
                      </div>
                      {(initialPaid > 0 || (initialPaidUSD || 0) > 0) && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                          <span>انعكاس الصندوق اللحظي:</span>
                          <div className="font-mono font-bold flex items-center gap-2">
                            {initialPaid > 0 && <span className="text-emerald-400">+{new Intl.NumberFormat('ar-IQ').format(initialPaid)} د.ع (صندوق الدينار)</span>}
                            {initialPaid > 0 && (initialPaidUSD || 0) > 0 && <span className="text-slate-600">|</span>}
                            {(initialPaidUSD || 0) > 0 && <span className="text-cyan-400">+${(initialPaidUSD || 0).toLocaleString()} (صندوق الدولار)</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Direct Operational Expenses on Bill (رسوم كمركية، موانئ، فحص، عمال، نثريات) */}
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-purple-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold text-sm">💸</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>المصاريف الكمركية والتشغيلية المخصومة من الصندوق</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                            {directExpensesOnBill.length} سند
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          رسوم كمرك، عوائد موانئ، سونار، فحص، عمال، أو نثريات تُصرف وتخصم من صندوق الدينار أو الدولار
                        </p>
                      </div>
                    </div>

                    {initialData && onOpenAddExpense && (
                      <button
                        type="button"
                        onClick={() => onOpenAddExpense(initialData)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>+ صرف مصروف جديد 💸</span>
                      </button>
                    )}
                  </div>

                  {directExpensesOnBill.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400">إجمالي المصاريف المصروفة من الصندوق:</span>
                        <div className="font-mono font-bold text-purple-300 flex items-center gap-2" dir="ltr">
                          {directExpensesIQDOnBill > 0 && (
                            <span className="text-purple-300">{formatCurrency(directExpensesIQDOnBill, 'IQD')}</span>
                          )}
                          {directExpensesIQDOnBill > 0 && directExpensesUSDOnBill > 0 && <span className="text-slate-600">+</span>}
                          {directExpensesUSDOnBill > 0 && (
                            <span className="text-cyan-400">{formatCurrency(directExpensesUSDOnBill, 'USD')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
                        {directExpensesOnBill.map(exp => (
                          <div
                            key={exp.id}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] flex items-center gap-1.5"
                          >
                            <span className="font-mono text-purple-400 font-bold">{exp.voucherNo}</span>
                            <span className="text-slate-300">{exp.category}</span>
                            <span className="font-mono font-bold text-rose-400" dir="ltr">
                              -{formatCurrency(exp.amount, exp.currency || 'IQD')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/60">
                      {initialData ? (
                        <span>لا توجد مصاريف كمركية مصروفة على هذه البوليصة بعد. يمكنك تسجيل وصرف أي رسوم أو نثريات عبر زر "صرف مصروف جديد".</span>
                      ) : (
                        <span>فور حفظ البوليصة، يمكنك إضافة وصرف أي مصاريف كمركية وموانئ ونثريات بالدينار أو بالدولار مع خصمها آلياً من الصندوق.</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة إلى البيانات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transport')}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <span>المتابعة إلى الحاويات والنقل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================== TAB 3: الحاويات والنقل ===================== */}
            {activeTab === 'transport' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                {/* 1. محرر الحاويات */}
                <ContainersEditor
                  containers={containers}
                  setContainers={setContainers}
                />

                {/* 2. Notice if transport is cleared while payments exist */}
                {hasPaidCarriersOnBill && (!hasTransport || transportTrips.length === 0) && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs flex items-start gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-amber-300 text-sm">
                        تنبيه محاسبي: انعكاس استرداد أجور النقل إلى الصندوق
                      </div>
                      <div className="text-slate-300 leading-relaxed text-[11px]">
                        تم مسح / إلغاء نقلات وشاحنات هذه البوليصة، وتوجد دفعات أجور نقل مسددة للنواقل سابقاً من الصندوق بقيمة{' '}
                        <strong className="text-emerald-400 font-mono">
                          {carrierPaidIQDOnBill > 0 ? formatCurrency(carrierPaidIQDOnBill, 'IQD') : ''}
                          {carrierPaidUSDOnBill > 0 ? `${carrierPaidIQDOnBill > 0 ? ' + ' : ''}${formatCurrency(carrierPaidUSDOnBill, 'USD')}` : ''}
                        </strong>.
                        عند حفظ البوليصة، سيقوم النظام تلقائياً بإلغاء سندات الصرف دفترياً وإعادة كامل المبالغ فوراً إلى رصيد الصندوق.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. الشحن والنقل البري */}
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('financial')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة إلى الاتفاق المالي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <span>المتابعة إلى الوكالة والملاحظات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================== TAB 4: الوكالة والملاحظات ===================== */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                {/* 1. ورقة الوكالة الرسمية */}
                <AgencyDocumentUploader
                  agencyDocument={agencyDocument}
                  setAgencyDocument={setAgencyDocument}
                  billNo={billNo}
                  onViewArchive={onViewArchive}
                  setFormError={setFormError}
                />

                {/* 2. الملاحظات ومكتبة العبارات الكمركية */}
                <CustomsNotesPicker
                  notes={notes}
                  setNotes={setNotes}
                />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('transport')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة إلى الحاويات والنقل</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
                  >
                    <span>💾 حفظ بيانات البوليصة</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Hidden input for footer agency upload button */}
          <input
            ref={footerAgencyInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFooterAgencyUpload}
            className="hidden"
          />

          {/* Footer - Always Visible at the Bottom with Real-time Financial Counters */}
          <div className="px-5 py-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
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
                  {isMixedCurrency || ((initialPaid || 0) > 0 && (initialPaidUSD || 0) > 0)
                    ? `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع + $${(initialPaidUSD || 0).toLocaleString()}`
                    : (initialPaidUSD || 0) > 0
                    ? `$${(initialPaidUSD || 0).toLocaleString()}`
                    : `${new Intl.NumberFormat('ar-IQ').format(initialPaid || 0)} د.ع`}
                </span>
              </span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500">الحاويات:</span>
                <span className="font-mono font-bold text-cyan-400">{containers.length}</span>
              </span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500">المراحل:</span>
                <span className="font-mono font-bold text-purple-400">{milestonesCount}/4</span>
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
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition text-xs"
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
