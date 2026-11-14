'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-white mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {error?.message || 'تعذر تحميل الصفحة بشكل صحيح. يرجى إعادة المحاولة.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
