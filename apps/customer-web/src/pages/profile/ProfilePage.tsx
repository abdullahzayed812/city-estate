import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Card } from '../../components/ui';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [logoutModal, setLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-black text-dark mb-2">تسجيل الدخول مطلوب</h2>
        <p className="text-text-sub text-sm text-center mb-8">سجل دخولك للوصول لملفك الشخصي وحجوزاتك</p>
        <button onClick={() => navigate('/auth/welcome')} className="px-8 py-3 bg-dark text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const menuSections = [
    {
      title: 'حسابي',
      items: [
        { icon: '❤️', label: 'المفضلة', action: () => navigate('/favorites') },
        { icon: '📅', label: 'حجوزاتي', action: () => navigate('/bookings') },
        { icon: '💬', label: 'محادثاتي', action: () => navigate('/chat') },
        { icon: '✏️', label: 'تعديل الملف', action: () => alert('قريباً') },
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
      {/* Header */}
      <div className="bg-dark py-8 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar name={userName || 'ع'} size={96} />
            <button className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-dark shadow-md">
              <span className="text-sm">📷</span>
            </button>
          </div>
          <h2 className="text-white font-black text-2xl">{userName}</h2>
          <p className="text-white/50 text-sm mt-1">{user?.phone}</p>
          <span className="mt-3 text-xs font-bold text-white bg-white/15 px-4 py-1.5 rounded-full border border-white/25">
            عميل
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-bold text-text-sub mb-2 px-1">{section.title}</h3>
            <Card className="overflow-hidden divide-y divide-bg">
              {section.items.map((item: any, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg cursor-pointer transition-colors" onClick={item.action}>
                  <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className="flex-1 text-sm font-semibold text-dark">{item.label}</span>
                  {item.toggle !== undefined ? (
                    <div onClick={(e) => { e.stopPropagation(); item.onToggle?.(); }}
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${item.toggle ? 'bg-dark' : 'bg-gray-200'}`}>
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

        <Card className="overflow-hidden">
          <button onClick={() => setLogoutModal(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-error-light transition-colors">
            <div className="w-9 h-9 rounded-xl bg-error-light flex items-center justify-center">
              <span className="text-lg">🚪</span>
            </div>
            <span className="text-error font-bold text-sm flex-1">تسجيل الخروج</span>
            <span className="text-error text-lg">‹</span>
          </button>
        </Card>

        <p className="text-center text-xs text-text-muted pb-6">مدينة العقار v1.0.0</p>
      </div>

      <AnimatePresence>
        {logoutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setLogoutModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-3xl text-center mb-3">🚪</div>
              <h3 className="text-lg font-bold text-dark text-center mb-2">تسجيل الخروج</h3>
              <p className="text-text-sub text-sm text-center mb-6">هل أنت متأكد؟</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutModal(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-text-sub font-bold text-sm hover:bg-gray-50">إلغاء</button>
                <button onClick={() => { logout(); navigate('/auth/welcome', { replace: true }); }} className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:bg-red-700 transition-colors">خروج</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
