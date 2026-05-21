import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui';

const NAV_ITEMS = [
  { to: '/home', icon: '🏠', label: 'الرئيسية' },
  { to: '/search', icon: '🔍', label: 'البحث' },
  { to: '/bookings', icon: '📅', label: 'حجوزاتي' },
  { to: '/chat', icon: '💬', label: 'المحادثات' },
  { to: '/profile', icon: '👤', label: 'حسابي' },
];

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => navigate('/home')} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center">
            <span className="text-lg">🏡</span>
          </div>
          <span className="font-black text-dark text-base hidden sm:block">مدينة العقار</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all', isActive ? 'bg-dark text-white' : 'text-text-sub hover:bg-gray-100 hover:text-dark')
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="mr-auto flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="text-lg">🔔</span>
              </button>
              <button onClick={() => navigate('/profile')} className="flex items-center gap-2">
                <Avatar name={userName || 'ع'} size={36} />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth/welcome')}
              className="px-4 py-2 rounded-xl bg-dark text-white text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 lg:hidden">
      <div className="flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx('flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all relative', isActive ? 'text-dark' : 'text-text-muted')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="bottomActiveBar" className="absolute top-0 left-2 right-2 h-0.5 bg-dark rounded-full" />
                )}
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
