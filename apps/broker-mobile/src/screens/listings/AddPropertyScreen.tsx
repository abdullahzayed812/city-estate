import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { colors, radius, shadow } from '../../theme';
import { TextInputField, SectionHeader } from '../../components/ui';

const PROPERTY_TYPES = [
  { key: 'APARTMENT', label: 'شقة' },
  { key: 'VILLA', label: 'فيلا' },
  { key: 'LAND', label: 'أرض' },
  { key: 'OFFICE', label: 'مكتب' },
  { key: 'STUDIO', label: 'استوديو' },
  { key: 'WAREHOUSE', label: 'مخزن' },
  { key: 'FACTORY', label: 'مصنع' },
  { key: 'SHOP', label: 'محل تجاري' },
];

const LISTING_TYPES = [
  { key: 'SALE', label: 'للبيع' },
  { key: 'RENT', label: 'للإيجار' },
  { key: 'DAILY_RENT', label: 'إيجار يومي' },
];

const FURNISHED_OPTS = [
  { key: 'FURNISHED', label: 'مفروش' },
  { key: 'SEMI_FURNISHED', label: 'نصف مفروش' },
  { key: 'UNFURNISHED', label: 'غير مفروش' },
];

const CONDITION_OPTS = [
  { key: 'NEW', label: 'جديد' },
  { key: 'EXCELLENT', label: 'ممتاز' },
  { key: 'GOOD', label: 'جيد' },
  { key: 'NEEDS_RENOVATION', label: 'يحتاج تجديد' },
];

interface FormState {
  titleAr: string;
  descriptionAr: string;
  type: string;
  listingType: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  parkingSpaces: string;
  furnished: string;
  condition: string;
  address: string;
  district: string;
}

export default function AddPropertyScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const isEdit = !!route.params?.propertyId;

  const [form, setForm] = useState<FormState>({
    titleAr: '',
    descriptionAr: '',
    type: 'APARTMENT',
    listingType: 'SALE',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    totalFloors: '',
    parkingSpaces: '',
    furnished: '',
    condition: '',
    address: '',
    district: '',
  });

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.titleAr,
        titleAr: form.titleAr,
        description: form.descriptionAr,
        descriptionAr: form.descriptionAr,
        type: form.type,
        listingType: form.listingType,
        price: parseFloat(form.price),
        area: parseFloat(form.area),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        floor: form.floor ? parseInt(form.floor, 10) : undefined,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors, 10) : undefined,
        parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces, 10) : 0,
        furnished: form.furnished || undefined,
        condition: form.condition || undefined,
        location: {
          address: form.address || form.district || 'برج العرب',
          addressAr: form.address || form.district || 'برج العرب',
          city: 'Borg El Arab',
          district: form.district || undefined,
          latitude: 30.876,
          longitude: 29.654,
        },
      };
      const { data } = await api.post('/properties', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] });
      Alert.alert('تم بنجاح', 'تم إرسال العقار للمراجعة', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('خطأ', err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    },
  });

  const isValid =
    form.titleAr.trim().length >= 10 &&
    form.descriptionAr.trim().length >= 50 &&
    form.price &&
    form.area &&
    form.address.trim();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'تعديل العقار' : 'إضافة عقار'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── المعلومات الأساسية ── */}
          <View style={styles.section}>
            <SectionHeader title="المعلومات الأساسية" />

            <TextInputField
              label="عنوان العقار *"
              value={form.titleAr}
              onChangeText={(v) => update('titleAr', v)}
              placeholder="مثال: شقة فاخرة بثلاث غرف نوم في برج العرب..."
              multiline
            />

            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>
                {'وصف العقار * '}
                <Text style={styles.labelHint}>
                  ({form.descriptionAr.trim().length}/50 حرف كحد أدنى)
                </Text>
              </Text>
              <TextInputField
                value={form.descriptionAr}
                onChangeText={(v) => update('descriptionAr', v)}
                placeholder="وصف تفصيلي للعقار ومميزاته..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 } as any}
              />
            </View>
          </View>

          {/* ── نوع وسعر العقار ── */}
          <View style={styles.section}>
            <SectionHeader title="نوع وسعر العقار" />

            <Text style={styles.label}>نوع العقار</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipScrollContent}
            >
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, form.type === t.key && styles.chipActive]}
                  onPress={() => update('type', t.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.chipText, form.type === t.key && styles.chipTextActive]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { marginTop: 16 }]}>نوع العرض</Text>
            <View style={styles.optionRow}>
              {LISTING_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.optionBtn, form.listingType === t.key && styles.optionBtnActive]}
                  onPress={() => update('listingType', t.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.listingType === t.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price & Area with suffix */}
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>السعر *</Text>
                <View style={styles.inputWithSuffix}>
                  <TextInputField
                    value={form.price}
                    onChangeText={(v) => update('price', v)}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.suffixInput as any}
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={styles.suffixBadge}>
                    <Text style={styles.suffixText}>ج.م</Text>
                  </View>
                </View>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>المساحة *</Text>
                <View style={styles.inputWithSuffix}>
                  <TextInputField
                    value={form.area}
                    onChangeText={(v) => update('area', v)}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.suffixInput as any}
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={styles.suffixBadge}>
                    <Text style={styles.suffixText}>م²</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ── التفاصيل ── */}
          <View style={styles.section}>
            <SectionHeader title="التفاصيل" />

            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <TextInputField
                  label="غرف النوم"
                  value={form.bedrooms}
                  onChangeText={(v) => update('bedrooms', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.gridCell}>
                <TextInputField
                  label="الحمامات"
                  value={form.bathrooms}
                  onChangeText={(v) => update('bathrooms', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={[styles.gridRow, { marginTop: 14 }]}>
              <View style={styles.gridCell}>
                <TextInputField
                  label="الطابق"
                  value={form.floor}
                  onChangeText={(v) => update('floor', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.gridCell}>
                <TextInputField
                  label="عدد الطوابق"
                  value={form.totalFloors}
                  onChangeText={(v) => update('totalFloors', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={[styles.gridRow, { marginTop: 14 }]}>
              <View style={styles.gridCell}>
                <TextInputField
                  label="مواقف السيارات"
                  value={form.parkingSpaces}
                  onChangeText={(v) => update('parkingSpaces', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.gridCell} />
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>التأثيث</Text>
            <View style={styles.optionRow}>
              {FURNISHED_OPTS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.optionBtn, form.furnished === f.key && styles.optionBtnActive]}
                  onPress={() => update('furnished', form.furnished === f.key ? '' : f.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.furnished === f.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>حالة العقار</Text>
            <View style={styles.optionRow}>
              {CONDITION_OPTS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.optionBtn, form.condition === c.key && styles.optionBtnActive]}
                  onPress={() => update('condition', form.condition === c.key ? '' : c.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.condition === c.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── الموقع ── */}
          <View style={styles.section}>
            <SectionHeader title="الموقع" />

            <TextInputField
              label="العنوان التفصيلي *"
              value={form.address}
              onChangeText={(v) => update('address', v)}
              placeholder="مثال: المجموعة الخامسة، برج العرب الجديدة"
            />

            <View style={{ marginTop: 14 }}>
              <TextInputField
                label="الحي / المنطقة"
                value={form.district}
                onChangeText={(v) => update('district', v)}
                placeholder="برج العرب"
              />
            </View>
          </View>

          {/* Bottom spacer for sticky footer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky footer button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!isValid || createMutation.isPending) && styles.submitBtnDisabled,
          ]}
          onPress={() => createMutation.mutate()}
          disabled={!isValid || createMutation.isPending}
          activeOpacity={0.85}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEdit ? 'حفظ التعديلات' : 'نشر العقار'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.dark,
  },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22, color: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  section: {
    backgroundColor: colors.bgCard,
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSub,
    marginBottom: 6,
  },
  labelHint: { fontSize: 11, fontWeight: '400', color: colors.textMuted },

  chipScroll: { marginHorizontal: -20, marginTop: 4 },
  chipScrollContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  chipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  chipText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  optionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionBtnText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  optionBtnTextActive: { color: '#fff' },

  gridRow: { flexDirection: 'row', gap: 12 },
  gridCell: { flex: 1 },

  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  suffixInput: {
    borderWidth: 0,
    borderRadius: 0,
  },
  suffixBadge: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  suffixText: { fontSize: 13, fontWeight: '700', color: colors.textSub },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.lg,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
