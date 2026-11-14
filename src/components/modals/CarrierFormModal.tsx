import React, { useState, useEffect } from 'react';
import { X, Truck, User, Phone, MapPin } from 'lucide-react';
import { TransportCompany } from '../../types/customs';

export interface CarrierFormModalProps {
  isOpen: boolean;
  initialData?: TransportCompany | null;
  onClose: () => void;
  onSave: (carrier: Omit<TransportCompany, 'id' | 'createdAt'> & { id?: string }) => void;
}

export const CarrierFormModal: React.FC<CarrierFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>{initialData ? 'تعديل بيانات شركة النقل' : 'إضافة شركة نقل جديدة (ناقل بري مستقل)'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  اسم شركة النقل / مكتب النواقل <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة القافلة الذهبية للنقل البري..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  اسم المسؤول / المتعهد
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="اسم مدير التشغيل أو المتعهد..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  أرقام الهاتف والتواصل
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0780XXXXXXX / 0770XXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  العنوان / موقع ساحة الشاحنات
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: البصرة - خور الزبير - ساحة الشاحنات..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ملاحظات (نوع الشاحنات / خطوط النقل المعتمدة)
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: تريلات 40 قدم، لوبوي، برادات نقل مبرد إلى بغداد والمحافظات..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20"
            >
              {initialData ? 'حفظ التعديلات' : 'إضافة شركة النقل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
