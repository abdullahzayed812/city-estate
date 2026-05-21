import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Badge, EmptyState, Skeleton, Spinner } from '../../components/ui';
import { formatBookingCalendar, formatBookingTime } from '../../lib/date';
import type { Booking } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق', CONFIRMED: 'مؤكد', COMPLETED: 'مكتمل', CANCELLED: 'ملغي', NO_SHOW: 'لم يحضر',
};
const TYPE_LABELS: Record<string, string> = { VIEWING: 'معاينة', RENTAL: 'إيجار', PURCHASE: 'شراء' };
const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'] as const;

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customer', 'bookings', filter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: '20' });
      if (filter !== 'ALL') p.append('status', filter);
      const { data } = await api.get(`/bookings?${p}`);
      return data.data as Booking[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
      setCancelModal({ open: false, id: null });
      setReason('');
    },
  });

  const bookings = data || [];

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <div className="bg-dark sticky top-0 z-10 lg:hidden">
        <div className="px-5 py-4">
          <h1 className="text-white font-black text-xl">حجوزاتي</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Filter tabs */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap ${
                filter === f ? 'bg-dark text-white border-dark' : 'bg-white text-text-sub border-gray-200 hover:border-dark'
              }`}>
              {f === 'ALL' ? 'الكل' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="px-4 py-5 space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)
          ) : bookings.length === 0 ? (
            <EmptyState icon="📅" title="لا توجد حجوزات" subtitle="يمكنك حجز معاينة عقار من صفحة العقار" />
          ) : (
            bookings.map((b, i) => {
              const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED';
              const cal = b.scheduledDate ? formatBookingCalendar(b.scheduledDate) : null;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="bg-white rounded-2xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <Badge status={b.status} label={STATUS_LABELS[b.status] || b.status} />
                      <span className="text-xs text-text-muted font-semibold">{TYPE_LABELS[b.type] || b.type}</span>
                    </div>
                    <h3 className="font-bold text-dark text-sm mb-3">{b.property?.titleAr}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-text-sub">
                        🏢 {b.broker?.firstName} {b.broker?.lastName}
                      </span>
                      <span className="text-xs text-text-muted">{b.broker?.phone}</span>
                    </div>
                    {cal && (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-dark flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-base leading-tight">{cal.day}</span>
                          <span className="text-white/75 text-xs">{cal.month}</span>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">{cal.weekday}</p>
                          {b.scheduledTime && (
                            <p className="text-sm font-bold text-dark">{formatBookingTime(b.scheduledTime)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {b.message && <p className="text-xs text-text-sub italic mb-2">💬 {b.message}</p>}
                    {canCancel && (
                      <button
                        onClick={() => { setReason(''); setCancelModal({ open: true, id: b.id }); }}
                        className="w-full mt-3 py-2.5 rounded-xl bg-error-light text-error font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        إلغاء الحجز
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setCancelModal({ open: false, id: null })}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-dark mb-1">سبب الإلغاء</h3>
              <p className="text-text-sub text-sm mb-4">يرجى توضيح سبب إلغاء الحجز</p>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: تغيير في الخطط..." rows={3} autoFocus maxLength={500}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-gray-400 resize-none outline-none focus:border-dark transition-colors" />
              <p className="text-xs text-text-muted text-left mt-1 mb-5">{reason.length}/500</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelModal({ open: false, id: null })}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-text-sub font-bold text-sm hover:bg-gray-50">تراجع</button>
                <button
                  onClick={() => cancelModal.id && cancelMutation.mutate({ id: cancelModal.id, reason: reason.trim() })}
                  disabled={cancelMutation.isPending || reason.trim().length < 5}
                  className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-700">
                  {cancelMutation.isPending ? <Spinner size={16} /> : 'تأكيد الإلغاء'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
