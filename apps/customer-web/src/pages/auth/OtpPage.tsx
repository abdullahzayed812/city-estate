import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui';

type Step = 'PHONE' | 'OTP';

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const intent: 'login' | 'register' = (location.state as any)?.intent ?? 'login';

  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('01000000010');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;

  const handleSendOtp = async () => {
    if (formattedPhone.length < 12) { setError('أدخل رقم هاتف صحيح'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { phone: formattedPhone, purpose: intent === 'login' ? 'LOGIN' : 'REGISTER' });
      setStep('OTP');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const d = val.slice(-1);
    const next = [...otp];
    next[idx] = d;
    setOtp(next);
    if (d && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) return;
    setError('');
    setLoading(true);
    try {
      if (intent === 'register') {
        navigate('/auth/register', { state: { phone: formattedPhone, otpCode } });
        return;
      }
      const { data } = await api.post('/auth/login', { phone: formattedPhone, otpCode });
      await setAuth(data.data.user, data.data.tokens);
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'رمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`h-2 rounded-full transition-all ${step === 'PHONE' ? 'w-8 bg-dark' : 'w-3 bg-dark'}`} />
          <div className="w-10 h-0.5 bg-gray-200" />
          <div className={`h-2 rounded-full transition-all ${step === 'OTP' ? 'w-8 bg-dark' : 'w-3 bg-gray-300'}`} />
        </div>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-dark mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🏡</span>
          </div>
          <h1 className="text-2xl font-black text-dark mb-2">مدينة العقار</h1>
          <p className="text-text-sub text-sm">
            {step === 'PHONE' ? 'أدخل رقم هاتفك للمتابعة' : `أدخل الرمز المرسل إلى ${formattedPhone}`}
          </p>
        </motion.div>

        <motion.div key={step} initial={{ opacity: 0, x: step === 'OTP' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {step === 'PHONE' ? (
            <div className="flex rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 focus-within:border-dark transition-colors">
              <div className="flex items-center gap-2 px-4 py-4 border-l-2 border-gray-200">
                <span className="text-lg">🇪🇬</span>
                <span className="text-dark font-bold text-sm">+20</span>
              </div>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                placeholder="1XX XXXX XXXX" dir="ltr" autoFocus
                className="flex-1 px-4 py-4 bg-transparent text-dark placeholder-gray-400 text-base outline-none"
                maxLength={13}
              />
            </div>
          ) : (
            <div className="flex gap-2 justify-center" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i} ref={(r) => { inputRefs.current[i] = r; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus(); }}
                  className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 bg-gray-50 text-dark outline-none transition-all ${digit ? 'border-dark bg-gray-100' : 'border-gray-200'}`}
                />
              ))}
            </div>
          )}

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">{error}</motion.p>}

          <button
            onClick={step === 'PHONE' ? handleSendOtp : handleVerify}
            disabled={loading || (step === 'OTP' && otp.join('').length < 6)}
            className="w-full bg-dark text-white rounded-xl py-4 font-bold text-base hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={20} /> : step === 'PHONE' ? 'إرسال الرمز' : 'تحقق من الرمز'}
          </button>

          {step === 'OTP' && (
            <div className="flex justify-between mt-2">
              {countdown > 0 ? (
                <span className="text-xs text-text-sub bg-gray-100 px-4 py-2 rounded-full">إعادة إرسال بعد {countdown} ث</span>
              ) : (
                <button onClick={handleSendOtp} className="text-sm text-dark font-bold hover:text-primary transition-colors">إعادة إرسال</button>
              )}
              <button onClick={() => { setStep('PHONE'); setOtp(['', '', '', '', '', '']); }} className="text-sm text-text-sub hover:text-text-main transition-colors">
                تغيير الرقم
              </button>
            </div>
          )}

          <button onClick={() => navigate('/auth/welcome')} className="w-full text-center text-sm text-text-sub hover:text-text-main transition-colors">← العودة</button>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center space-y-0.5">
            <p className="text-xs text-amber-700 font-bold">وضع التطوير</p>
            <p className="text-xs text-amber-600">سارة أحمد (عميلة) · <span dir="ltr">+201000000010</span></p>
            <p className="text-xs text-amber-500">رمز OTP يظهر في سجلات الخادم</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
