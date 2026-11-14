export interface CustomsPresetNote {
  id: string;
  badgeLabel: string;
  fullText: string;
  icon: string;
  variant: 'warning' | 'info' | 'secondary' | 'default' | 'success';
  description: string;
}

/**
 * 3 ملاحظات نموذجية تناسب عمليات التخليص الكمركي وإدارة البوالص
 * مصممة على هيئة شارات Shadcn Badge تفاعلية
 */
export const CUSTOMS_PRESET_NOTES: CustomsPresetNote[] = [
  {
    id: 'urgent_demurrage',
    badgeLabel: '⚡ معاملة عاجلة - تفادي غرامات الأرضيات',
    fullText: 'معاملة عاجلة: يرجى تسريع التخليص الكمركي لتجنب غرامات التأخير وأرضيات الميناء.',
    icon: '⚡',
    variant: 'warning',
    description: 'للبوالص التي تتطلب تخليصاً سريعاً لتفادي غرامات التأخير وحساب الأرضيات'
  },
  {
    id: 'quality_standards',
    badgeLabel: '🔍 خاضعة للفحص والسيطرة النوعية والتقييس',
    fullText: 'البضاعة تخضع لإجراءات الفحص المسبق والسيطرة النوعية والتقييس والمطابقة الكمركية.',
    icon: '🔍',
    variant: 'info',
    description: 'للبضائع والمواد التي تستوجب فحصاً مختبرياً وإجراءات كشف وسونار'
  },
  {
    id: 'attested_docs',
    badgeLabel: '📄 شهادة المنشأ وقوائم الشحن مصدقة أصولياً',
    fullText: 'شهادة المنشأ والفاتورة التجارية وقوائم التعبئة الأصلية مصدقة ومرفقة في المعاملة.',
    icon: '📄',
    variant: 'secondary',
    description: 'للبوالص المستوفية للوثائق الثبوتية وشهادات المنشأ المصدقة'
  }
];
