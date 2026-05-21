import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Spinner } from '../../components/ui';

const BOOKING_TYPES = [
  { key: 'VIEWING', label: 'معاينة', icon: '👁', desc: 'زيارة وتفقد العقار' },
  { key: 'RENTAL', label: 'إيجار', icon: '🔑', desc: 'إيجار العقار' },
  { key: 'PURCHASE', label: 'شراء', icon: '🤝', desc: 'شراء العقار' },
];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId, brokerId } = (location.state as any) ?? {};

  const [bookingType, setBookingType] = useState('VIEWING');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        brokerId, propertyId, type: bookingType,
        scheduledAt: new Date(date), scheduledTime: time + ':00',
        message: message || undefined,
      };
      if (bookingType === 'RENTAL') {
        payload.rentalStartDate = rentalStart;
        payload.rentalEndDate = rentalEnd;
      }
      const { data } = await api.post('/bookings', payload);
      return data.data;
    },
    onSuccess: () => setSuccess(true),
  });

  const isValid = date && time && (bookingType !== 'RENTAL' || (rentalStart && rentalEnd));

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-dark mb-3">تم الحجز بنجاح!</h2>
          <p className="text-text-sub mb-8">سيتواصل معك الوسيط لتأكيد الموعد</p>
          <button onClick={() => navigate('/bookings')} className="px-8 py-3 bg-dark text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            عرض حجوزاتي
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-dark text-xl">←</button>
          <h1 className="font-black text-dark text-xl">طلب حجز</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Booking type */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-dark text-sm mb-4">نوع الطلب</h2>
          <div className="grid grid-cols-3 gap-3">
            {BOOKING_TYPES.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.96 }}
                onClick={() => setBookingType(t.key)}
                className={`p-3 rounded-xl flex flex-col items-center gap-1.5 border-2 transition-all ${
                  bookingType === t.key ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-gray-200 hover:border-dark'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="font-bold text-xs">{t.label}</span>
                <span className={`text-xs ${bookingType === t.key ? 'text-white/70' : 'text-text-muted'}`}>{t.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-dark text-sm mb-3">تاريخ الموعد</h2>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)} min={getMinDate()}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-dark outline-none focus:border-dark transition-colors"
            dir="ltr"
          />
        </div>

        {/* Time */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-dark text-sm mb-3">وقت الموعد</h2>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setTime(slot)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  time === slot ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-gray-200 hover:border-dark'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Rental dates */}
        <AnimatePresence>
          {bookingType === 'RENTAL' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h2 className="font-bold text-dark text-sm mb-3">فترة الإيجار</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-sub font-semibold mb-1.5 block">تاريخ البداية</label>
                    <input type="date" value={rentalStart} onChange={(e) => setRentalStart(e.target.value)} min={date || getMinDate()} dir="ltr"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark outline-none focus:border-dark transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-text-sub font-semibold mb-1.5 block">تاريخ الانتهاء</label>
                    <input type="date" value={rentalEnd} onChange={(e) => setRentalEnd(e.target.value)} min={rentalStart || getMinDate()} dir="ltr"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark outline-none focus:border-dark transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-dark text-sm mb-3">رسالة للوسيط (اختياري)</h2>
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="أي ملاحظات أو أسئلة للوسيط..." rows={3}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 resize-none outline-none focus:border-dark transition-colors"
          />
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm text-center">{(mutation.error as any)?.response?.data?.message || 'حدث خطأ'}</p>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => mutation.mutate()}
          disabled={!isValid || mutation.isPending}
          className="w-full bg-dark text-white rounded-xl py-4 font-bold text-base hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Spinner size={20} /> : 'تأكيد الحجز'}
        </motion.button>
      </div>
    </div>
  );
}
