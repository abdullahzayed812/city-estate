export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'BROKER' | 'ADMIN' | 'CUSTOMER';
  avatarUrl: string | null;
  preferredLang: 'ar' | 'en';
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Property {
  id: string;
  titleAr: string;
  title?: string;
  descriptionAr?: string;
  type: string;
  listingType: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  parkingSpaces?: number;
  furnished?: string | null;
  condition?: string | null;
  viewsCount: number;
  favoritesCount?: number;
  isFavorited?: boolean;
  primaryImage?: string;
  images?: { url: string; thumbnailUrl: string }[];
  location?: {
    addressAr?: string;
    address?: string;
    city: string;
    district: string | null;
    latitude?: number;
    longitude?: number;
  } | null;
  features?: { featureAr: string; category: string }[];
  broker?: {
    id: string;
    userId: string;
    user: { firstName: string; lastName: string; phone: string };
    rating: number | string | null;
    totalDeals: number | null;
  };
  createdAt?: string;
}

export interface Chat {
  id: string;
  propertyId: string | null;
  propertyTitleAr: string | null;
  otherUser: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  lastMessage: { content: string | null; createdAt: string } | null;
  brokerUnread: number;
  customerUnread?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'PROPERTY_CARD';
  content: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  type: 'VIEWING' | 'RENTAL' | 'PURCHASE';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledDate: string;
  scheduledTime: string;
  message: string | null;
  property: { titleAr: string };
  customer?: { firstName: string; lastName: string; phone: string };
  broker?: { firstName: string; lastName: string; phone: string };
}

export interface BrokerStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  pendingBookings: number;
  totalBookings: number;
  profileCompletion: number;
  rating: number;
  totalDeals: number;
}

export interface Pagination {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}
