import React, { useState, useEffect } from 'react';
import { X, Trash2, Users, HardHat, Building2, Coins } from 'lucide-react';
import { Employee, EmployeeCategory } from '../../types/customs';

interface EmployeeModalProps {
  isOpen: boolean;
  initialData?: Employee | null;
  defaultCategory?: EmployeeCategory;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
  onDelete?: (employee: Employee) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  initialData,
  defaultCategory = 'staff',
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EmployeeCategory>(defaultCategory);
  const [jobTitle, setJobTitle] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(1000000);
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [idNo, setIdNo] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [notes, setNotes] = useState('');

  const jobTitlePresets = [
    'محاسب مالي',
    'مدير حسابات',
    'مدير إدارة ومتابعة',
    'إداري وشؤون موظفين',
    'سائق نقل وشاحنات',
    'مخلص كمركي معتمد',
    'معقب معاملات كمركية',
    'مدخل بيانات وبوالص',
    'أمين مخزن ومستودع',
    'موظف علاقات زبائن',
    'حارس وأمن مكتب',
    'عامل خدمات ونظافة',
  ];

  const departmentPresets = [
    'الإدارة العامة / المقر الرئيسي',
    'قسم الحسابات والمالية',
    'قسم التخليص الكمركي الميداني',
    'قسم النقل والحركة واللوجستيك',
    'فرع ميناء أم قصر',
    'فرع مطار بغداد الدولي',
    'فرع المنافذ البرية (زرباطية / الشلامجة)',
    'إدارة المستودعات والساحات',
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category || 'staff');
      setJobTitle(initialData.jobTitle || (initialData.category === 'broker' ? 'مخلص كمركي' : 'موظف شركة'));
      setBaseSalary(initialData.baseSalary || 1000000);
      setDepartment(initialData.department || '');
      setPhone(initialData.phone || '');
      setIdNo(initialData.idNo || '');
      setJoinDate(initialData.joinDate || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCategory(defaultCategory);
      setJobTitle(defaultCategory === 'broker' ? 'مخلص كمركي معتمد' : 'موظف بالشركة');
      setBaseSalary(1000000);
      setDepartment(defaultCategory === 'broker' ? 'قسم التخليص الكمركي الميداني' : 'الإدارة العامة / المقر الرئيسي');
      setPhone('');
      setIdNo('');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialData, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      category,
      jobTitle: jobTitle.trim(),
      baseSalary: Number(baseSalary) || 0,
      department: department.trim(),
      phone: phone.trim(),
      idNo: idNo.trim(),
      joinDate,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
              category === 'staff' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : category === 'broker'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {category === 'staff' ? '👥' : category === 'broker' ? '👷' : '⭐'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>
                  {initialData
                    ? `تعديل بيانات: ${initialData.name}`
                    : category === 'staff'
                    ? 'إضافة موظف جديد لكادر الشركة'
                    : category === 'broker'
                    ? 'إضافة مخلص كمركي جديد'
                    : 'إضافة عضو كادر للشركة'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {category === 'staff'
                  ? 'تسجيل موظفي وكادر الشركة والرواتب الشهرية والبيانات الوظيفية'
                  : 'تسجيل مخلص كمركي ميداني لمتابعة السلف والبوالص'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Category Selector (Staff vs Broker vs Both) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-[11px]">
              تصنيف الكادر / طبيعة العمل <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('staff')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                  category === 'staff'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🏢 موظف شركة</span>
                <span className="text-[10px] opacity-75 font-normal">إداري / محاسب / سائق</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('broker')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                  category === 'broker'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👷 مخلص كمركي</span>
                <span className="text-[10px] opacity-75 font-normal">ميداني / موانئ وسلف</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('both')}
                className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                  category === 'both'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>⭐ كلاهما معاً</span>
                <span className="text-[10px] opacity-75 font-normal">موظف شركة ومخلص</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
              الاسم الكامل <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الثلاثي أو اللقب"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Job Title & Base Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                المسمى الوظيفي
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مثلاً: محاسب، سائق، مخلص كمركي..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {jobTitlePresets.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setJobTitle(p)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px] flex items-center justify-between">
                <span>الراتب الشهري الأساسي (د.ع)</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {new Intl.NumberFormat('ar-IQ').format(baseSalary || 0)} د.ع
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="25000"
                value={baseSalary || ''}
                onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                placeholder="1000000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:border-emerald-500 focus:outline-none mb-1.5"
              />
              <div className="flex gap-1">
                {[600000, 800000, 1000000, 1500000].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBaseSalary(s)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                  >
                    {s / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Department / Branch */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
              القسم / فرع العمل / المنفذ
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="مثال: المقر العام، ميناء أم قصر، مطار بغداد..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {departmentPresets.slice(0, 3).map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Phone & ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0770..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">رقم الهوية / البطاقة الموحدة</label>
              <input
                type="text"
                value={idNo}
                onChange={(e) => setIdNo(e.target.value)}
                placeholder="ID-..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">تاريخ المباشرة بالعمل</label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">ملاحظات ومعلومات إضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: تفاصيل العقد، أوقات العمل، أي تفاصيل كمركية أو إدارية..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف السجل</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5"
              >
                <span>💾</span>
                <span>{initialData ? 'حفظ التعديلات' : category === 'staff' ? 'حفظ موظف الشركة' : 'حفظ المخلص'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
