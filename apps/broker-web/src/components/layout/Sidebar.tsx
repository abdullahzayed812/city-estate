import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'الرئيسية' },
  { to: '/listings', icon: '🏠', label: 'عقاراتي' },
  { to: '/bookings', icon: '📅', label: 'الحجوزات' },
  { to: '/chat', icon: '💬', label: 'المحادثات' },
  { to: '/profile', icon: '👤', label: 'حسابي' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleLogout = () => {
    logout();
    navigate('/auth/welcome');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col h-screen bg-dark border-l border-white/8 fixed right-0 top-0 z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0 shadow-blue">
          <span className="text-xl">🏢</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-white font-bold text-sm leading-tight">وكيل عقاري</p>
              <p className="text-white/40 text-xs">منصة الوسطاء</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="mr-auto text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/8 flex-shrink-0"
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-all duration-150 group relative',
                isActive
                  ? 'bg-primary text-white shadow-blue'
                  : 'text-white/50 hover:text-white hover:bg-white/8',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl flex-shrink-0 leading-none">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-semibold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="absolute left-full mr-2 ml-1 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/8 p-3">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar name={userName || 'وع'} size={36} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-xs font-semibold truncate">{userName}</p>
                <p className="text-white/40 text-xs truncate">{user?.phone}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-red-400 transition-colors text-sm flex-shrink-0 p-1"
              title="تسجيل الخروج"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// Mobile Bottom Nav
export function BottomNav() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark border-t border-white/10 lg:hidden">
      <div className="flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all',
                isActive ? 'text-primary' : 'text-white/40 hover:text-white/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl leading-none">{item.icon}</span>
                <span className={clsx('text-xs font-semibold', isActive ? 'text-primary' : 'text-white/40')}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
