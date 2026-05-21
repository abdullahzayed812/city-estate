import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';

// Auth
import WelcomePage from './pages/auth/WelcomePage';
import OtpPage from './pages/auth/OtpPage';
import RegisterPage from './pages/auth/RegisterPage';

// App pages
import HomePage from './pages/home/HomePage';
import SearchPage from './pages/search/SearchPage';
import PropertyDetailPage from './pages/property/PropertyDetailPage';
import BookingPage from './pages/booking/BookingPage';
import BookingsPage from './pages/booking/BookingsPage';
import ChatListPage from './pages/chat/ChatListPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/profile/ProfilePage';
import FavoritesPage from './pages/profile/FavoritesPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/welcome" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth */}
          <Route path="/auth/welcome" element={<WelcomePage />} />
          <Route path="/auth/otp" element={<OtpPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* App with layout */}
          <Route element={<AppLayout />}>
            {/* Public routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />

            {/* Auth-only routes */}
            <Route path="/booking" element={<RequireAuth><BookingPage /></RequireAuth>} />
            <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><ChatListPage /></RequireAuth>} />
            <Route path="/chat/:chatId" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
