import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Spinner } from '../../components/ui';
import { formatMessageTime } from '../../lib/date';
import type { Message } from '../../types';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tokens } = useAuthStore();
  const otherUser = (location.state as any)?.otherUser;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      return (data.data.data as Message[]).reverse();
    },
    enabled: !!chatId,
  });

  useEffect(() => {
    if (historyData) setMessages(historyData);
  }, [historyData]);

  useEffect(() => {
    if (!chatId || !tokens?.accessToken) return;
    const s = io(import.meta.env.VITE_SOCKET_URL as string, {
      auth: { token: tokens.accessToken },
      transports: ['websocket'],
    });

    s.on('connect', () => { setConnected(true); s.emit('join_chat', { chatId }); });
    s.on('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    s.on('user_typing', ({ userId }: { userId: string }) => { if (userId !== user?.id) setIsTyping(true); });
    s.on('user_stop_typing', () => setIsTyping(false));
    s.on('messages_read', () => setMessages((prev) => prev.map((m) => ({ ...m, isRead: true }))));
    s.on('disconnect', () => setConnected(false));

    setSocket(s);
    return () => { s.disconnect(); };
  }, [chatId, tokens?.accessToken, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !socket || !connected) return;
    socket.emit('send_message', { chatId, type: 'TEXT', content: input.trim() });
    setInput('');
    inputRef.current?.focus();
  }, [input, socket, connected, chatId]);

  const handleInput = (val: string) => {
    setInput(val);
    if (socket && connected) {
      socket.emit('typing', { chatId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('stop_typing', { chatId }), 1500);
    }
  };

  const otherName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'محادثة';

  return (
    <div className="h-screen flex flex-col bg-bg" dir="rtl">
      {/* Header */}
      <div className="bg-dark flex items-center gap-3 px-4 py-3 flex-shrink-0 shadow-md">
        <button onClick={() => navigate('/chat')} className="text-white/60 hover:text-white text-xl transition-colors p-1">←</button>
        <Avatar name={otherName} size={40} />
        <div className="flex-1">
          <p className="text-white font-bold text-sm">{otherName}</p>
          <p className={`text-xs ${connected ? 'text-green-400' : 'text-text-muted'}`}>
            {connected ? '● متصل الآن' : '● غير متصل'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size={28} className="text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-text-sub text-sm">لا توجد رسائل بعد</p>
            <p className="text-text-muted text-xs mt-1">ابدأ المحادثة الآن</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && <Avatar name={otherName} size={28} className="mb-1 flex-shrink-0" />}
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? 'bg-primary text-white rounded-bl-sm'
                      : 'bg-bg-card text-text-main rounded-br-sm border border-border shadow-sm'
                  }`}
                >
                  {msg.type === 'TEXT' && (
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  )}
                  {msg.type === 'IMAGE' && msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="" className="max-w-[220px] rounded-lg" />
                  )}
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/60 text-left' : 'text-text-muted'}`}>
                    {formatMessageTime(msg.createdAt)}
                    {isMine && <span className="mr-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                  </p>
                </motion.div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-end gap-2">
            <Avatar name={otherName} size={28} className="mb-1" />
            <div className="bg-bg-card border border-border rounded-2xl rounded-br-sm px-4 py-2.5">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-text-muted"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-bg-card border-t border-border px-3 py-2.5 flex items-end gap-2 flex-shrink-0">
        <button className="w-10 h-10 rounded-full bg-bg flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors">
          <span className="text-xl">📎</span>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-bg border border-border rounded-3xl px-4 py-2.5 text-sm text-text-main placeholder-text-muted outline-none focus:border-primary transition-colors min-h-[44px]"
          maxLength={2000}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-blue hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-white text-base">▶</span>
        </motion.button>
      </div>
    </div>
  );
}
