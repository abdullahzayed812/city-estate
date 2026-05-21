import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Property } from '../../types';

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة', VILLA: 'فيلا', LAND: 'أرض', OFFICE: 'مكتب',
  STUDIO: 'استوديو', WAREHOUSE: 'مخزن', FACTORY: 'مصنع', SHOP: 'محل',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'للبيع', RENT: 'للإيجار', DAILY_RENT: 'إيجار يومي',
};

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  horizontal?: boolean;
  className?: string;
}

export function PropertyCard({ property, onPress, horizontal, className }: PropertyCardProps) {
  if (horizontal) {
    return (
      <motion.div
        whileHover={{ y: -1, scale: 1.005 }}
        transition={{ duration: 0.15 }}
        onClick={onPress}
        className={clsx('bg-white rounded-xl overflow-hidden shadow-card border border-gray-100 cursor-pointer flex gap-0', className)}
      >
        {/* Image */}
        <div className="w-28 h-full min-h-[100px] flex-shrink-0 bg-gray-100 relative overflow-hidden">
          {property.primaryImage ? (
            <img src={property.primaryImage} alt={property.titleAr} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl">🏠</span>
            </div>
          )}
          {property.isFavorited && (
            <div className="absolute top-1.5 right-1.5 text-sm">❤️</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-primary-light text-primary font-semibold px-2 py-0.5 rounded-md">
              {TYPE_LABELS[property.type] || property.type}
            </span>
            <span className="text-xs bg-gray-100 text-text-sub font-semibold px-2 py-0.5 rounded-md">
              {LISTING_LABELS[property.listingType] || property.listingType}
            </span>
          </div>
          <h3 className="font-bold text-dark text-sm leading-tight line-clamp-2 mb-1">
            {property.titleAr}
          </h3>
          <div className="text-primary font-black text-base">
            {formatPrice(property.price, property.currency)}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-text-sub">
            <span>📐 {property.area} م²</span>
            {property.bedrooms != null && <span>🛏 {property.bedrooms}</span>}
            {property.bathrooms != null && <span>🚿 {property.bathrooms}</span>}
          </div>
          {property.location && (
            <p className="text-xs text-text-muted mt-1 truncate">
              📍 {property.location.city}{property.location.district ? ` · ${property.location.district}` : ''}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={onPress}
      className={clsx('bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer', className)}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {property.primaryImage ? (
          <img src={property.primaryImage} alt={property.titleAr} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🏠</span>
          </div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {(property as any).isFeatured && (
            <span className="text-xs bg-amber-400 text-amber-900 font-bold px-2.5 py-1 rounded-full">⭐ مميز</span>
          )}
          <span className="text-xs bg-white/90 text-dark font-semibold px-2.5 py-1 rounded-full">
            {TYPE_LABELS[property.type] || property.type}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={clsx(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            property.listingType === 'SALE' ? 'bg-primary text-white' : 'bg-success text-white',
          )}>
            {LISTING_LABELS[property.listingType] || property.listingType}
          </span>
        </div>
        {property.isFavorited && (
          <div className="absolute bottom-3 left-3 text-xl">❤️</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-dark text-sm leading-tight line-clamp-2 mb-2">{property.titleAr}</h3>
        <div className="text-primary font-black text-lg mb-2">{formatPrice(property.price, property.currency)}</div>
        <div className="flex items-center gap-3 text-xs text-text-sub mb-2">
          <span>📐 {property.area} م²</span>
          {property.bedrooms != null && <span>🛏 {property.bedrooms}</span>}
          {property.bathrooms != null && <span>🚿 {property.bathrooms}</span>}
        </div>
        {property.location && (
          <p className="text-xs text-text-muted truncate">
            📍 {property.location.city}{property.location.district ? ` · ${property.location.district}` : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
}
