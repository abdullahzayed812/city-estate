import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Card, Badge, EmptyState, Skeleton, Modal, Spinner } from '../../components/ui';
import type { Booking } from '../../types';
import { formatBookingCalendar, formatBookingTime } from '../../lib/date';

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'] as const;
const FILTER_LABELS: Record<string, string> = {
  ALL: 'الكل', PENDING: 'معلّق', CONFIRMED: 'مؤكد', COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق', CONFIRMED: 'مؤكد', COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
};
const TYPE_LABELS: Record<string, string> = {
  VIEWING: 'معاينة', RENTAL: 'إيجار', PURCHASE: 'شراء',
};

export default function BookingRequestsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'bookings', filter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: '50' });
      if (filter !== 'ALL') p.append('status', filter);
      const { data } = await api.get(`/bookings/broker?${p}`);
      return data.data as Booking[];
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] });
      setCancelModal({ open: false, id: null });
      setReason('');
    },
  });

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <div className="bg-dark sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-white font-black text-xl">الحجوزات</h1>
        </div>
        <div className="bg-bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-card text-text-sub border-border hover:border-primary/40'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState
            icon="📅"
            title="لا توجد حجوزات"
            subtitle="ستظهر طلبات الحجز من العملاء هنا"
          />
        ) : (
          <div className="space-y-4">
            {data.map((booking, i) => {
              const cal = formatBookingCalendar(booking.scheduledDate);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        status={booking.status}
                        label={STATUS_LABELS[booking.status] || booking.status}
                      />
                      <span className="text-xs text-text-muted font-semibold">
                        {TYPE_LABELS[booking.type] || booking.type}
                      </span>
                    </div>

                    <h3 className="font-bold text-text-main text-sm mb-3 flex items-center gap-2">
                      🏠 {booking.property?.titleAr}
                    </h3>

                    {/* Date block */}
                    <div className="flex items-center gap-4 bg-bg rounded-md p-3 mb-3">
                      <div className="w-14 h-14 rounded-md bg-primary flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-xl leading-tight">{cal.day}</span>
                        <span className="text-white/80 text-xs font-semibold">{cal.month}</span>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-0.5">{cal.weekday}</p>
                        {booking.scheduledTime && (
                          <p className="font-semibold text-text-main text-sm">
                            🕐 {formatBookingTime(booking.scheduledTime)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-main">
                        👤 {(booking as any).customer?.firstName}{' '}
                        {(booking as any).customer?.lastName}
                      </span>
                      <span className="text-sm text-text-sub">
                        {(booking as any).customer?.phone}
                      </span>
                    </div>

                    {booking.message && (
                      <div className="bg-bg rounded-md p-2.5 mb-3">
                        <p className="text-xs text-text-sub italic leading-relaxed">
                          💬 {booking.message}
                        </p>
                      </div>
                    )}

                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button
                          onClick={() => confirmMutation.mutate(booking.id)}
                          disabled={confirmMutation.isPending}
                          className="flex-1 py-2.5 rounded-md bg-success text-white font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          {confirmMutation.isPending ? <Spinner size={16} /> : '✓ تأكيد الحجز'}
                        </button>
                        <button
                          onClick={() => {
                            setReason('');
                            setCancelModal({ open: true, id: booking.id });
                          }}
                          className="flex-1 py-2.5 rounded-md bg-error-light text-error font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setCancelModal({ open: false, id: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-xl p-6 max-w-sm w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl text-center mb-3">❌</div>
              <h3 className="text-lg font-bold text-text-main text-center mb-1">سبب الإلغاء</h3>
              <p className="text-text-sub text-sm text-center mb-4">
                يرجى توضيح سبب إلغاء الحجز للعميل
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: تعارض في المواعيد، العقار غير متاح..."
                className="w-full px-4 py-3 rounded-md bg-bg border border-border text-text-main placeholder-text-muted text-sm outline-none resize-none min-h-[90px] focus:border-primary transition-colors"
                maxLength={500}
                autoFocus
              />
              <p className="text-xs text-text-muted text-left mt-1 mb-5">{reason.length}/500</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal({ open: false, id: null })}
                  className="flex-1 py-2.5 rounded-md border border-border text-text-sub font-bold text-sm hover:bg-bg transition-colors"
                >
                  تراجع
                </button>
                <button
                  onClick={() =>
                    cancelModal.id &&
                    cancelMutation.mutate({ id: cancelModal.id, reason: reason.trim() })
                  }
                  disabled={cancelMutation.isPending || reason.trim().length < 5}
                  className="flex-1 py-2.5 rounded-md bg-error text-white font-bold text-sm disabled:opacity-50 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
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
