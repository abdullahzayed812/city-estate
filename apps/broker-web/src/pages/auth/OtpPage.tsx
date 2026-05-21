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
  const [phone, setPhone] = useState('01000000002');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;

  const handleSendOtp = async () => {
    if (formattedPhone.length < 12) {
      setError('أدخل رقم هاتف صحيح');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (intent === 'login') {
        await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'LOGIN' });
      } else {
        await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'REGISTER' });
      }
      setStep('OTP');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('هذا الرقم غير مسجل. أنشئ حساب وسيط أولاً');
      } else {
        setError(err?.response?.data?.message || 'فشل الإرسال، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
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
      const user = data.data.user;
      if (user.role !== 'BROKER' && user.role !== 'ADMIN') {
        setError('هذا التطبيق للوسطاء العقاريين فقط');
        return;
      }
      await setAuth(user, data.data.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'رمز غير صحيح، حاول مرة أخرى');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = otp.join('').length === 6;

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`h-2 rounded-full transition-all duration-300 ${step === 'PHONE' ? 'w-8 bg-primary' : 'w-3 bg-primary'}`} />
          <div className="w-10 h-0.5 bg-white/15" />
          <div className={`h-2 rounded-full transition-all duration-300 ${step === 'OTP' ? 'w-8 bg-primary' : 'w-3 bg-white/20'}`} />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-blue">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">وكيل عقاري</h1>
          <p className="text-white/50 text-sm">
            {step === 'PHONE'
              ? 'أدخل رقم هاتفك للمتابعة'
              : `أدخل الرمز المرسل إلى ${formattedPhone}`}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 'OTP' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {step === 'PHONE' ? (
            <>
              <div className="flex rounded-md overflow-hidden bg-white/8 border border-white/15 focus-within:border-primary transition-colors">
                <div className="flex items-center gap-2 px-4 py-4 border-l border-white/15">
                  <span className="text-lg">🇪🇬</span>
                  <span className="text-white font-bold text-sm">+20</span>
                </div>
                <input
                  ref={phoneRef}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  placeholder="1XX XXXX XXXX"
                  className="flex-1 px-4 py-4 bg-transparent text-white placeholder-white/35 text-base outline-none"
                  maxLength={13}
                  dir="ltr"
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 justify-center" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(r) => { inputRefs.current[i] = r; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className={`w-12 h-14 text-center text-xl font-black rounded-md border-2 bg-white/7 text-white outline-none transition-all ${
                      digit ? 'border-primary bg-primary/20' : 'border-white/20'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={step === 'PHONE' ? handleSendOtp : handleVerify}
            disabled={loading || (step === 'OTP' && !otpComplete)}
            className="w-full bg-primary text-white rounded-md py-4 font-bold text-base shadow-blue hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={20} /> : step === 'PHONE' ? 'إرسال الرمز' : 'تحقق من الرمز'}
          </motion.button>

          {step === 'OTP' && (
            <div className="flex justify-between items-center mt-2">
              {countdown > 0 ? (
                <span className="text-xs text-white/50 bg-white/8 px-4 py-2 rounded-full">
                  إعادة إرسال بعد {countdown} ث
                </span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-sm text-blue-400 font-bold hover:text-blue-300 transition-colors"
                >
                  إعادة إرسال الرمز
                </button>
              )}
              <button
                onClick={() => { setStep('PHONE'); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="text-sm text-white/45 hover:text-white/70 transition-colors"
              >
                تغيير الرقم
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/auth/welcome')}
            className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors mt-2"
          >
            ← العودة
          </button>

          <div className="mt-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center space-y-0.5">
            <p className="text-xs text-yellow-400 font-bold">وضع التطوير</p>
            <p className="text-xs text-white/50">محمد السيد (وسيط) · <span dir="ltr">+201000000002</span></p>
            <p className="text-xs text-white/35">رمز OTP يظهر في سجلات الخادم</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
