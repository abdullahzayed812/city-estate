import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';
import { Avatar, Card, SectionHeader } from '../../components/ui';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء النور';
}

interface BrokerStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  pendingBookings: number;
  totalBookings: number;
  profileCompletion: number;
  rating: number;
  totalDeals: number;
}

export default function BrokerDashboard(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      totalProperties: 0,
      activeProperties: 0,
      totalViews: 0,
      pendingBookings: 0,
      totalBookings: 0,
      profileCompletion: 0,
      rating: 0,
      totalDeals: 0,
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['broker', 'stats'] });
    setRefreshing(false);
  }, [queryClient]);

  const statItems = [
    {
      label: 'العقارات النشطة',
      value: stats?.activeProperties ?? 0,
      icon: '🏠',
      color: colors.primary,
      bg: colors.primaryLight,
      borderColor: colors.primary,
    },
    {
      label: 'المشاهدات',
      value: stats?.totalViews ?? 0,
      icon: '👁',
      color: colors.success,
      bg: colors.successLight,
      borderColor: colors.success,
    },
    {
      label: 'حجوزات معلقة',
      value: stats?.pendingBookings ?? 0,
      icon: '📅',
      color: colors.warning,
      bg: colors.warningLight,
      borderColor: colors.warning,
    },
    {
      label: 'إجمالي الصفقات',
      value: stats?.totalDeals ?? 0,
      icon: '🤝',
      color: colors.purple,
      bg: colors.purpleLight,
      borderColor: colors.purple,
    },
  ];

  const quickActions = [
    {
      label: 'إضافة عقار',
      icon: '➕',
      bg: colors.primaryLight,
      color: colors.primary,
      onPress: () => navigation.navigate('listings', { screen: 'AddProperty' }),
    },
    {
      label: 'المحادثات',
      icon: '💬',
      bg: colors.successLight,
      color: colors.success,
      onPress: () => navigation.navigate('chat'),
    },
    {
      label: 'الحجوزات',
      icon: '📅',
      bg: colors.warningLight,
      color: colors.warning,
      onPress: () => navigation.navigate('bookings'),
    },
    {
      label: 'عقاراتي',
      icon: '🏘',
      bg: colors.purpleLight,
      color: colors.purple,
      onPress: () => navigation.navigate('listings'),
    },
  ];

  const completion = stats?.profileCompletion ?? 0;
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Avatar name={userName || 'و ع'} size={50} fontSize={18} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}،</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Blue banner: rating / deals / total ── */}
        <View style={styles.bannerWrap}>
          <View style={styles.banner}>
            <View style={styles.bannerItem}>
              <Text style={styles.bannerEmoji}>⭐</Text>
              <Text style={styles.bannerValue}>{Number(stats?.rating ?? 0).toFixed(1)}</Text>
              <Text style={styles.bannerLabel}>التقييم</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerItem}>
              <Text style={styles.bannerEmoji}>🤝</Text>
              <Text style={styles.bannerValue}>{stats?.totalDeals ?? 0}</Text>
              <Text style={styles.bannerLabel}>صفقة مكتملة</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerItem}>
              <Text style={styles.bannerEmoji}>🏠</Text>
              <Text style={styles.bannerValue}>{stats?.totalProperties ?? 0}</Text>
              <Text style={styles.bannerLabel}>إجمالي العقارات</Text>
            </View>
          </View>
        </View>

        {/* ── Stats 2×2 grid ── */}
        <View style={styles.section}>
          <SectionHeader title="الإحصائيات" />
          <View style={styles.statsGrid}>
            {statItems.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: stat.bg, borderLeftColor: stat.borderColor },
                ]}
              >
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value.toLocaleString('ar-EG')}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Actions 2×2 grid ── */}
        <View style={styles.section}>
          <SectionHeader title="إجراءات سريعة" />
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Profile completion ── */}
        <View style={styles.section}>
          <SectionHeader title="اكتمال الملف الشخصي" />
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <Text style={styles.progressPercent}>{completion}%</Text>
                <Text style={styles.progressHint}>اكتمال الملف</Text>
              </View>
              <View style={styles.progressRight}>
                {completion < 80 && (
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => navigation.navigate('profile')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeBtnText}>اكمل ملفك</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completion}%` as any,
                    backgroundColor: completion >= 80 ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressNote}>أكمل ملفك لزيادة ظهورك للعملاء</Text>
          </Card>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { flexGrow: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 12, color: colors.textMuted },
  userName: { fontSize: 17, fontWeight: '800', color: '#fff', marginTop: 1 },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 22 },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.dark,
  },

  // Banner
  bannerWrap: { paddingHorizontal: 20, marginTop: 20 },
  banner: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...shadow.blue,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerEmoji: { fontSize: 20, marginBottom: 4 },
  bannerValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bannerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  bannerDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Section
  section: { paddingHorizontal: 20, marginTop: 24 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    padding: 18,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    ...shadow.sm,
  },
  statIcon: { fontSize: 28, marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, color: colors.textSub, marginTop: 3 },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...shadow.md,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },

  // Progress card
  progressCard: { padding: 18 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressLeft: {},
  progressRight: {},
  progressPercent: { fontSize: 28, fontWeight: '800', color: colors.primary },
  progressHint: { fontSize: 12, color: colors.textSub, marginTop: 1 },
  completeBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  completeBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  progressTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  progressNote: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
});
