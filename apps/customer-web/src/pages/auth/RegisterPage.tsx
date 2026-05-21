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

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, string> = { phone, otpCode, firstName: form.firstName.trim(), lastName: form.lastName.trim(), role: 'CUSTOMER' };
      if (form.email.trim()) payload.email = form.email.trim();
      const { data } = await api.post('/auth/register', payload);
      await setAuth(data.data.user, data.data.tokens);
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-dark mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🏡</span>
          </div>
          <h1 className="text-2xl font-black text-dark mb-2">إنشاء حساب جديد</h1>
          <p className="text-text-sub text-sm">{phone}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-text-sub mb-1.5">الاسم الأول *</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="محمد" autoFocus
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-dark placeholder-gray-400 text-sm outline-none focus:border-dark transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-sub mb-1.5">الاسم الأخير *</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="العلي"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-dark placeholder-gray-400 text-sm outline-none focus:border-dark transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-sub mb-1.5">البريد الإلكتروني (اختياري)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" dir="ltr"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-dark placeholder-gray-400 text-sm outline-none focus:border-dark transition-colors" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={!form.firstName.trim() || !form.lastName.trim() || loading}
            className="w-full bg-dark text-white rounded-xl py-4 font-bold text-base hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Spinner size={20} /> : 'إنشاء الحساب'}
          </button>

          <button onClick={() => navigate('/auth/otp', { state: { intent: 'register' } })} className="w-full text-center text-sm text-text-sub hover:text-text-main transition-colors">← العودة</button>
        </motion.div>
      </div>
    </div>
  );
}
