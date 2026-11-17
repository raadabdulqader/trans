import React from 'react';
import { Sparkles, Trash2, CheckCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CUSTOMS_PRESET_NOTES, CustomsPresetNote } from '../../utils/customsNotes';

interface CustomsNotesPickerProps {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const CustomsNotesPicker: React.FC<CustomsNotesPickerProps> = ({
  notes,
  setNotes,
}) => {
  const isNoteActive = (preset: CustomsPresetNote) => {
    if (!notes) return false;
    return notes.includes(preset.fullText);
  };

  const handleTogglePresetNote = (preset: CustomsPresetNote) => {
    if (isNoteActive(preset)) {
      const lines = notes.split('\n').filter(line => {
        const trimmed = line.trim().replace(/^[•\-\*]\s*/, '');
        return (
          trimmed !== preset.fullText.trim() &&
          !trimmed.includes(preset.fullText.trim())
        );
      });
      setNotes(lines.join('\n').trim());
    } else {
      if (!notes.trim()) {
        setNotes(preset.fullText);
      } else {
        setNotes(`${notes.trim()}\n• ${preset.fullText}`);
      }
    }
  };

  const handleAddAllPresetNotes = () => {
    const linesToAdd = CUSTOMS_PRESET_NOTES
      .filter(p => !isNoteActive(p))
      .map(p => `• ${p.fullText}`);
    
    if (linesToAdd.length === 0) return;

    if (!notes.trim()) {
      setNotes(linesToAdd.join('\n'));
    } else {
      setNotes(`${notes.trim()}\n${linesToAdd.join('\n')}`);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 flex-wrap gap-2">
        <label className="text-white font-bold text-xs sm:text-sm flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>الملاحظات النموذجية والتوجيهات الكمركية</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddAllPresetNotes}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1 transition"
            title="إضافة كافة العبارات النموذجية إلى ملاحظات البوليصة"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تطبيق الكل</span>
          </button>
          {notes && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 transition"
              title="مسح حقل الملاحظات بالكامل"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 font-medium">
          عبارات كمركية جاهزة (اضغط للإضافة أو الحذف السريع):
        </div>
        <div className="flex flex-wrap gap-2">
          {CUSTOMS_PRESET_NOTES.map((preset) => {
            const active = isNoteActive(preset);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleTogglePresetNote(preset)}
                title={preset.description}
                className="group text-right focus:outline-none"
              >
                <Badge
                  variant={active ? 'default' : preset.variant}
                  className={`cursor-pointer transition-all duration-150 py-1.5 px-3 text-xs font-bold select-none rounded-xl flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/80 shadow-md font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span className="font-mono font-black">{active ? '✓' : '+'}</span>
                  <span>{preset.badgeLabel}</span>
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-slate-200 font-bold text-xs">نص الملاحظات والتوجيهات المطبوعة على الوصل والفاتورة:</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اكتب ملاحظاتك وتوجيهاتك الكمركية هنا (ستظهر تلقائياً في فواتير الزبون والتقارير)..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-medium text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
