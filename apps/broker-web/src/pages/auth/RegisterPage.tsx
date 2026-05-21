import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { phone, otpCode } = (location.state as any) ?? {};

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = form.firstName.trim() && form.lastName.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        phone,
        otpCode,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: 'BROKER',
      };
      if (form.email.trim()) payload.email = form.email.trim();

      const { data } = await api.post('/auth/register', payload);
      await setAuth(data.data.user, data.data.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-blue">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">إنشاء حساب وسيط</h1>
          <p className="text-white/50 text-sm">{phone}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">الاسم الأول *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="محمد"
                className="w-full px-4 py-3 rounded-md bg-white/8 border border-white/15 text-white placeholder-white/35 text-sm outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1.5">الاسم الأخير *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="العلي"
                className="w-full px-4 py-3 rounded-md bg-white/8 border border-white/15 text-white placeholder-white/35 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1.5">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="broker@example.com"
              className="w-full px-4 py-3 rounded-md bg-white/8 border border-white/15 text-white placeholder-white/35 text-sm outline-none focus:border-primary transition-colors"
              dir="ltr"
            />
          </div>

          <div className="flex rounded-md overflow-hidden bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-base">🇪🇬</span>
              <span className="text-white/60 font-semibold text-sm">{phone}</span>
            </div>
            <span className="ml-auto px-3 py-3 text-xs text-green-400 font-semibold">✓ تم التحقق</span>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full bg-primary text-white rounded-md py-4 font-bold text-base shadow-blue hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={20} /> : 'إنشاء الحساب'}
          </motion.button>

          <button
            onClick={() => navigate('/auth/otp', { state: { intent: 'register' } })}
            className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            ← العودة
          </button>
        </motion.div>
      </div>
    </div>
  );
}
