import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Card, SectionHeader } from '../../components/ui';
import type { BrokerStats } from '../../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  const { data: stats } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
  });

  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const completion = stats?.profileCompletion ?? 0;

  const menuSections = [
    {
      title: 'حسابي',
      items: [
        { icon: '✏️', label: 'تعديل الملف الشخصي', action: () => alert('قريباً') },
        { icon: '📋', label: 'الوثائق والترخيص', action: () => alert('قريباً') },
        { icon: '⭐', label: 'التقييمات والمراجعات', action: () => alert('قريباً') },
        { icon: '💳', label: 'الاشتراك والباقات', action: () => alert('قريباً') },
      ],
    },
    {
      title: 'الإعدادات',
      items: [
        { icon: '🔔', label: 'الإشعارات', toggle: notifications, onToggle: () => setNotifications(!notifications) },
        { icon: '🌐', label: 'اللغة', value: 'العربية', action: () => alert('قريباً') },
      ],
    },
    {
      title: 'المساعدة',
      items: [
        { icon: '📞', label: 'الدعم الفني', action: () => alert('الدعم: +201000000001') },
        { icon: '📄', label: 'شروط الاستخدام', action: () => alert('قريباً') },
        { icon: '🔒', label: 'سياسة الخصوصية', action: () => alert('قريباً') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Profile header */}
      <div className="bg-dark pb-8">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar name={userName || 'وع'} size={96} />
              <button className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-dark shadow-md hover:bg-gray-50 transition-colors">
                <span className="text-sm">📷</span>
              </button>
            </div>
            <h2 className="text-white font-black text-2xl">{userName}</h2>
            <p className="text-white/50 text-sm mt-1">{user?.phone}</p>
            <div className="flex gap-2 mt-3">
              <span className="text-xs font-bold text-white bg-white/15 px-4 py-1.5 rounded-full border border-white/25">وكيل معتمد</span>
              <span className="text-xs font-bold text-yellow-300 bg-yellow-500/15 px-4 py-1.5 rounded-full border border-yellow-400/25">
                ⭐ {Number(stats?.rating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-dark -mt-4 rounded-t-3xl pt-4">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'نشط', value: stats?.activeProperties ?? 0, color: 'text-primary' },
              { label: 'مشاهدات', value: stats?.totalViews ?? 0, color: 'text-success' },
              { label: 'حجوزات', value: stats?.totalBookings ?? 0, color: 'text-warning' },
              { label: 'صفقات', value: stats?.totalDeals ?? 0, color: 'text-purple' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-md py-3 text-center">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/45 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Profile completion */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-text-main">اكتمال الملف</span>
            <span className="text-xl font-black text-primary">{completion}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${completion >= 80 ? 'bg-success' : 'bg-primary'}`}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">أكمل ملفك لزيادة ظهورك للعملاء</p>
        </Card>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} />
            <Card className="overflow-hidden divide-y divide-bg">
              {section.items.map((item: any, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg cursor-pointer transition-colors"
                  onClick={item.action}
                >
                  <div className="w-9 h-9 rounded-md bg-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className="flex-1 text-sm font-semibold text-text-main">{item.label}</span>
                  {item.toggle !== undefined ? (
                    <div
                      onClick={(e) => { e.stopPropagation(); item.onToggle?.(); }}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${item.toggle ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.toggle ? 'right-1' : 'left-1'}`} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-xs text-text-muted">{item.value}</span>}
                      <span className="text-text-muted text-lg">‹</span>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout */}
        <Card className="overflow-hidden">
          <button
            onClick={() => setLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-error-light transition-colors"
          >
            <div className="w-9 h-9 rounded-md bg-error-light flex items-center justify-center">
              <span className="text-lg">🚪</span>
            </div>
            <span className="text-error font-bold text-sm">تسجيل الخروج</span>
            <span className="mr-auto text-error text-lg">‹</span>
          </button>
        </Card>

        <p className="text-center text-xs text-text-muted pb-6">وكيل عقاري v1.0.0</p>
      </div>

      {/* Logout modal */}
      <AnimatePresence>
        {logoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-xl p-6 max-w-sm w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl text-center mb-3">🚪</div>
              <h3 className="text-lg font-bold text-text-main text-center mb-2">تسجيل الخروج</h3>
              <p className="text-text-sub text-sm text-center mb-6">هل أنت متأكد من تسجيل الخروج؟</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutModal(false)} className="flex-1 py-2.5 rounded-md border border-border text-text-sub font-bold text-sm hover:bg-bg transition-colors">
                  إلغاء
                </button>
                <button onClick={() => { logout(); navigate('/auth/welcome', { replace: true }); }} className="flex-1 py-2.5 rounded-md bg-error text-white font-bold text-sm hover:bg-red-700 transition-colors">
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
