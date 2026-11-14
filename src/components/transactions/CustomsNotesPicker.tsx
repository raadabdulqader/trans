import React from 'react';
import { Sparkles } from 'lucide-react';
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>ملاحظات وتوجيهات البوليصة</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddAllPresetNotes}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5 transition"
            title="إضافة الملاحظات النموذجية إلى البوليصة"
          >
            + تطبيق الكل
          </button>
          {notes && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="text-[10px] text-slate-500 hover:text-rose-400 transition"
            >
              مسح
            </button>
          )}
        </div>
      </div>

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
                className={`cursor-pointer transition-all duration-150 py-0.5 px-2 text-[10px] select-none ${
                  active
                    ? 'ring-1 ring-emerald-400/80 shadow-xs'
                    : 'opacity-85 hover:opacity-100 hover:border-slate-500'
                }`}
              >
                <span className="font-bold">{active ? '✓' : '+'}</span>
                <span>{preset.badgeLabel}</span>
              </Badge>
            </button>
          );
        })}
      </div>

      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="اكتب ملاحظاتك وتوجيهاتك الكمركية هنا..."
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none resize-none text-[11px]"
      />
    </div>
  );
};
