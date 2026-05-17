import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useConfigStore } from '../../store/configStore';
import { colors, radius, shadow } from '../../theme';
import { Avatar, Card, SectionHeader } from '../../components/ui';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  danger?: boolean;
}

interface BrokerStats {
  activeProperties: number;
  totalViews: number;
  totalBookings: number;
  totalDeals: number;
  rating: number;
  profileCompletion: number;
}

export default function BrokerProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { serverIp } = useConfigStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: stats } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      activeProperties: 0,
      totalViews: 0,
      totalBookings: 0,
      totalDeals: 0,
      rating: 0,
      profileCompletion: 0,
    },
  });

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تسجيل الخروج', style: 'destructive', onPress: logout },
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'حسابي',
      items: [
        { icon: '✏️', label: 'تعديل الملف الشخصي', onPress: () => Alert.alert('قريباً') },
        { icon: '📋', label: 'الوثائق والترخيص', onPress: () => Alert.alert('قريباً') },
        { icon: '⭐', label: 'التقييمات والمراجعات', onPress: () => Alert.alert('قريباً') },
        { icon: '💳', label: 'الاشتراك والباقات', onPress: () => Alert.alert('قريباً') },
      ],
    },
    {
      title: 'الإعدادات',
      items: [
        {
          icon: '🔔',
          label: 'الإشعارات',
          onPress: () => {},
          isSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: '🌐',
          label: 'اللغة',
          onPress: () => Alert.alert('قريباً'),
          value: 'العربية',
        },
        {
          icon: '🖥️',
          label: 'إعدادات الخادم',
          onPress: () => navigation.navigate('ServerConfig'),
          value: serverIp,
        },
      ],
    },
    {
      title: 'المساعدة',
      items: [
        {
          icon: '📞',
          label: 'الدعم الفني',
          onPress: () => Alert.alert('الدعم', 'هاتف: +201000000001'),
        },
        { icon: '📄', label: 'شروط الاستخدام', onPress: () => Alert.alert('قريباً') },
        { icon: '🔒', label: 'سياسة الخصوصية', onPress: () => Alert.alert('قريباً') },
      ],
    },
  ];

  const completion = stats?.profileCompletion ?? 0;
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const statChips = [
    { label: 'عقارات نشطة', value: stats?.activeProperties ?? 0, color: colors.primary },
    {
      label: 'مشاهدات',
      value: (stats?.totalViews ?? 0).toLocaleString('ar-EG'),
      color: colors.success,
    },
    { label: 'حجوزات', value: stats?.totalBookings ?? 0, color: colors.warning },
    { label: 'صفقات', value: stats?.totalDeals ?? 0, color: colors.purple },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Avatar name={userName || 'و ع'} size={92} fontSize={34} />
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.brokerBadge}>
              <Text style={styles.brokerBadgeText}>وكيل معتمد</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>
                ⭐ {Number(stats?.rating ?? 0).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stats strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsStrip}
          style={styles.statsScrollView}
        >
          {statChips.map((chip, idx) => (
            <View key={chip.label} style={styles.statChip}>
              <Text style={[styles.statChipValue, { color: chip.color }]}>{chip.value}</Text>
              <Text style={styles.statChipLabel}>{chip.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Profile completion ── */}
        <View style={styles.sectionWrap}>
          <Card style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>اكتمال الملف</Text>
              <Text style={styles.completionPercent}>{completion}%</Text>
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
            <Text style={styles.completionHint}>أكمل ملفك لزيادة ظهورك للعملاء</Text>
          </Card>
        </View>

        {/* ── Menu sections ── */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionWrap}>
            <SectionHeader title={section.title} />
            <Card style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[
                    styles.menuRow,
                    iIdx < section.items.length - 1 && styles.menuRowBorder,
                    item.danger && styles.menuRowDanger,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.isSwitch ? 1 : 0.7}
                >
                  <View style={[styles.menuIconWrap, item.danger && styles.menuIconWrapDanger]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                  <View style={styles.menuRight}>
                    {item.isSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <>
                        {item.value ? (
                          <Text style={styles.menuValue}>{item.value}</Text>
                        ) : null}
                        <Text style={styles.chevron}>›</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* ── Logout row ── */}
        <View style={styles.sectionWrap}>
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={[styles.menuRow, styles.logoutRow]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrapDanger}>
                <Text style={styles.menuIcon}>🚪</Text>
              </View>
              <Text style={[styles.menuLabel, styles.logoutLabel]}>تسجيل الخروج</Text>
              <Text style={[styles.chevron, { color: colors.error }]}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <Text style={styles.versionText}>وكيل عقاري v1.0.0</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Profile header
  profileHeader: {
    backgroundColor: colors.dark,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.dark,
  },
  cameraIcon: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  brokerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  brokerBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ratingBadge: {
    backgroundColor: 'rgba(251,191,36,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  ratingBadgeText: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },

  // Stats strip
  statsScrollView: { marginTop: 16 },
  statsStrip: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  statChip: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    minWidth: 90,
    ...shadow.sm,
  },
  statChipValue: { fontSize: 22, fontWeight: '800' },
  statChipLabel: { fontSize: 11, color: colors.textSub, marginTop: 3, fontWeight: '500' },

  // Section wrapper
  sectionWrap: { paddingHorizontal: 16, paddingTop: 16 },

  // Completion card
  completionCard: { padding: 16 },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  completionPercent: { fontSize: 20, fontWeight: '800', color: colors.primary },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  completionHint: { fontSize: 12, color: colors.textMuted, marginTop: 8 },

  // Menu card
  menuCard: { overflow: 'hidden', padding: 0 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.bg },
  menuRowDanger: {},
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapDanger: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  menuLabelDanger: { color: colors.error },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, color: colors.textMuted },
  chevron: { fontSize: 20, color: colors.textMuted, fontWeight: '400' },

  // Logout
  logoutRow: {},
  logoutLabel: { color: colors.error, fontWeight: '700' },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 20,
  },
});
