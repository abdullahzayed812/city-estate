import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useConfigStore, DEFAULT_SERVER_IP } from '../../store/configStore';

export default function ServerConfigScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { serverIp, isConfigured, setServerIp } = useConfigStore();
  const [ip, setIp] = useState(serverIp || DEFAULT_SERVER_IP);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = ip.trim();
    if (!trimmed) {
      Alert.alert('خطأ', 'الرجاء إدخال عنوان IP');
      return;
    }
    setSaving(true);
    try {
      await setServerIp(trimmed);
      if (isConfigured && navigation.canGoBack()) {
        navigation.goBack();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {isConfigured && navigation.canGoBack() && (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ رجوع</Text>
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🖥️</Text>
          </View>

          <Text style={styles.title}>إعداد الخادم</Text>
          <Text style={styles.subtitle}>
            أدخل عنوان IP الخاص بالخادم الذي يستضيف واجهة برمجة التطبيقات
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>عنوان IP للخادم</Text>
            <TextInput
              style={styles.input}
              value={ip}
              onChangeText={setIp}
              placeholder={DEFAULT_SERVER_IP}
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.hint}>مثال: 192.168.1.100</Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>حفظ والمتابعة</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a1628' },
  flex: { flex: 1 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  backText: { fontSize: 17, color: '#1d4ed8', fontWeight: '600' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    backgroundColor: '#1d4ed8',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
