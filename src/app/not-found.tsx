import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4">
        🔍
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">الصفحة غير موجودة (404)</h1>
      <p className="text-slate-400 max-w-md mb-6 text-sm">
        عذراً، الرابط المطلوب غير متوفر أو تم نقله. يمكنك العودة إلى لوحة التحكم الرئيسية لنظام مكتب النجم.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-950/40"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
