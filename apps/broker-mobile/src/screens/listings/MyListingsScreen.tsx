import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors, radius, shadow } from '../../theme';
import { Card, Badge, EmptyState } from '../../components/ui';

type Status = 'ALL' | 'ACTIVE' | 'PENDING' | 'DRAFT';

const FILTERS: { key: Status; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'ACTIVE', label: 'نشط' },
  { key: 'PENDING', label: 'قيد المراجعة' },
  { key: 'DRAFT', label: 'مسودة' },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  PENDING: 'قيد المراجعة',
  DRAFT: 'مسودة',
  SOLD: 'مبيع',
  RENTED: 'مؤجر',
  SUSPENDED: 'موقوف',
  REJECTED: 'مرفوض',
};

const STATUS_LEFT_BORDER: Record<string, string> = {
  ACTIVE: colors.success,
  PENDING: colors.warning,
  DRAFT: colors.textMuted,
  SOLD: colors.primary,
  RENTED: colors.purple,
  REJECTED: colors.error,
  SUSPENDED: colors.textMuted,
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  STUDIO: 'استوديو',
  WAREHOUSE: 'مخزن',
  FACTORY: 'مصنع',
};

interface Property {
  id: string;
  titleAr: string;
  type: string;
  listingType: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
}

export default function MyListingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Status>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'listings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/properties/broker/my-properties?${params}`);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] }),
  });

  const handleDelete = (id: string, title: string) => {
    Alert.alert('حذف العقار', `هل تريد حذف "${title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const properties: Property[] = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>عقاراتي</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProperty')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
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
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const borderColor = STATUS_LEFT_BORDER[item.status] ?? colors.textMuted;
            return (
              <Card style={[styles.card, { borderLeftColor: borderColor }]}>
                {/* Top row: type label + status badge */}
                <View style={styles.cardTop}>
                  <Text style={styles.propertyType}>{TYPE_LABELS[item.type] || item.type}</Text>
                  <Badge status={item.status} label={STATUS_LABELS[item.status] || item.status} />
                </View>

                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {item.titleAr}
                </Text>

                <Text style={styles.propertyPrice}>
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: item.currency,
                    maximumFractionDigits: 0,
                  }).format(item.price)}
                </Text>

                <Text style={styles.propertyArea}>المساحة: {item.area} م²</Text>

                {/* Views & favorites row */}
                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipText}>👁 {item.viewsCount.toLocaleString('ar-EG')}</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipText}>❤️ {item.favoritesCount}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('AddProperty', { propertyId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editBtnText}>✏️ تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.titleAr)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnText}>🗑 حذف</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="🏠"
              title="لا توجد عقارات"
              subtitle="ابدأ بإضافة عقارك الأول لجذب العملاء"
              buttonLabel="+ أضف عقارك الأول"
              onButtonPress={() => navigation.navigate('AddProperty')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.dark,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Filter
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
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: { fontSize: 13, fontWeight: '600', color: colors.textSub },
  filterPillTextActive: { color: '#fff' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { paddingBottom: 120, padding: 16, gap: 12 },

  // Card
  card: {
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: radius.lg,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyType: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  propertyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  propertyPrice: { fontSize: 20, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  propertyArea: { fontSize: 13, color: colors.textSub, marginBottom: 12 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statChip: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statChipText: { fontSize: 12, color: colors.textSub, fontWeight: '500' },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29,78,216,0.2)',
  },
  editBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    flex: 1,
    backgroundColor: colors.errorLight,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.15)',
  },
  deleteBtnText: { color: colors.error, fontWeight: '700', fontSize: 13 },
});
