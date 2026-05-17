import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';

type Step = 'PHONE' | 'OTP';

export default function OtpScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setAuth } = useAuthStore();

  const intent: 'login' | 'register' = route.params?.intent ?? 'login';

  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;
    if (formattedPhone.length < 12) {
      Alert.alert('خطأ', 'أدخل رقم هاتف صحيح');
      return;
    }
    setLoading(true);
    try {
      if (intent === 'login') {
        try {
          await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'LOGIN' });
        } catch (err: any) {
          if (err?.response?.status === 404) {
            Alert.alert('خطأ', 'هذا الرقم غير مسجل. أنشئ حساب وسيط أولاً');
            return;
          }
          throw err;
        }
      } else {
        await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'REGISTER' });
      }
      setStep('OTP');
      setCountdown(60);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) return;

    const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;

    setLoading(true);
    try {
      if (intent === 'register') {
        navigation.navigate('Register', { phone: formattedPhone, otpCode });
      } else {
        const { data } = await api.post('/auth/login', { phone: formattedPhone, otpCode });
        if (data.data.user.role !== 'BROKER' && data.data.user.role !== 'ADMIN') {
          Alert.alert('غير مصرح', 'هذا التطبيق للوسطاء العقاريين فقط');
          return;
        }
        await setAuth(data.data.user, data.data.tokens);
      }
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'رمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step === 'PHONE' && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'OTP' && styles.stepDotActive]} />
          </View>

          {/* Logo & title */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logo}>🏢</Text>
            </View>
            <Text style={styles.title}>وكيل عقاري</Text>
            <Text style={styles.subtitle}>
              {step === 'PHONE'
                ? 'أدخل رقم هاتفك للمتابعة'
                : `أدخل الرمز المرسل إلى\n+2${phone}`}
            </Text>
          </View>

          {step === 'PHONE' ? (
            <View style={styles.form}>
              {/* Phone input row */}
              <View style={styles.phoneField}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryFlag}>🇪🇬</Text>
                  <Text style={styles.countryCodeText}>+20</Text>
                </View>
                <View style={styles.phoneInputDivider} />
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="1XX XXXX XXXX"
                  keyboardType="phone-pad"
                  maxLength={13}
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  textAlign="left"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>إرسال الرمز</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {/* OTP boxes */}
              <View
                style={[
                  styles.otpContainer,
                  I18nManager.isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text.slice(-1), i)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (otp.join('').length < 6 || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleVerify}
                disabled={otp.join('').length < 6 || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>تحقق من الرمز</Text>
                )}
              </TouchableOpacity>

              {/* Resend & change number row */}
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <View style={styles.timerPill}>
                    <Text style={styles.timerPillText}>إعادة إرسال بعد {countdown} ث</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendText}>إعادة إرسال الرمز</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setStep('PHONE');
                    setOtp(['', '', '', '', '', '']);
                  }}
                >
                  <Text style={styles.changePhoneText}>تغيير الرقم</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { flex: 1, padding: 28, justifyContent: 'center' },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 0,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 28,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 6,
  },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 44 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...shadow.blue,
  },
  logo: { fontSize: 38 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // Form
  form: { gap: 16 },

  // Phone field
  phoneField: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 6,
  },
  countryFlag: { fontSize: 18 },
  countryCodeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  phoneInputDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
  },

  // OTP boxes
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  otpInput: {
    width: 52,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(29,78,216,0.2)',
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    ...shadow.blue,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Resend row
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timerPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  timerPillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  resendText: { fontSize: 13, color: '#60a5fa', fontWeight: '700' },
  changePhoneText: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
});
