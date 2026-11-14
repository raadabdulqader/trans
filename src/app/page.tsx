'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-bold font-cairo">نظام مكتب النجم للتخليص الكمركي</h2>
      <p className="text-sm text-slate-400 mt-1">جاري تحميل النظام والبيانات المحاسبية...</p>
    </div>
  ),
});

export default function Home() {
  return <App />;
}
