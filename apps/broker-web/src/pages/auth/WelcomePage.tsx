import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🏠', label: 'أضف عقاراتك', desc: 'انشر إعلاناتك وتواصل مع العملاء بسهولة' },
  { icon: '📅', label: 'إدارة الحجوزات', desc: 'تابع طلبات المعاينة في مكان واحد' },
  { icon: '📊', label: 'إحصائيات دقيقة', desc: 'راقب أداء إعلاناتك لحظة بلحظة' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } };

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex items-stretch" dir="rtl">
      {/* Left decorative panel (desktop) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/20 to-dark relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(29,78,216,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center px-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-32 h-32 rounded-3xl bg-primary mx-auto mb-8 flex items-center justify-center shadow-blue"
          >
            <span className="text-6xl">🏢</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-4 leading-tight"
          >
            منصة الوسطاء<br />العقاريين
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-lg leading-relaxed"
          >
            منصتك الاحترافية لإدارة العقارات<br />وتنمية أعمالك في برج العرب
          </motion.p>
        </div>
        {/* Floating orbs */}
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-32 left-8 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Right: auth panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-blue">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">وكيل عقاري</h1>
          <p className="text-white/50 text-sm">منصتك الاحترافية لإدارة العقارات</p>
        </div>

        {/* Features */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-5 mb-10 max-w-sm mx-auto w-full"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.label} variants={item} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center flex-shrink-0 shadow-blue">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{f.label}</p>
                <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
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
            className="w-full bg-primary text-white rounded-md py-4 font-bold text-base shadow-blue hover:bg-blue-700 transition-colors"
          >
            تسجيل الدخول
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/otp', { state: { intent: 'register' } })}
            className="w-full bg-white/8 text-white rounded-md py-4 font-bold text-base border-2 border-white/18 hover:bg-white/12 transition-colors"
          >
            إنشاء حساب
          </motion.button>

          <p className="text-center text-xs text-white/30 mt-2">
            بالمتابعة توافق على{' '}
            <span className="text-white/55 font-semibold cursor-pointer hover:text-white">شروط الاستخدام</span>
            {' '}و{' '}
            <span className="text-white/55 font-semibold cursor-pointer hover:text-white">سياسة الخصوصية</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
