import React from 'react';
import { Printer } from 'lucide-react';
import { AuditLogEntry, AppUser } from '../../types/customs';

interface AuditPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredLogs: AuditLogEntry[];
  currentUser: AppUser;
  stats: {
    total: number;
    voidCount: number;
    financialCount: number;
    securityCount: number;
  };
}

export const AuditPrintModal: React.FC<AuditPrintModalProps> = ({
  isOpen,
  onClose,
  filteredLogs,
  currentUser,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto">
        {/* Header controls (Screen only) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between print:hidden bg-slate-900">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">معاينة وطباعة كشف التدقيق والرقابة المحاسبية</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 bg-white text-slate-950 font-sans print:p-0 print:m-0" dir="rtl">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">مكتب النجم للتخليص الكمركي والنقل العام</h2>
              <p className="text-xs text-slate-600 mt-0.5">قسم الرقابة المالية والتدقيق الداخلي • كشف حركات النظام</p>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-IQ', { dateStyle: 'full' })}
              </div>
            </div>

            <div className="text-left font-mono text-xs">
              <div className="p-2 border border-slate-400 rounded bg-slate-50">
                <div>المستخرج: <span className="font-bold">{currentUser.name}</span></div>
                <div>الصفة: {currentUser.roleTitle}</div>
                <div>عدد العمليات: {filteredLogs.length}</div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-3 mb-5 text-center text-xs">
            <div className="p-2 bg-slate-100 rounded border border-slate-200">
              <div className="text-slate-500">إجمالي الحركات</div>
              <div className="font-black text-sm">{stats.total}</div>
            </div>
            <div className="p-2 bg-rose-50 rounded border border-rose-200 text-rose-900">
              <div>ملغاة دفترياً</div>
              <div className="font-black text-sm">{stats.voidCount}</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
              <div>حركات مالية</div>
              <div className="font-black text-sm">{stats.financialCount}</div>
            </div>
            <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
              <div>أمان ونظام</div>
              <div className="font-black text-sm">{stats.securityCount}</div>
            </div>
          </div>

          {/* Report Table */}
          <table className="w-full text-right text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-l border-slate-300">التاريخ والوقت</th>
                <th className="p-2 border-l border-slate-300">المستخدم</th>
                <th className="p-2 border-l border-slate-300">الإجراء</th>
                <th className="p-2 border-l border-slate-300">المرجع</th>
                <th className="p-2 border-l border-slate-300">البيان والتفاصيل</th>
                <th className="p-2">سبب الإلغاء والأثر</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 50).map((log, index) => (
                <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border-l border-slate-200 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('ar-IQ')}
                  </td>
                  <td className="p-2 border-l border-slate-200 font-bold">
                    {log.userName}
                  </td>
                  <td className="p-2 border-l border-slate-200">
                    {log.action === 'void' ? '⛔ ملغي دفترياً' : log.action === 'create' ? '➕ إنشاء' : log.action === 'update' ? '✏️ تعديل' : '🛡️ نظام'}
                  </td>
                  <td className="p-2 border-l border-slate-200 font-mono font-bold">
                    {log.entityReference || '-'}
                  </td>
                  <td className="p-2 border-l border-slate-200">
                    <div className="font-bold">{log.title}</div>
                    <div className="text-[11px] text-slate-600">{log.details}</div>
                  </td>
                  <td className="p-2">
                    {log.cancelReason && (
                      <div className="text-rose-700 font-bold">سبب الإلغاء: {log.cancelReason}</div>
                    )}
                    {log.financialImpact?.balanceChange && (
                      <div className="text-teal-700 text-[11px] font-mono">{log.financialImpact.balanceChange}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length > 50 && (
            <div className="text-center text-xs text-slate-500 mt-2 font-mono">
              * تم عرض أول 50 سجلاً من أصل {filteredLogs.length} سجلاً في هذه الصفحة.
            </div>
          )}

          {/* Signatures Footer */}
          <div className="mt-10 pt-5 border-t border-slate-300 grid grid-cols-3 gap-5 text-center text-xs">
            <div>
              <div className="font-bold mb-8">مسؤول التدقيق والرقابة</div>
              <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
            </div>
            <div>
              <div className="font-bold mb-8">المحاسب القانوني</div>
              <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
            </div>
            <div>
              <div className="font-bold mb-8">إدارة المكتب والاعتماد</div>
              <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
