import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';
import { Card, PrimaryButton, TextInputField, SectionHeader } from '../../components/ui';

export default function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, otpCode } = route.params || {};
  const { setAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال الاسم الأول والأخير');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        phone,
        otpCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        role: 'BROKER',
      });

      await setAuth(data.data.user, data.data.tokens);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏢</Text>
            </View>
            <Text style={styles.title}>إنشاء حساب وسيط</Text>
            <Text style={styles.subtitle}>أكمل بياناتك للبدء في نشر العقارات</Text>
          </View>

          {/* Form card */}
          <Card style={styles.formCard}>
            <SectionHeader title="البيانات الشخصية" />

            {/* First + Last name row */}
            <View style={styles.nameRow}>
              <View style={styles.nameCell}>
                <TextInputField
                  label="الاسم الأول *"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="محمد"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.nameCell}>
                <TextInputField
                  label="الاسم الأخير *"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="أحمد"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGap}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>{phone}</Text>
              </View>
            </View>

            <View style={styles.fieldGap}>
              <TextInputField
                label="البريد الإلكتروني (اختياري)"
                value={email}
                onChangeText={setEmail}
                placeholder="broker@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="left"
              />
            </View>
          </Card>

          <View style={styles.btnWrap}>
            <PrimaryButton
              label="إنشاء الحساب"
              onPress={handleRegister}
              loading={loading}
              disabled={!firstName.trim() || !lastName.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },

  headerSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadow.blue,
  },
  logoEmoji: { fontSize: 34 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  formCard: {
    padding: 20,
    gap: 0,
  },

  nameRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  nameCell: { flex: 1 },

  fieldGap: { marginTop: 16 },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSub,
    marginBottom: 6,
  },
  disabledInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#f1f5f9',
  },
  disabledInputText: {
    fontSize: 15,
    color: colors.textMuted,
  },

  btnWrap: { marginTop: 20 },
});
