import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { PropertyCard } from '../../components/property/PropertyCard';
import { EmptyState, Skeleton } from '../../components/ui';
import type { Property } from '../../types';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<Property[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get('/properties/user/favorites');
      return data.data?.data || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: (propertyId: string) => api.post(`/properties/${propertyId}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-dark text-xl">←</button>
          <h1 className="font-black text-dark text-xl flex-1">المفضلة ❤️</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : !favorites?.length ? (
          <EmptyState
            icon="❤️"
            title="لا توجد عقارات مفضلة"
            subtitle="اضغط على ❤️ في أي عقار لإضافته هنا"
            action={{ label: 'تصفح العقارات', onClick: () => navigate('/home') }}
          />
        ) : (
          favorites.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="relative">
              <PropertyCard property={p} horizontal onPress={() => navigate(`/property/${p.id}`)} />
              <button
                onClick={() => removeMutation.mutate(p.id)}
                className="absolute top-3 left-3 bg-white/95 text-error text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-red-100 hover:bg-error-light transition-colors"
              >
                ❤️ إزالة
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
