import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🔍', label: 'ابحث بسهولة', desc: 'آلاف العقارات في متناول يدك' },
  { icon: '🏠', label: 'عقارات متنوعة', desc: 'شقق، فيلات، أراضي، مكاتب وأكثر' },
  { icon: '💬', label: 'تواصل مباشر', desc: 'تحدث مع الوسيط مباشرةً في التطبيق' },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right: hero */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark to-slate-800 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(29,78,216,0.2)_0%,_transparent_60%)]" />
        <div className="relative z-10 text-center px-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 rounded-3xl bg-white mx-auto mb-8 flex items-center justify-center shadow-2xl"
          >
            <span className="text-6xl">🏡</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-4"
          >
            مدينة العقار<br />برج العرب
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-lg leading-relaxed"
          >
            ابحث عن منزل أحلامك<br />في أفضل موقع عقاري
          </motion.p>
        </div>
      </div>

      {/* Left: auth */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="lg:hidden mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dark mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🏡</span>
          </div>
          <h1 className="text-3xl font-black text-dark mb-2">مدينة العقار</h1>
          <p className="text-text-sub text-sm">ابحث عن منزل أحلامك</p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-5 mb-10 max-w-sm mx-auto w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <div>
                <p className="font-bold text-dark text-sm">{f.label}</p>
                <p className="text-text-sub text-xs mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 max-w-sm mx-auto w-full"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/otp', { state: { intent: 'login' } })}
            className="w-full bg-dark text-white rounded-xl py-4 font-bold text-base hover:bg-slate-800 transition-colors"
          >
            تسجيل الدخول
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/otp', { state: { intent: 'register' } })}
            className="w-full bg-white text-dark rounded-xl py-4 font-bold text-base border-2 border-dark hover:bg-gray-50 transition-colors"
          >
            إنشاء حساب جديد
          </motion.button>

          <button
            onClick={() => navigate('/home')}
            className="w-full text-center text-sm text-text-sub hover:text-text-main transition-colors py-2"
          >
            تصفح بدون تسجيل دخول ›
          </button>
        </motion.div>
      </div>
    </div>
  );
}
