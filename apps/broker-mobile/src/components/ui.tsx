import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { colors, radius, shadow } from '../theme';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ children, style }: CardProps): React.ReactElement {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_MAP: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: colors.successLight, text: '#065f46' },
  نشط: { bg: colors.successLight, text: '#065f46' },
  PENDING: { bg: colors.warningLight, text: '#92400e' },
  معلق: { bg: colors.warningLight, text: '#92400e' },
  'معلّق': { bg: colors.warningLight, text: '#92400e' },
  DRAFT: { bg: '#f1f5f9', text: '#475569' },
  مسودة: { bg: '#f1f5f9', text: '#475569' },
  SOLD: { bg: colors.primaryLight, text: '#1e40af' },
  مباع: { bg: colors.primaryLight, text: '#1e40af' },
  CONFIRMED: { bg: colors.successLight, text: '#065f46' },
  مؤكد: { bg: colors.successLight, text: '#065f46' },
  COMPLETED: { bg: '#f1f5f9', text: '#475569' },
  مكتمل: { bg: '#f1f5f9', text: '#475569' },
  CANCELLED: { bg: colors.errorLight, text: '#991b1b' },
  ملغي: { bg: colors.errorLight, text: '#991b1b' },
  REJECTED: { bg: colors.errorLight, text: '#991b1b' },
  مرفوض: { bg: colors.errorLight, text: '#991b1b' },
  RENTED: { bg: colors.purpleLight, text: '#6d28d9' },
  مؤجر: { bg: colors.purpleLight, text: '#6d28d9' },
  SUSPENDED: { bg: '#f1f5f9', text: '#475569' },
  موقوف: { bg: '#f1f5f9', text: '#475569' },
};

interface BadgeProps {
  status: string;
  label?: string;
}

export function Badge({ status, label }: BadgeProps): React.ReactElement {
  const colors_map = BADGE_MAP[status] ?? { bg: '#f1f5f9', text: '#475569' };
  return (
    <View style={[styles.badge, { backgroundColor: colors_map.bg }]}>
      <Text style={[styles.badgeText, { color: colors_map.text }]}>{label ?? status}</Text>
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────
interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function SecondaryButton({
  label,
  onPress,
  style,
}: SecondaryButtonProps): React.ReactElement {
  return (
    <TouchableOpacity style={[styles.secondaryBtn, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── TextInputField ───────────────────────────────────────────────────────────
interface TextInputFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function TextInputField({
  label,
  containerStyle,
  style,
  ...rest
}: TextInputFieldProps): React.ReactElement {
  return (
    <View style={[{ marginBottom: 0 }, containerStyle]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.textInput, style as TextStyle]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  rightText?: string;
  onRightPress?: () => void;
}

export function SectionHeader({
  title,
  rightText,
  onRightPress,
}: SectionHeaderProps): React.ReactElement {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {rightText ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.sectionHeaderRight}>{rightText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  buttonLabel,
  onButtonPress,
}: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyIcon}>{icon}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {buttonLabel && onButtonPress ? (
        <PrimaryButton
          label={buttonLabel}
          onPress={onButtonPress}
          style={styles.emptyButton}
        />
      ) : null}
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: number;
  fontSize?: number;
  style?: ViewStyle;
}

export function Avatar({ name, size = 48, fontSize = 16, style }: AvatarProps): React.ReactElement {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const bg = getAvatarColor(name);
  return (
    <View
      style={[
        styles.avatarBase,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.avatarInitials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  accentColor?: string;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  value,
  label,
  accentColor = colors.primary,
  style,
}: StatCardProps): React.ReactElement {
  return (
    <View style={[styles.statCard, style]}>
      <Text style={styles.statCardIcon}>{icon}</Text>
      <Text style={[styles.statCardValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    ...shadow.md,
  },

  // Badge
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // PrimaryButton
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // SecondaryButton
  secondaryBtn: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  // TextInputField
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSub,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bgCard,
  },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  sectionHeaderRight: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // EmptyState
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
    alignSelf: 'stretch',
  },

  // Avatar
  avatarBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '800',
  },

  // StatCard
  statCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'flex-start',
    ...shadow.sm,
  },
  statCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 3,
  },
});
