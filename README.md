# نظام مكتب النجم للتخليص الكمركي والمالية (Next.js 15)

نظام ويب متكامل لإدارة التخليص الكمركي، البوالص والمعاملات، الحاويات، سلف وحسابات المخلصين، الأرشيف والوصولات، وإدارة صندوق الشركة الموحد.

## التقنيات المستخدمة (Tech Stack)
- **الإطار البرمجي:** Next.js 15+ (App Router)
- **المكتبة الأساسية:** React 19
- **مدير الحزم (Package Manager):** `pnpm`
- **اللغة:** TypeScript
- **التصميم:** Tailwind CSS v4 مع سمة داكنة احترافية (Dark Enterprise Theme) ودعم كامل للغة العربية (RTL)
- **الأيقونات:** Lucide React
- **معاينة المستندات و PDF:** `pdfjs-dist` عبر Canvas المباشر لتفادي حظر الـ iframe

---

## متطلبات التشغيل (Prerequisites)
- [Node.js](https://nodejs.org/) الإصدار 18.18+ أو 20+ أو 22+.
- [pnpm](https://pnpm.io/) (`corepack enable` أو `npm install -g pnpm`)

---

## التشغيل المحلي عبر pnpm (Getting Started with pnpm)

1. **تثبيت الحزم (Install Dependencies):**
   ```bash
   pnpm install
   ```

2. **تشغيل خادم التطوير (Development Server):**
   ```bash
   pnpm dev
   ```
   سيتم تشغيل النظام تلقائياً على الرابط: [http://localhost:3000](http://localhost:3000)

3. **بناء المشروع للإنتاج (Production Build):**
   ```bash
   pnpm build
   pnpm start
   ```

---

## هيكل المجلدات الرئيسي (Directory Structure)
```
nakah/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # الهيكل الجذري (RTL، خط Cairo، البيانات الوصفية)
│   │   ├── page.tsx           # الصفحة الرئيسية ونقطة الربط الديناميكية
│   │   └── globals.css        # أنماط Tailwind CSS وقواعد الطباعة الرسمية
│   ├── components/            # واجهات النظام (Dashboard, Treasury, Accounts, ...)
│   │   ├── modals/            # النوافذ المنبثقة التفاعلية والسندات والطباعة
│   │   └── ui/                # مكونات واجهة المستخدم (Calendar, DatePicker, Collapsible)
│   ├── types/                 # تعريفات البيانات والأنواع (TypeScript)
│   ├── utils/                 # دوال التخزين، العمليات الحسابية، الأرشيف ومعالجة PDF
│   └── App.tsx                # المكون الرئيسي لإدارة الحالة والتنقل والصلاحيات
├── public/                    # الملفات والأصول الثابتة
├── .npmrc                     # إعدادات pnpm الرسمية لـ Next.js
├── next.config.ts             # إعدادات Next.js 15 المتقدمة
├── postcss.config.mjs         # إعدادات Tailwind CSS v4
├── tsconfig.json              # إعدادات TypeScript الرسمية المتوافقة مع Next.js
└── package.json               # حزم المشروع وإعدادات pnpm
```
