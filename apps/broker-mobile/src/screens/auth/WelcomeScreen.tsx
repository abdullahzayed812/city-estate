import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, shadow } from '../../theme';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🏠', label: 'أضف عقاراتك', desc: 'انشر إعلاناتك وتواصل مع العملاء بسهولة' },
  { icon: '📅', label: 'إدارة الحجوزات', desc: 'تابع طلبات المعاينة في مكان واحد' },
  { icon: '📊', label: 'إحصائيات دقيقة', desc: 'راقب أداء إعلاناتك لحظة بلحظة' },
];

export default function BrokerWelcomeScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />

      {/* Hero — top 40% */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏢</Text>
        </View>
        <Text style={styles.appName}>وكيل عقاري</Text>
        <Text style={styles.tagline}>منصتك الاحترافية لإدارة العقارات{'\n'}وتنمية أعمالك في برج العرب</Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Text style={styles.featureIconText}>{f.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Otp', { intent: 'login' })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Otp', { intent: 'register' })}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>إنشاء حساب</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          بالمتابعة توافق على{' '}
          <Text style={styles.termsLink}>شروط الاستخدام</Text>
          {' '}و{' '}
          <Text style={styles.termsLink}>سياسة الخصوصية</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },

  // Hero
  hero: {
    height: height * 0.40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    ...shadow.blue,
  },
  logoEmoji: { fontSize: 50 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features
  features: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.blue,
  },
  featureIconText: { fontSize: 24 },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '700', color: '#fff' },
  featureDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 18 },

  // Actions
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 16,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 17,
    alignItems: 'center',
    ...shadow.blue,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.32)',
    lineHeight: 18,
    marginTop: 4,
  },
  termsLink: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
});
