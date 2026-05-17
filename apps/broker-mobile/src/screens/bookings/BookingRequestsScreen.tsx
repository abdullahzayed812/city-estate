import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { colors, radius, shadow } from '../../theme';
import { Card, Badge, EmptyState } from '../../components/ui';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const TYPE_LABELS: Record<string, string> = {
  VIEWING: 'معاينة',
  RENTAL: 'إيجار',
  PURCHASE: 'شراء',
};

const FILTERS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PENDING', label: 'معلّق' },
  { key: 'CONFIRMED', label: 'مؤكد' },
  { key: 'COMPLETED', label: 'مكتمل' },
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatDate(dateStr: string): { day: string; month: string } {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[2].replace(/^0/, '');
    const monthIdx = parseInt(parts[1], 10) - 1;
    return { day, month: MONTH_NAMES_AR[monthIdx] ?? '' };
  }
  return { day: dateStr, month: '' };
}

interface Booking {
  id: string;
  property: { titleAr: string };
  customer: { firstName: string; lastName: string; phone: string };
  type: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  message: string | null;
}

export default function BookingRequestsScreen(): React.ReactElement {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; bookingId: string | null }>({
    visible: false,
    bookingId: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'bookings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/bookings/broker?${params}`);
      return data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/bookings/${id}/confirm`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch(`/bookings/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] });
      setCancelModal({ visible: false, bookingId: null });
      setCancelReason('');
    },
    onError: () => {
      Alert.alert('خطأ', 'حدث خطأ أثناء إلغاء الحجز، حاول مرة أخرى');
    },
  });

  const handleConfirm = (id: string) => {
    Alert.alert('تأكيد الحجز', 'هل تريد تأكيد هذا الموعد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: () => confirmMutation.mutate(id) },
    ]);
  };

  const handleCancel = (id: string) => {
    setCancelReason('');
    setCancelModal({ visible: true, bookingId: id });
  };

  const submitCancel = () => {
    if (cancelReason.trim().length < 5) {
      Alert.alert('تنبيه', 'يرجى كتابة سبب الإلغاء (5 أحرف على الأقل)');
      return;
    }
    cancelMutation.mutate({ id: cancelModal.bookingId!, reason: cancelReason.trim() });
  };

  const bookings: Booking[] = data || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الحجوزات</Text>
      </View>

      {/* Filter pills */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, statusFilter === f.key && styles.filterPillActive]}
              onPress={() => setStatusFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === f.key && styles.filterPillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const { day, month } = formatDate(item.scheduledDate);
            return (
              <Card style={styles.bookingCard}>
                {/* Top: type badge + booking type */}
                <View style={styles.cardTop}>
                  <Badge status={item.status} label={STATUS_LABELS[item.status] || item.status} />
                  <Text style={styles.typeLabel}>{TYPE_LABELS[item.type] || item.type}</Text>
                </View>

                {/* Property name */}
                <Text style={styles.propertyName} numberOfLines={1}>
                  🏠 {item.property.titleAr}
                </Text>

                {/* Date block */}
                <View style={styles.dateBlock}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateMonth}>{month}</Text>
                  </View>
                  <View style={styles.dateInfo}>
                    <Text style={styles.timeText}>
                      🕐 {item.scheduledTime?.slice(0, 5)}
                    </Text>
                  </View>
                </View>

                {/* Customer row */}
                <View style={styles.customerRow}>
                  <View style={styles.customerLeft}>
                    <Text style={styles.customerIcon}>👤</Text>
                    <Text style={styles.customerName}>
                      {item.customer.firstName} {item.customer.lastName}
                    </Text>
                  </View>
                  <Text style={styles.customerPhone}>{item.customer.phone}</Text>
                </View>

                {/* Notes */}
                {item.message ? (
                  <View style={styles.notesWrap}>
                    <Text style={styles.notesText}>💬 {item.message}</Text>
                  </View>
                ) : null}

                {/* Actions for PENDING */}
                {item.status === 'PENDING' && (
                  <View style={styles.actionsWrap}>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => handleConfirm(item.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.confirmBtnText}>✓ تأكيد الحجز</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(item.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cancelBtnText}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="لا توجد حجوزات"
              subtitle="ستظهر طلبات الحجز من العملاء هنا"
            />
          }
        />
      )}

      {/* Cancel Modal */}
      <Modal
        visible={cancelModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModal({ visible: false, bookingId: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCancelModal({ visible: false, bookingId: null })}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalIcon}>
                <Text style={{ fontSize: 28 }}>❌</Text>
              </View>
              <Text style={styles.modalTitle}>سبب الإلغاء</Text>
              <Text style={styles.modalSubtitle}>
                يرجى توضيح سبب إلغاء الحجز للعميل
              </Text>

              <TextInput
                style={styles.modalInput}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="مثال: تعارض في المواعيد، العقار غير متاح..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
                autoFocus
              />
              <Text style={styles.charCount}>{cancelReason.length}/500</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBackBtn}
                  onPress={() => setCancelModal({ visible: false, bookingId: null })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBackText}>تراجع</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    cancelMutation.isPending && styles.modalConfirmDisabled,
                  ]}
                  onPress={submitCancel}
                  disabled={cancelMutation.isPending}
                  activeOpacity={0.85}
                >
                  {cancelMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>تأكيد الإلغاء</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.dark,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },

  filterWrap: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPillText: { fontSize: 13, fontWeight: '600', color: colors.textSub },
  filterPillTextActive: { color: '#fff' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 120, padding: 16, gap: 12 },

  // Booking card
  bookingCard: { padding: 16 },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  propertyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },

  // Date block
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 12,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 26 },
  dateMonth: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  dateInfo: { flex: 1 },
  timeText: { fontSize: 15, fontWeight: '600', color: colors.text },

  // Customer
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customerIcon: { fontSize: 16 },
  customerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  customerPhone: { fontSize: 13, color: colors.textSub },

  // Notes
  notesWrap: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 8,
  },
  notesText: { fontSize: 13, color: colors.textSub, fontStyle: 'italic', lineHeight: 19 },

  // Action buttons
  actionsWrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  cancelBtnText: { color: colors.error, fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.lg,
  },
  modalIcon: { alignItems: 'center', marginBottom: 12 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSub,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBackBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  modalBackText: { fontSize: 14, fontWeight: '700', color: colors.textSub },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmDisabled: { opacity: 0.6 },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
