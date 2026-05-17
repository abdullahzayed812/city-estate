import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors, radius, shadow } from '../../theme';
import { Avatar, EmptyState } from '../../components/ui';

interface Chat {
  id: string;
  propertyId: string | null;
  propertyTitleAr: string | null;
  otherUser: { firstName: string; lastName: string; avatarUrl: string | null };
  lastMessage: { content: string | null; createdAt: string } | null;
  brokerUnread: number;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'أمس';
  return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function BrokerChatListScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  const { data: chats, isLoading } = useQuery<Chat[]>({
    queryKey: ['broker', 'chats'],
    queryFn: async () => {
      const { data } = await api.get('/chats');
      return data.data;
    },
  });

  const totalUnread = chats?.reduce((sum, c) => sum + c.brokerUnread, 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>المحادثات</Text>
        {totalUnread > 0 && (
          <View style={styles.totalUnreadBadge}>
            <Text style={styles.totalUnreadText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const name = `${item.otherUser.firstName} ${item.otherUser.lastName}`;
            return (
              <TouchableOpacity
                style={styles.chatRow}
                onPress={() =>
                  navigation.navigate('Chat', {
                    chatId: item.id,
                    otherUser: item.otherUser,
                  })
                }
                activeOpacity={0.7}
              >
                {/* Avatar with unread dot */}
                <View style={styles.avatarWrap}>
                  <Avatar name={name} size={52} fontSize={18} />
                  {item.brokerUnread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.brokerUnread}</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.chatInfo}>
                  <View style={styles.topRow}>
                    <Text style={styles.chatName}>{name}</Text>
                    <Text style={styles.chatTime}>
                      {formatTime(item.lastMessage?.createdAt ?? null)}
                    </Text>
                  </View>
                  {item.propertyTitleAr ? (
                    <Text style={styles.propertyLabel} numberOfLines={1}>
                      🏠 {item.propertyTitleAr}
                    </Text>
                  ) : null}
                  <Text
                    style={[styles.lastMsg, item.brokerUnread > 0 && styles.lastMsgUnread]}
                    numberOfLines={1}
                  >
                    {item.lastMessage?.content || '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="💬"
              title="لا توجد محادثات"
              subtitle="ستظهر محادثات العملاء هنا عندما يتواصلون معك"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCard },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.dark,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  totalUnreadBadge: {
    backgroundColor: colors.error,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  totalUnreadText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: colors.bgCard,
  },

  avatarWrap: { position: 'relative' },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    left: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  chatInfo: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  chatName: { fontSize: 15, fontWeight: '700', color: colors.text },
  chatTime: { fontSize: 12, color: colors.textMuted },
  propertyLabel: { fontSize: 12, color: colors.textSub, marginBottom: 3 },
  lastMsg: { fontSize: 13, color: colors.textMuted },
  lastMsgUnread: { color: colors.text, fontWeight: '600' },

  separator: {
    height: 1,
    backgroundColor: colors.bg,
    marginHorizontal: 20,
  },
});
