import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';

// Auth pages
import WelcomePage from './pages/auth/WelcomePage';
import OtpPage from './pages/auth/OtpPage';
import RegisterPage from './pages/auth/RegisterPage';

// App pages
import DashboardPage from './pages/dashboard/DashboardPage';
import MyListingsPage from './pages/listings/MyListingsPage';
import AddPropertyPage from './pages/listings/AddPropertyPage';
import BookingRequestsPage from './pages/bookings/BookingRequestsPage';
import ChatListPage from './pages/chat/ChatListPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/profile/ProfilePage';

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
          {/* Auth routes */}
          <Route path="/auth/welcome" element={<WelcomePage />} />
          <Route path="/auth/otp" element={<OtpPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Protected app routes */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/listings" element={<MyListingsPage />} />
            <Route path="/listings/new" element={<AddPropertyPage />} />
            <Route path="/listings/:id/edit" element={<AddPropertyPage />} />
            <Route path="/bookings" element={<BookingRequestsPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
