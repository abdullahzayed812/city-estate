import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';
import { Avatar } from '../../components/ui';

import { DEFAULT_SERVER_IP, SERVER_IP_KEY } from '../../store/configStore';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'PROPERTY_CARD';
  content: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ChatScreen(): React.ReactElement {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const { chatId, otherUser } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      return (data.data.data as Message[]).reverse();
    },
    enabled: !!chatId && chatId !== 'undefined',
  });

  useEffect(() => {
    if (historyData) setMessages(historyData);
  }, [historyData]);

  // Connect to Socket.IO
  useEffect(() => {
    let socketInstance: Socket;

    const connectSocket = async (): Promise<void> => {
      if (!chatId || chatId === 'undefined') return;
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const ip = await AsyncStorage.getItem(SERVER_IP_KEY) ?? DEFAULT_SERVER_IP;
      socketInstance = io(`http://${ip}:3004`, {
        auth: { token },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        socketInstance.emit('join_chat', { chatId });
      });

      socketInstance.on('new_message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
        flatListRef.current?.scrollToEnd({ animated: true });
      });

      socketInstance.on('user_typing', ({ userId }: { userId: string }) => {
        if (userId !== user?.id) setIsTyping(true);
      });

      socketInstance.on('user_stop_typing', () => {
        setIsTyping(false);
      });

      socketInstance.on('messages_read', () => {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      });

      socketInstance.on('disconnect', () => setConnected(false));

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      socketInstance?.disconnect();
    };
  }, [chatId, user?.id]);

  const sendMessage = useCallback((): void => {
    if (!inputText.trim() || !socket || !connected) return;

    socket.emit('send_message', {
      chatId,
      type: 'TEXT',
      content: inputText.trim(),
    });

    setInputText('');
  }, [inputText, socket, connected, chatId]);

  const handleTyping = (text: string): void => {
    setInputText(text);

    if (socket && connected) {
      socket.emit('typing', { chatId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId });
      }, 1500);
    }
  };

  const otherName = `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim();

  const renderMessage = ({ item }: { item: Message }): React.ReactElement => {
    const isMine = item.senderId === user?.id;

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        {!isMine && (
          <Avatar name={otherName || 'ع'} size={30} fontSize={12} style={styles.msgAvatar} />
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {item.type === 'TEXT' && (
            <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
              {item.content}
            </Text>
          )}
          {item.type === 'IMAGE' && item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
          )}
          <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>
            {new Date(item.createdAt).toLocaleTimeString('ar', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {isMine ? <Text> {item.isRead ? ' ✓✓' : ' ✓'}</Text> : null}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Avatar name={otherName || 'ع'} size={40} fontSize={15} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName}</Text>
          <Text style={[styles.headerStatus, connected && styles.headerStatusOnline]}>
            {connected ? '● متصل الآن' : '● غير متصل'}
          </Text>
        </View>
      </View>

      {/* ── Messages ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>يكتب...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* ── Input bar ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالة..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.sendIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#fff' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerStatus: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  headerStatusOnline: { color: '#4ade80' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Messages list
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 4 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
    gap: 8,
  },
  messageRowMine: {
    flexDirection: 'row-reverse',
  },
  msgAvatar: { marginBottom: 2 },

  // Bubbles
  bubble: {
    maxWidth: '74%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOther: {
    backgroundColor: colors.bgCard,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  messageTextMine: { color: '#fff' },
  messageImage: { width: 220, height: 165, borderRadius: 10 },
  messageTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 5,
    textAlign: 'right',
  },
  messageTimeMine: { color: 'rgba(255,255,255,0.65)' },

  // Typing
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingText: { fontSize: 13, color: colors.textSub, fontStyle: 'italic' },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { fontSize: 20 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.bg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.blue,
  },
  sendBtnDisabled: { opacity: 0.4, ...({} as any) },
  sendIcon: { fontSize: 16, color: '#fff', marginRight: 1 },
});
