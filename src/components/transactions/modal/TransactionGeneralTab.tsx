import React from 'react';
import { Building2, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { Customer, Employee, CompanyId, Transaction } from '../../../types/customs';
import { DatePicker } from '../../ui/date-picker';
import { BillMilestonesEditor } from '../BillMilestonesEditor';

export interface TransactionGeneralTabProps {
  companyId: CompanyId;
  setCompanyId: (id: CompanyId) => void;
  billNo: string;
  setBillNo: (no: string) => void;
  jobNumber: string;
  setJobNumber: (no: string) => void;
  date: string;
  setDate: (date: string) => void;
  status: Transaction['status'];
  setStatus: (s: Transaction['status']) => void;
  customerId: string;
  setCustomerId: (id: string) => void;
  employeeId: string;
  setEmployeeId: (id: string) => void;
  goodsType: string;
  setGoodsType: (gt: string) => void;
  customers: Customer[];
  employees: Employee[];
  initialData?: Transaction | null;
  deliveryOrderDate: string;
  setDeliveryOrderDate: (d: string) => void;
  clearanceDate: string;
  setClearanceDate: (d: string) => void;
  exitDate: string;
  setExitDate: (d: string) => void;
  containerReturnDate: string;
  setContainerReturnDate: (d: string) => void;
  freeTimeDays: number | '';
  setFreeTimeDays: (days: number | '') => void;
  containerDestination: string;
  setContainerDestination: (dest: string) => void;
  onNext: () => void;
}

export const TransactionGeneralTab: React.FC<TransactionGeneralTabProps> = ({
  companyId,
  setCompanyId,
  billNo,
  setBillNo,
  jobNumber,
  setJobNumber,
  date,
  setDate,
  status,
  setStatus,
  customerId,
  setCustomerId,
  employeeId,
  setEmployeeId,
  goodsType,
  setGoodsType,
  customers,
  employees,
  initialData,
  deliveryOrderDate,
  setDeliveryOrderDate,
  clearanceDate,
  setClearanceDate,
  exitDate,
  setExitDate,
  containerReturnDate,
  setContainerReturnDate,
  freeTimeDays,
  setFreeTimeDays,
  containerDestination,
  setContainerDestination,
  onNext,
}) => {
  const handleGenerateNewBillNo = () => {
    const randomBill = `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setBillNo(randomBill);
  };

  const handleGenerateNewJobNo = () => {
    const randomJob = `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setJobNumber(randomJob);
  };

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200 text-xs">
      {/* 1. اختيار الشركة المسؤولة */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-750 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-slate-100 font-bold text-xs flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>الشركة التابعة لها البوليصة <span className="text-rose-400">*</span></span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            صندوق مالي موحد
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCompanyId('naqaa_basra')}
            className={`p-2 rounded-xl border text-right transition flex items-center gap-2.5 ${
              companyId === 'naqaa_basra'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500/40'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50" />
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-300">شركة نقاء البصرة للتخليص الكمركي</span>
              {companyId === 'naqaa_basra' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  ✓ معتمدة
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCompanyId('sawt_aljanoub')}
            className={`p-2 rounded-xl border text-right transition flex items-center gap-2.5 ${
              companyId === 'sawt_aljanoub'
                ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-xs ring-1 ring-cyan-500/40'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400 shrink-0 shadow-sm shadow-cyan-400/50" />
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-300">شركة صوت الجنوب للتخليص الكمركي</span>
              {companyId === 'sawt_aljanoub' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  ✓ معتمدة
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 2. بيانات المعاملة وأطرافها */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-750 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>هوية البوليصة والبيانات الأساسية</span>
          </span>
        </div>

        {/* Grid 1: B/L No, Job No, Date, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-200 font-bold text-[11px]">
                رقم البوليصة (B/L) <span className="text-rose-400">*</span>
              </label>
              {!initialData && (
                <button
                  type="button"
                  onClick={handleGenerateNewBillNo}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-0.5"
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
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-emerald-300 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-200 font-bold text-[11px]">
                رقم المعاملة (Job No)
              </label>
              {!initialData && (
                <button
                  type="button"
                  onClick={handleGenerateNewJobNo}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-0.5"
                  title="توليد رقم معاملة جديد"
                >
                  <Sparkles className="w-2.5 h-2.5" /> توليد
                </button>
              )}
            </div>
            <input
              type="text"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              placeholder="JOB-2026-..."
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-cyan-300 font-mono text-xs font-bold focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-bold mb-1 text-[11px]">تاريخ فتح المعاملة</label>
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              placeholder="اختر التاريخ..."
            />
          </div>

          <div>
            <label className="block text-slate-200 font-bold mb-1 text-[11px]">حالة البوليصة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2 text-slate-100 font-bold text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="pending" className="bg-slate-900 text-amber-300">⏳ قيد الإجراء والتخليص</option>
              <option value="issue" className="bg-slate-900 text-rose-300">⚠️ معلقة أو تحت الكشف</option>
              <option value="completed" className="bg-slate-900 text-emerald-300">✅ منجزة ومسلمة بالكامل</option>
            </select>
          </div>
        </div>

        {/* Grid 2: Customer, Broker, Goods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
          <div>
            <label className="block text-slate-200 font-bold text-[11px] mb-1">
              الزبون (الشركة التجارية) <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2 text-slate-100 font-bold text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- اختر الزبون التجاري --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white font-bold">{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-200 font-bold text-[11px] mb-1">المخلص الكمركي المسؤول</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2 text-slate-100 font-bold text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- اختر المخلص المسؤول --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-slate-900 text-white font-bold">{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-200 font-bold text-[11px] mb-1">نوع البضاعة والوصف</label>
            <input
              type="text"
              value={goodsType}
              onChange={(e) => setGoodsType(e.target.value)}
              placeholder="مثال: أجهزة كهربائية، معدات..."
              className="w-full h-8 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-slate-100 font-semibold text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. المراحل والتواريخ التشغيلية ومحددات الحاوية */}
      <BillMilestonesEditor
        deliveryOrderDate={deliveryOrderDate}
        onDeliveryOrderDateChange={setDeliveryOrderDate}
        clearanceDate={clearanceDate}
        onClearanceDateChange={setClearanceDate}
        exitDate={exitDate}
        onExitDateChange={setExitDate}
        containerReturnDate={containerReturnDate}
        onContainerReturnDateChange={setContainerReturnDate}
        freeTimeDays={freeTimeDays}
        onFreeTimeDaysChange={setFreeTimeDays}
        containerDestination={containerDestination}
        onContainerDestinationChange={setContainerDestination}
      />

      {/* Navigation Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onNext}
          className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition shadow-xs cursor-pointer"
        >
          <span>المتابعة إلى الإنفاق المالي</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
