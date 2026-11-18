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
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-750 shadow-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 flex-wrap gap-2">
        <label className="text-white font-bold text-xs flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>الملاحظات النموذجية والتوجيهات الكمركية</span>
        </label>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddAllPresetNotes}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1 transition"
            title="إضافة كافة العبارات النموذجية"
          >
            <CheckCheck className="w-3 h-3" />
            <span>تطبيق الكل</span>
          </button>
          {notes && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 transition"
              title="مسح حقل الملاحظات"
            >
              <Trash2 className="w-3 h-3" />
              <span>مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
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
                className={`cursor-pointer transition-all duration-150 py-1 px-2.5 text-[11px] font-bold select-none rounded-lg flex items-center gap-1 ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span className="font-mono">{active ? '✓' : '+'}</span>
                <span>{preset.badgeLabel}</span>
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="space-y-1 pt-0.5">
        <label className="block text-slate-300 font-bold text-[11px]">نص الملاحظات والتوجيهات المطبوعة على الوصل والفاتورة:</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اكتب ملاحظاتك وتوجيهاتك الكمركية هنا (ستظهر تلقائياً في فواتير الزبون)..."
          className="w-full h-16 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium text-xs focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
