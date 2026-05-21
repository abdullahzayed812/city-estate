import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Card, Badge, EmptyState, Skeleton, Spinner } from '../../components/ui';
import type { Property } from '../../types';

type Status = 'ALL' | 'ACTIVE' | 'PENDING' | 'DRAFT';

const FILTERS: { key: Status; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'ACTIVE', label: 'نشط' },
  { key: 'PENDING', label: 'قيد المراجعة' },
  { key: 'DRAFT', label: 'مسودة' },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط', PENDING: 'قيد المراجعة', DRAFT: 'مسودة',
  SOLD: 'مبيع', RENTED: 'مؤجر', SUSPENDED: 'موقوف', REJECTED: 'مرفوض',
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة', VILLA: 'فيلا', LAND: 'أرض', OFFICE: 'مكتب',
  STUDIO: 'استوديو', WAREHOUSE: 'مخزن', FACTORY: 'مصنع', SHOP: 'محل',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'للبيع', RENT: 'للإيجار', DAILY_RENT: 'يومي',
};

const BORDER_COLORS: Record<string, string> = {
  ACTIVE: 'border-r-success', PENDING: 'border-r-warning', DRAFT: 'border-r-text-muted',
  SOLD: 'border-r-primary', RENTED: 'border-r-purple', REJECTED: 'border-r-error', SUSPENDED: 'border-r-text-muted',
};

export default function MyListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Status>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'listings', filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'ALL') params.append('status', filter);
      const { data } = await api.get(`/properties/broker/my-properties?${params}`);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/properties/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] });
      setDeleteId(null);
    },
  });

  const properties: Property[] = data?.data || [];

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Header */}
      <div className="bg-dark sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-white font-black text-xl">عقاراتي</h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/listings/new')}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold shadow-blue hover:bg-blue-700 transition-colors"
          >
            + إضافة عقار
          </motion.button>
        </div>
        {/* Filter pills */}
        <div className="bg-bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-card text-text-sub border-border hover:border-primary/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="لا توجد عقارات"
            subtitle="ابدأ بإضافة عقارك الأول لجذب العملاء"
            action={{ label: '+ أضف عقارك الأول', onClick: () => navigate('/listings/new') }}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {properties.map((p) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              >
                <Card className={`border-r-4 ${BORDER_COLORS[p.status] ?? 'border-r-text-muted'} overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-text-muted font-semibold">
                        {TYPE_LABELS[p.type] || p.type} · {LISTING_LABELS[p.listingType] || p.listingType}
                      </span>
                      <Badge status={p.status} label={STATUS_LABELS[p.status] || p.status} />
                    </div>

                    <h3 className="font-bold text-text-main text-sm leading-tight mb-2 line-clamp-2">
                      {p.titleAr}
                    </h3>

                    <div className="text-primary font-black text-lg mb-1">
                      {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: p.currency, maximumFractionDigits: 0 }).format(p.price)}
                    </div>
                    <div className="text-text-sub text-xs mb-3">المساحة: {p.area} م²</div>

                    <div className="flex gap-2 mb-3">
                      <span className="text-xs bg-bg px-2.5 py-1 rounded-md text-text-sub">
                        👁 {p.viewsCount.toLocaleString('ar-EG')}
                      </span>
                      <span className="text-xs bg-bg px-2.5 py-1 rounded-md text-text-sub">
                        ❤️ {p.favoritesCount ?? 0}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border">
                      <button
                        onClick={() => navigate(`/listings/${p.id}/edit`)}
                        className="flex-1 text-center text-xs font-bold text-primary bg-primary-light py-2 rounded-md border border-primary/20 hover:bg-blue-100 transition-colors"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="flex-1 text-center text-xs font-bold text-error bg-error-light py-2 rounded-md border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        🗑 حذف
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-xl p-6 max-w-sm w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl text-center mb-3">🗑️</div>
              <h3 className="text-lg font-bold text-text-main text-center mb-2">حذف العقار</h3>
              <p className="text-text-sub text-sm text-center mb-6">هل أنت متأكد من حذف هذا العقار؟</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-md border border-border text-text-sub font-bold text-sm hover:bg-bg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-md bg-error text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? <Spinner size={16} /> : 'حذف'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
