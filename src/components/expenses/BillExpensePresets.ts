export interface BillExpenseCategory {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  defaultParty: string;
  defaultDesc: string;
  badgeColor: string;
}

export const BILL_EXPENSE_PRESETS: BillExpenseCategory[] = [
  {
    id: 'customs_duty',
    name: '🏛️ رسوم كمركية وضريبية',
    icon: '🏛️',
    shortDesc: 'رسم كمركي وضريبة استيراد نظامية',
    defaultParty: 'الهيئة العامة للكمارك - المنفذ الجمركي',
    defaultDesc: 'رسوم كمركية وضريبة استيراد نظامية للبوليصة',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  {
    id: 'port_fees',
    name: '⚓ عوائد موانئ ومناولة وتفريغ',
    icon: '⚓',
    shortDesc: 'أجور الميناء والأرصفة والمناولة',
    defaultParty: 'الشركة العامة لموانئ العراق',
    defaultDesc: 'أجور عوائد الميناء والأرصفة والمناولة',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20',
  },
  {
    id: 'sonar_inspection',
    name: '🔬 فحص كمركي وسونار ومختبر',
    icon: '🔬',
    shortDesc: 'كشف السونار والسيطرة النوعية',
    defaultParty: 'جهاز التقييس والسيطرة النوعية / محطة السونار',
    defaultDesc: 'أجور كشف السونار والفحص النوعي والمختبري',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'weighbridge',
    name: '⚖️ ميزان وأجور وزن الشاحنات',
    icon: '⚖️',
    shortDesc: 'رسوم القبان والوزن بالمنفذ',
    defaultParty: 'محطة الميزان الجمركي',
    defaultDesc: 'أجور وزن شاحنات البوليصة بالمنفذ',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20',
  },
  {
    id: 'attestation',
    name: '📑 تصاديق وتوكيلات وغرفة تجارة',
    icon: '📑',
    shortDesc: 'تصديق شهادة المنشأ والوكالات',
    defaultParty: 'غرفة التجارة / العدل',
    defaultDesc: 'أجور تصديق شهادة المنشأ والوكالات والمستندات',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20',
  },
  {
    id: 'demurrage',
    name: '📦 أرضيات وغرامات تأخير الحاويات',
    icon: '📦',
    shortDesc: 'مبيت الحاويات والخط الملاحي',
    defaultParty: 'محطة الحاويات / الخط الملاحي',
    defaultDesc: 'رسوم أرضيات ومبيت أو غرامات تأخير الحاويات',
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20',
  },
  {
    id: 'labor',
    name: '👷 عمال وعتالة وتحميل وتفريغ',
    icon: '👷',
    shortDesc: 'أجور العتالة وتفريغ الحاويات',
    defaultParty: 'مقاولة عمال التحميل والتفريغ',
    defaultDesc: 'أجور عتالة وتفريغ الحاويات وتنسيق البضاعة',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'overtime',
    name: '👮‍♂️ خفارة وكشف ومطابقة كمركية',
    icon: '👮‍♂️',
    shortDesc: 'أجور الخفارة والكشف الميداني',
    defaultParty: 'لجنة الكشف والمطابقة الجمركية',
    defaultDesc: 'أجور خفارة وإنجاز الكشف الجمركي الفوري',
    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-500/10 hover:bg-teal-500/20',
  },
  {
    id: 'petty_cash',
    name: '☕ نثريات وتسهيلات ومصاريف أخرى',
    icon: '☕',
    shortDesc: 'نثريات وتسهيلات ميدانية طارئة',
    defaultParty: 'المخلص الكمركي الميداني',
    defaultDesc: 'مصاريف نثرية وتسهيلات تشغيلية طارئة للبوليصة',
    badgeColor: 'border-slate-600 text-slate-300 bg-slate-800/60 hover:bg-slate-800',
  },
];
