import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Avatar, EmptyState, Skeleton } from '../../components/ui';
import type { Chat } from '../../types';
import { formatChatTime } from '../../lib/date';

export default function ChatListPage() {
  const navigate = useNavigate();

  const { data: chats, isLoading } = useQuery<Chat[]>({
    queryKey: ['broker', 'chats'],
    queryFn: async () => {
      const { data } = await api.get('/chats');
      return data.data;
    },
    refetchInterval: 15000,
  });

  const totalUnread = chats?.reduce((s, c) => s + c.brokerUnread, 0) ?? 0;

  return (
    <div className="min-h-screen bg-bg-card flex flex-col" dir="rtl">
      <div className="bg-dark sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-white font-black text-xl">المحادثات</h1>
          {totalUnread > 0 && (
            <div className="min-w-[26px] h-6 px-2 rounded-full bg-error flex items-center justify-center">
              <span className="text-white text-xs font-black">{totalUnread}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full flex-1">
        {isLoading ? (
          <div className="space-y-1 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center p-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : !chats?.length ? (
          <EmptyState icon="💬" title="لا توجد محادثات" subtitle="ستظهر محادثات العملاء هنا عندما يتواصلون معك" />
        ) : (
          <div>
            {chats.map((chat, i) => {
              const name = `${chat.otherUser.firstName} ${chat.otherUser.lastName}`;
              const hasUnread = chat.brokerUnread > 0;
              return (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/chat/${chat.id}`, { state: { otherUser: chat.otherUser } })}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg transition-colors border-b border-bg text-right"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={name} size={52} />
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-error flex items-center justify-center border-2 border-bg-card">
                        <span className="text-white text-xs font-black leading-none">{chat.brokerUnread}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-bold ${hasUnread ? 'text-text-main' : 'text-text-main'}`}>{name}</span>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {formatChatTime(chat.lastMessage?.createdAt ?? null)}
                      </span>
                    </div>
                    {chat.propertyTitleAr && (
                      <p className="text-xs text-text-sub mb-0.5 truncate">🏠 {chat.propertyTitleAr}</p>
                    )}
                    <p className={`text-sm truncate ${hasUnread ? 'text-text-main font-semibold' : 'text-text-muted'}`}>
                      {chat.lastMessage?.content || '—'}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
