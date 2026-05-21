import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Spinner } from '../../components/ui';
import type { Property } from '../../types';

const TYPE_LABELS: Record<string, string> = { APARTMENT: 'شقة', VILLA: 'فيلا', LAND: 'أرض', OFFICE: 'مكتب', STUDIO: 'استوديو', WAREHOUSE: 'مخزن', FACTORY: 'مصنع' };
const LISTING_LABELS: Record<string, string> = { SALE: 'للبيع', RENT: 'للإيجار', DAILY_RENT: 'إيجار يومي' };

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [imageIdx, setImageIdx] = useState(0);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`);
      return data.data;
    },
  });

  const favMutation = useMutation({
    mutationFn: () => api.post(`/properties/${id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/chats', {
        brokerId: property!.broker!.userId,
        propertyId: property!.id,
      });
      return data.data as { id: string };
    },
    onSuccess: (chat) => {
      navigate(`/chat/${chat.id}`, { state: { otherUser: property!.broker!.user } });
    },
  });

  if (isLoading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={36} className="text-dark" />
      </div>
    );
  }

  const featuresByCategory = (property.features || []).reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f.featureAr);
    return acc;
  }, {} as Record<string, string[]>);

  const images = property.images || [];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Image gallery */}
      <div className="relative h-72 md:h-96 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <motion.img
              key={imageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[imageIdx].url}
              alt={property.titleAr}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImageIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imageIdx ? 'bg-white w-4' : 'bg-white/60'}`} />
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs rounded-full px-3 py-1 font-semibold">
                  {imageIdx + 1}/{images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-6xl">🏠</span></div>
        )}

        {/* Overlay controls */}
        <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors">
            <span className="text-xl">←</span>
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors">
              <span className="text-lg">↑</span>
            </button>
            {isAuthenticated && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => favMutation.mutate()}
                className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <span className="text-lg">{property.isFavorited ? '❤️' : '🤍'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Title & price */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex gap-2 mb-3">
            <span className="text-xs bg-primary-light text-primary font-bold px-2.5 py-1 rounded-md">
              {TYPE_LABELS[property.type] || property.type}
            </span>
            <span className="text-xs bg-success-light text-success font-bold px-2.5 py-1 rounded-md">
              {LISTING_LABELS[property.listingType] || property.listingType}
            </span>
          </div>
          <h1 className="text-xl font-black text-dark mb-2">{property.titleAr}</h1>
          <div className="text-2xl font-black text-primary mb-2">
            {formatPrice(property.price, property.currency)}
          </div>
          {property.location && (
            <p className="text-sm text-text-sub">📍 {property.location.addressAr || property.location.address}</p>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 py-4 border-b border-gray-100 grid grid-cols-4 gap-2">
          {[
            { label: 'المساحة', value: `${property.area} م²` },
            ...(property.bedrooms != null ? [{ label: 'غرف', value: `${property.bedrooms}` }] : []),
            ...(property.bathrooms != null ? [{ label: 'حمامات', value: `${property.bathrooms}` }] : []),
            ...(property.floor != null ? [{ label: 'الطابق', value: `${property.floor}` }] : []),
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-black text-dark text-sm">{s.value}</div>
              <div className="text-text-muted text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h2 className="font-bold text-dark text-base mb-3">وصف العقار</h2>
          <p className="text-text-sub text-sm leading-relaxed">{property.descriptionAr}</p>
        </div>

        {/* Features */}
        {Object.keys(featuresByCategory).length > 0 && (
          <div className="px-5 py-5 border-b border-gray-100">
            <h2 className="font-bold text-dark text-base mb-3">المميزات</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(featuresByCategory).flat().map((feat) => (
                <span key={feat} className="text-xs bg-success-light text-success font-semibold px-3 py-1.5 rounded-full border border-green-200">
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Broker */}
        {property.broker && (
          <div className="px-5 py-5 border-b border-gray-100">
            <h2 className="font-bold text-dark text-base mb-3">الوسيط العقاري</h2>
            <div className="flex items-center gap-3 bg-bg rounded-xl p-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-dark text-sm">
                  {property.broker.user.firstName} {property.broker.user.lastName}
                </p>
                <p className="text-text-sub text-xs mt-0.5">
                  ⭐ {property.broker.rating != null ? Number(property.broker.rating).toFixed(1) : '—'} · {property.broker.totalDeals ?? 0} صفقة
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => chatMutation.mutate()}
                disabled={!isAuthenticated || chatMutation.isPending}
                className="bg-dark text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {chatMutation.isPending ? <Spinner size={14} /> : '💬 تواصل'}
              </motion.button>
            </div>
          </div>
        )}

        <div className="h-28" />
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-3xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isAuthenticated
              ? navigate('/booking', { state: { propertyId: property.id, brokerId: property.broker?.id } })
              : navigate('/auth/welcome')
            }
            className="w-full bg-dark text-white rounded-xl py-4 font-bold text-base hover:bg-slate-800 transition-colors shadow-lg"
          >
            {property.listingType === 'SALE' ? 'طلب معاينة' : 'احجز الآن'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
