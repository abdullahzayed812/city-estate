import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { PropertyCard } from '../../components/property/PropertyCard';
import { Skeleton, EmptyState } from '../../components/ui';
import type { Property } from '../../types';

const TYPES = [
  { key: '', label: 'الكل' }, { key: 'APARTMENT', label: 'شقق' },
  { key: 'VILLA', label: 'فيلات' }, { key: 'LAND', label: 'أراضي' },
  { key: 'OFFICE', label: 'مكاتب' }, { key: 'WAREHOUSE', label: 'مخازن' },
  { key: 'STUDIO', label: 'استوديو' },
];
const LISTING_TYPES = [
  { key: '', label: 'الكل' }, { key: 'SALE', label: 'للبيع' }, { key: 'RENT', label: 'للإيجار' }, { key: 'DAILY_RENT', label: 'يومي' },
];
const SORT_OPTIONS = [
  { key: 'created_at_desc', label: 'الأحدث' }, { key: 'price_asc', label: 'السعر: الأقل' },
  { key: 'price_desc', label: 'السعر: الأعلى' }, { key: 'area_desc', label: 'الأكبر مساحة' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingFilter, setListingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['properties', 'search', { query, typeFilter, listingFilter, sortBy, minPrice, maxPrice, minArea, page }],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '15' });
      if (query) p.append('search', query);
      if (typeFilter) p.append('type', typeFilter);
      if (listingFilter) p.append('listingType', listingFilter);
      if (minPrice) p.append('minPrice', minPrice);
      if (maxPrice) p.append('maxPrice', maxPrice);
      if (minArea) p.append('minArea', minArea);
      const { data } = await api.get(`/properties?${p}`);
      return data.data;
    },
  });

  const properties: Property[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Search header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-dark text-xl p-1">←</button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <span className="text-gray-400 text-base">🔍</span>
            <input
              type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="ابحث بالمنطقة، النوع..."
              className="flex-1 bg-transparent text-sm text-dark placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setPage(1); }} className="text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              showFilters ? 'bg-dark text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'
            }`}
          >
            <span className="text-base">⚙</span>
          </button>
        </div>

        {/* Type chips */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => { setTypeFilter(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === t.key ? 'bg-dark text-white' : 'bg-gray-100 text-text-sub hover:bg-gray-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
                <div>
                  <p className="text-xs font-bold text-text-sub mb-2">نوع العرض</p>
                  <div className="flex flex-wrap gap-2">
                    {LISTING_TYPES.map((lt) => (
                      <button key={lt.key} onClick={() => { setListingFilter(lt.key); setPage(1); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-all ${
                          listingFilter === lt.key ? 'bg-dark text-white border-dark' : 'bg-white text-text-sub border-gray-200 hover:border-dark'
                        }`}>
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-text-sub mb-2">نطاق السعر (جنيه)</p>
                  <div className="flex gap-3 items-center">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="من" dir="ltr"
                      className="flex-1 border-2 border-gray-200 rounded-md px-3 py-2 text-sm text-dark placeholder-gray-400 outline-none focus:border-dark transition-colors" />
                    <span className="text-gray-300">—</span>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="إلى" dir="ltr"
                      className="flex-1 border-2 border-gray-200 rounded-md px-3 py-2 text-sm text-dark placeholder-gray-400 outline-none focus:border-dark transition-colors" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-text-sub mb-2">ترتيب حسب</p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((s) => (
                      <button key={s.key} onClick={() => setSortBy(s.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border-2 transition-all ${
                          sortBy === s.key ? 'bg-dark text-white border-dark' : 'bg-white text-text-sub border-gray-200 hover:border-dark'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-text-sub font-semibold">{meta.total} نتيجة</span>
        {isFetching && !isLoading && (
          <span className="text-xs text-text-muted">جاري التحديث...</span>
        )}
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : properties.length === 0 ? (
          <EmptyState icon="🔍" title="لا توجد نتائج" subtitle="جرب تغيير معايير البحث أو حاول بكلمات أخرى" />
        ) : (
          properties.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <PropertyCard property={p} horizontal onPress={() => navigate(`/property/${p.id}`)} />
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-dark disabled:opacity-40 hover:border-dark transition-colors"
            >
              ‹ السابق
            </button>
            <span className="px-4 py-2 rounded-xl bg-dark text-white text-sm font-semibold">{page} / {meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-semibold text-dark disabled:opacity-40 hover:border-dark transition-colors"
            >
              التالي ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
