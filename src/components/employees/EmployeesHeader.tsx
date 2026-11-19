import React from 'react';
import { Users, HardHat, Search } from 'lucide-react';
import { Employee, EmployeeCategory } from '../../types/customs';

interface EmployeesHeaderProps {
  employees: Employee[];
  activeTab: 'all' | 'staff' | 'brokers';
  setActiveTab: (tab: 'all' | 'staff' | 'brokers') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddEmployee: (category?: EmployeeCategory) => void;
}

export const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({
  employees,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  onAddEmployee,
}) => {
  const staffCount = employees.filter(
    (e) => e.category === 'staff' || e.category === 'both' || !e.category
  ).length;
  const brokerCount =
    employees.filter((e) => e.category === 'broker' || e.category === 'both').length ||
    employees.length;

  return (
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ إضافة موظف شركة</span>
          </button>

          <button
            onClick={() => onAddEmployee('broker')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>🏢 موظفو وكادر الشركة (الرواتب والوظائف)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-blue-400 font-mono text-[10px]">
              {staffCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('brokers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'brokers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>👷 المخلصون الكمركيون (السلف والتسويات)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 font-mono text-[10px]">
              {brokerCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
  );
};
