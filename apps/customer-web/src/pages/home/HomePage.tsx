import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PropertyCard } from '../../components/property/PropertyCard';
import { Skeleton } from '../../components/ui';
import type { Property } from '../../types';

const CATEGORIES = [
  { key: '', label: 'الكل' }, { key: 'APARTMENT', label: 'شقق' },
  { key: 'VILLA', label: 'فيلل' }, { key: 'LAND', label: 'أراضي' },
  { key: 'OFFICE', label: 'مكاتب' }, { key: 'WAREHOUSE', label: 'مخازن' },
];
const LISTING_TYPES = [
  { key: 'SALE', label: 'للبيع' }, { key: 'RENT', label: 'للإيجار' }, { key: 'DAILY_RENT', label: 'إيجار يومي' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [category, setCategory] = useState('');
  const [listing, setListing] = useState('');

  const { data: featured, isLoading: featLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'featured'],
    queryFn: async () => { const { data } = await api.get('/properties/featured'); return data.data; },
  });

  const { data: propertiesData, isLoading: listLoading } = useQuery({
    queryKey: ['properties', 'list', category, listing],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: '12' });
      if (category) p.append('type', category);
      if (listing) p.append('listingType', listing);
      const { data } = await api.get(`/properties?${p}`);
      return (data.data?.data || []) as Property[];
    },
  });

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Hero header */}
      <div className="bg-dark py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white font-black text-2xl md:text-3xl">
                {user ? `مرحباً ${user.firstName} 👋` : 'مرحباً بك 👋'}
              </h1>
              <p className="text-white/50 text-sm mt-1">برج العرب، الإسكندرية</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <span className="text-xl">🔔</span>
            </button>
          </div>

          {/* Search bar */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/search')}
            className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-lg text-right"
          >
            <span className="text-xl">🔍</span>
            <span className="text-text-muted text-sm flex-1">ابحث عن عقار في برج العرب...</span>
            <span className="text-xs bg-gray-100 text-text-sub px-3 py-1 rounded-lg">بحث متقدم</span>
          </motion.button>

          {/* Listing type pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
            {LISTING_TYPES.map((lt) => (
              <button
                key={lt.key}
                onClick={() => setListing(listing === lt.key ? '' : lt.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  listing === lt.key ? 'bg-white text-dark' : 'bg-white/15 text-white border border-white/25 hover:bg-white/20'
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">العقارات المميزة ⭐</h2>
            <button onClick={() => navigate('/search')} className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors">عرض الكل</button>
          </div>

          {featLoading ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-64 h-64 flex-shrink-0" />)}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex-shrink-0 w-64"
                >
                  <PropertyCard property={p} onPress={() => navigate(`/property/${p.id}`)} />
                </motion.div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Category filter */}
        <section>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  category === c.key ? 'bg-dark text-white' : 'bg-white text-text-sub border border-gray-200 hover:border-dark'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Latest properties */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">أحدث العقارات</h2>
            <button onClick={() => navigate('/search')} className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors">عرض الكل</button>
          </div>

          {listLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(propertiesData || []).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <PropertyCard property={p} horizontal onPress={() => navigate(`/property/${p.id}`)} />
                </motion.div>
              ))}
              {propertiesData?.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl">🏠</span>
                  <p className="text-text-sub mt-3 text-sm">لا توجد عقارات في هذه الفئة</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
