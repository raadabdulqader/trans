'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  HardHat, 
  Phone, 
  Calendar, 
  Coins, 
  CheckCheck, 
  FileText, 
  Paperclip,
  Eye,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  Users,
  Building2,
  Wallet,
  Briefcase,
  Search,
  ArrowDownLeft,
  BadgeDollarSign
} from 'lucide-react';
import { Employee, EmployeeCategory, Transaction, Receipt, AppUser, TreasuryAttachment, TreasuryTransaction } from '../types/customs';
import { formatCurrency, getEmployeeAdvances } from '../utils/storage';

interface EmployeesViewProps {
  employees: Employee[];
  transactions: Transaction[];
  receipts: Receipt[];
  treasury?: TreasuryTransaction[];
  currentUser: AppUser;
  onAddEmployee: (category?: EmployeeCategory) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onViewEmployeeDetail: (emp: Employee) => void;
  onDisburseAdvance: (emp: Employee) => void;
  onSettleAdvance: (emp: Employee) => void;
  onPaySalary?: (emp: Employee) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  transactions,
  receipts,
  treasury = [],
  currentUser,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployeeDetail,
  onDisburseAdvance,
  onSettleAdvance,
  onPaySalary,
  onViewArchive,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'brokers'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpForAction, setSelectedEmpForAction] = useState<string>('');

  // Overall calculations across brokers (IQD & USD separated)
  const brokerStats = useMemo(() => {
    let advancesIQD = 0, settledIQD = 0;
    let advancesUSD = 0, settledUSD = 0;
    employees.forEach(emp => {
      const adv = getEmployeeAdvances(emp.id, receipts);
      advancesIQD += adv.advancesIQD;
      settledIQD += adv.settledIQD;
      advancesUSD += adv.advancesUSD;
      settledUSD += adv.settledUSD;
    });
    return {
      advancesIQD,
      settledIQD,
      openIQD: Math.max(0, advancesIQD - settledIQD),
      advancesUSD,
      settledUSD,
      openUSD: Math.max(0, advancesUSD - settledUSD),
    };
  }, [employees, receipts]);

  // Overall calculations for staff
  const staffStats = useMemo(() => {
    const staffList = employees.filter(e => e.category === 'staff' || e.category === 'both' || !e.category);
    const totalBaseSalary = staffList.reduce((sum, e) => sum + (e.baseSalary || 0), 0);
    
    // Sum all active salaries paid from company treasury
    const totalSalariesPaid = treasury
      .filter(t => t.status !== 'cancelled' && t.type === 'withdrawal' && (t.subAccount === 'salaries' || t.category.includes('راتب') || t.category.includes('رواتب')))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      count: staffList.length,
      totalBaseSalary,
      totalSalariesPaid,
    };
  }, [employees, treasury]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Tab filter
      if (activeTab === 'staff') {
        const isStaff = emp.category === 'staff' || emp.category === 'both' || (!emp.category && !emp.notes?.includes('ميناء'));
        if (!isStaff) return false;
      } else if (activeTab === 'brokers') {
        const isBroker = emp.category === 'broker' || emp.category === 'both' || (!emp.category && (emp.notes?.includes('ميناء') || transactions.some(t => t.employeeId === emp.id)));
        if (!isBroker) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchPhone = emp.phone?.toLowerCase().includes(q);
        const matchJob = emp.jobTitle?.toLowerCase().includes(q);
        const matchDept = emp.department?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchJob && !matchDept) return false;
      }

      return true;
    });
  }, [employees, activeTab, searchTerm, transactions]);

  // Helper to get total active salaries disbursed for a single employee
  const getEmployeePaidSalaries = (emp: Employee) => {
    return treasury
      .filter(t => 
        t.status !== 'cancelled' &&
        t.type === 'withdrawal' && 
        (t.subAccount === 'salaries' || t.category.includes('راتب')) &&
        (t.partyName?.trim() === emp.name.trim() || t.description?.includes(emp.name))
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Main Sub-tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-amber-500/20 text-white border border-slate-700 text-2xl">
              👥
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>إدارة كوادر وموظفي الشركة والمخلصين</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
                  سجل موحد
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة موظفي الشركة الإداريين، المحاسبين، السائقين، والعمال، بالإضافة لمتابعة سلف المخلصين الكمركيين
              </p>
            </div>
          </div>

          {/* Quick Action Creation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onAddEmployee('staff')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ إضافة موظف شركة</span>
            </button>

            <button
              onClick={() => onAddEmployee('broker')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>+ إضافة مخلص كمركي</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>🏢 موظفو وكادر الشركة (الرواتب والوظائف)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-blue-400 font-mono text-[10px]">
                {employees.filter(e => e.category === 'staff' || e.category === 'both' || !e.category).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('brokers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'brokers'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>👷 المخلصون الكمركيون (السلف والتسويات)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 font-mono text-[10px]">
                {employees.filter(e => e.category === 'broker' || e.category === 'both').length || employees.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>عرض كافة الكوادر ({employees.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، المسمى، أو الهاتف..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Metric KPI Cards (Dynamic according to selected tab) */}
      {activeTab === 'staff' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>إجمالي موظفي الشركة</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                كادر الشركة
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {staffStats.count} <span className="text-xs font-normal text-slate-400">موظف مسجل</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">كادر الإدارة، الحسابات، النقل، والخدمات</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                <span>الرواتب الشهرية المعتمدة</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                استحقاق شهري
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono" dir="ltr">
              {formatCurrency(staffStats.totalBaseSalary)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">إجمالي الرواتب الأساسية المقررة لموظفي الشركة</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>الرواتب المصروفة من الصندوق</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                منصرف فعلي
              </span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono" dir="ltr">
              {formatCurrency(staffStats.totalSalariesPaid)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">مجموع الرواتب المقيدة والمخصومة من الصندوق</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>إجمالي السلف المصروفة</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                صادر
              </span>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono" dir="ltr">
              {formatCurrency(brokerStats.advancesIQD, 'IQD')}
            </div>
            {brokerStats.advancesUSD > 0 && (
              <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
                + {formatCurrency(brokerStats.advancesUSD, 'USD')}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">كافة المبالغ المصروفة كعهدة للمخلصين</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>المسدد بالوصولات الكمركية</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                مصفى ومؤرشف
              </span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono" dir="ltr">
              {formatCurrency(brokerStats.settledIQD, 'IQD')}
            </div>
            {brokerStats.settledUSD > 0 && (
              <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
                + {formatCurrency(brokerStats.settledUSD, 'USD')}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">مبالغ تمت تصفيتها بموجب وصولات رسمية</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>صافي السلف المفتوحة حالياً</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                مستحقة التصفية
              </span>
            </div>
            <div className="text-xl font-black text-rose-400 font-mono" dir="ltr">
              {formatCurrency(brokerStats.openIQD, 'IQD')}
            </div>
            {brokerStats.openUSD > 0 && (
              <div className="text-sm font-black text-rose-300 font-mono mt-0.5" dir="ltr">
                + {formatCurrency(brokerStats.openUSD, 'USD')}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">المبالغ المتبقية بذمة المخلصين قيد العمل</p>
          </div>
        </div>
      )}

      {/* Main Content View (Staff Table or Broker Cards) */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <div className="text-5xl">{activeTab === 'staff' ? '🏢' : '👷'}</div>
          <h3 className="font-bold text-white text-base">
            {activeTab === 'staff' ? 'لا يوجد موظفون مسجلون في كادر الشركة' : 'لا يوجد مخلصون مسجلون حالياً'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {activeTab === 'staff'
              ? 'أضف أول موظف لتحديد راتبه الأساسي، والمسمى الوظيفي، وتسهيل صرف الرواتب الشهرية مباشرة بضغطة زر مع خصمها من الصندوق.'
              : 'اضغط على زر "إضافة مخلص كمركي جديد" لإضافة أول مخلص والبدء بإدارة السلف النقدية، وتسجيل المبالغ المسددة بالوصولات.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onAddEmployee(activeTab === 'staff' ? 'staff' : 'broker')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'staff' ? 'إضافة موظف شركة الآن' : 'إضافة مخلص كمركي الآن'}</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'staff' ? (
        /* Company Staff Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">قائمة موظفي وكادر الشركة والرواتب</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              العدد: <strong className="text-blue-400 font-bold">{filteredEmployees.length}</strong> موظف
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">اسم الموظف</th>
                  <th className="py-3.5 px-4">المسمى الوظيفي</th>
                  <th className="py-3.5 px-4">القسم / الفرع</th>
                  <th className="py-3.5 px-4">الراتب الأساسي الشهري</th>
                  <th className="py-3.5 px-4">رقم الهاتف والهوية</th>
                  <th className="py-3.5 px-4">تاريخ المباشرة</th>
                  <th className="py-3.5 px-4">إجمالي الرواتب المستلمة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات وصرف الراتب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEmployees.map((emp, idx) => {
                  const paidTotal = getEmployeePaidSalaries(emp);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                            👤
                          </div>
                          <div>
                            <strong className="block text-white text-xs font-bold">{emp.name}</strong>
                            <span className="text-[10px] text-slate-400">
                              {emp.category === 'both' ? 'موظف ومخلص كمركي' : 'موظف شركة'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {emp.jobTitle || 'موظف عام'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {emp.department || 'الإدارة العامة'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400" dir="ltr">
                        {formatCurrency(emp.baseSalary || 0)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div>{emp.phone || '—'}</div>
                        {emp.idNo && <div className="text-[10px] text-slate-400 font-mono">هوية: {emp.idNo}</div>}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {emp.joinDate || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300" dir="ltr">
                        {paidTotal > 0 ? (
                          <span className="text-cyan-300 font-bold">{formatCurrency(paidTotal)}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">لم يصرف بعد</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onPaySalary && (currentUser.role === 'admin' || currentUser.permissions.createExpenses !== false) && (
                            <button
                              onClick={() => onPaySalary(emp)}
                              title="صرف راتب فوري من الصندوق"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                            >
                              <BadgeDollarSign className="w-3.5 h-3.5" />
                              <span>صرف راتب</span>
                            </button>
                          )}

                          <button
                            onClick={() => onEditEmployee(emp)}
                            title="تعديل بيانات الموظف والراتب"
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteEmployee(emp)}
                            title="حذف الموظف"
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Brokers Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const empTransactions = transactions.filter(t => t.employeeId === emp.id);
            const empReceipts = receipts.filter(r => r.employeeId === emp.id);
            const adv = getEmployeeAdvances(emp.id, receipts);
            const archivedVouchers = empReceipts.filter(r => !!r.attachment);

            return (
              <div 
                key={emp.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition group space-y-4"
              >
                {/* Header Info */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/20 shadow-xs">
                        👷
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                          {emp.name}
                        </h3>
                        <div className="text-xs text-slate-400 font-mono">
                          {emp.idNo ? `رقم الهوية: ${emp.idNo}` : 'بدون رقم هوية'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="تعديل بيانات المخلص"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(emp)}
                        title="حذف المخلص"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Broker Contacts and Department */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-[11px] truncate">{emp.phone || 'لا يوجد هاتف'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-[11px] truncate">{emp.department || 'التخليص الميداني'}</span>
                    </div>
                  </div>

                  {/* 3 Financial Sub-metrics per Broker (IQD & USD) */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">السلف المصروفة</span>
                      <strong className="text-xs text-amber-300 font-mono block truncate" dir="ltr">
                        {formatCurrency(adv.advancesIQD, 'IQD')}
                      </strong>
                      {adv.advancesUSD > 0 && (
                        <strong className="text-[11px] text-cyan-400 font-mono block truncate" dir="ltr">
                          + {formatCurrency(adv.advancesUSD, 'USD')}
                        </strong>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">المسدد بوصولات</span>
                      <strong className="text-xs text-emerald-400 font-mono block truncate" dir="ltr">
                        {formatCurrency(adv.settledIQD, 'IQD')}
                      </strong>
                      {adv.settledUSD > 0 && (
                        <strong className="text-[11px] text-cyan-400 font-mono block truncate" dir="ltr">
                          + {formatCurrency(adv.settledUSD, 'USD')}
                        </strong>
                      )}
                    </div>

                    <div className={`rounded-lg p-0.5 ${(adv.openIQD > 0 || adv.openUSD > 0) ? 'bg-rose-500/10' : ''}`}>
                      <span className={`text-[10px] block mb-0.5 font-bold ${(adv.openIQD > 0 || adv.openUSD > 0) ? 'text-rose-400' : 'text-slate-400'}`}>
                        الرصيد المفتوح
                      </span>
                      <strong className={`text-xs font-mono block truncate ${adv.openIQD > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`} dir="ltr">
                        {formatCurrency(adv.openIQD, 'IQD')}
                      </strong>
                      {adv.openUSD > 0 && (
                        <strong className="text-[11px] text-rose-300 font-mono font-bold block truncate" dir="ltr">
                          + {formatCurrency(adv.openUSD, 'USD')}
                        </strong>
                      )}
                    </div>
                  </div>

                  {/* Activity badges */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{empTransactions.length} بوليصة كمركية</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-semibold">{archivedVouchers.length} وصل مؤرشف</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons for Broker */}
                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {(currentUser.role === 'admin' || currentUser.permissions.disburseAdvance !== false) ? (
                      <button
                        onClick={() => onDisburseAdvance(emp)}
                        className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>صرف سلفة</span>
                      </button>
                    ) : (
                      <div className="py-2 px-3 bg-slate-950/60 text-slate-500 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1 opacity-60 cursor-not-allowed">
                        <Coins className="w-3.5 h-3.5" />
                        <span>صرف سلفة (محجوب)</span>
                      </div>
                    )}

                    {(currentUser.role === 'admin' || currentUser.permissions.settleAdvance !== false) ? (
                      <button
                        onClick={() => onSettleAdvance(emp)}
                        className="py-2 px-3 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>تسوية بالوصول</span>
                      </button>
                    ) : (
                      <div className="py-2 px-3 bg-slate-950/60 text-slate-500 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1 opacity-60 cursor-not-allowed">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>تسوية (محجوب)</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onViewEmployeeDetail(emp)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>كشف الحساب وسجل السلف والتسويات</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
