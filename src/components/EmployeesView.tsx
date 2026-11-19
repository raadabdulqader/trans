'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Employee, EmployeeCategory, Transaction, Receipt, AppUser, TreasuryAttachment, TreasuryTransaction } from '../types/customs';
import { getEmployeeAdvances } from '../utils/storage';
import { EmployeesHeader } from './employees/EmployeesHeader';
import { EmployeesMetricsCards } from './employees/EmployeesMetricsCards';
import { StaffTable } from './employees/StaffTable';
import { BrokersCardsGrid } from './employees/BrokersCardsGrid';

export interface EmployeesViewProps {
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
      {/* Top Banner with Main Sub-tabs & Search */}
      <EmployeesHeader
        employees={employees}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddEmployee={onAddEmployee}
      />

      {/* Metric KPI Cards (Dynamic according to selected tab) */}
      <EmployeesMetricsCards
        activeTab={activeTab}
        staffStats={staffStats}
        brokerStats={brokerStats}
      />

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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'staff' ? 'إضافة موظف شركة الآن' : 'إضافة مخلص كمركي الآن'}</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'staff' ? (
        <StaffTable
          filteredEmployees={filteredEmployees}
          currentUser={currentUser}
          getEmployeePaidSalaries={getEmployeePaidSalaries}
          onPaySalary={onPaySalary}
          onEditEmployee={onEditEmployee}
          onDeleteEmployee={onDeleteEmployee}
        />
      ) : (
        <BrokersCardsGrid
          filteredEmployees={filteredEmployees}
          transactions={transactions}
          receipts={receipts}
          currentUser={currentUser}
          onEditEmployee={onEditEmployee}
          onDeleteEmployee={onDeleteEmployee}
          onDisburseAdvance={onDisburseAdvance}
          onSettleAdvance={onSettleAdvance}
          onViewEmployeeDetail={onViewEmployeeDetail}
        />
      )}
    </div>
  );
};
