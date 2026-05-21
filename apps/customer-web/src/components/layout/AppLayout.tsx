import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, BottomNav } from './Navbar';

const FULLSCREEN_ROUTES = ['/chat/'];

export function AppLayout() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((r) => location.pathname.startsWith(r));

  if (isFullscreen) {
    return (
      <div className="h-screen flex flex-col bg-bg overflow-hidden" dir="rtl">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col" dir="rtl">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 pb-20 lg:pb-0"
      >
        <Outlet />
      </motion.main>
      <BottomNav />
    </div>
  );
}
