import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Card, Skeleton, SectionHeader } from '../../components/ui';
import type { BrokerStats } from '../../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء النور';
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      totalProperties: 0, activeProperties: 0, totalViews: 0,
      pendingBookings: 0, totalBookings: 0, profileCompletion: 0,
      rating: 0, totalDeals: 0,
    },
  });

  const completion = stats?.profileCompletion ?? 0;

  const statItems = [
    { label: 'العقارات النشطة', value: stats?.activeProperties ?? 0, icon: '🏠', color: 'text-primary', bg: 'bg-primary-light', border: 'border-l-primary' },
    { label: 'المشاهدات', value: stats?.totalViews ?? 0, icon: '👁', color: 'text-success', bg: 'bg-success-light', border: 'border-l-success' },
    { label: 'حجوزات معلقة', value: stats?.pendingBookings ?? 0, icon: '📅', color: 'text-warning', bg: 'bg-warning-light', border: 'border-l-warning' },
    { label: 'إجمالي الصفقات', value: stats?.totalDeals ?? 0, icon: '🤝', color: 'text-purple', bg: 'bg-purple-light', border: 'border-l-purple' },
  ];

  const quickActions = [
    { label: 'إضافة عقار', icon: '➕', bg: 'bg-primary-light', color: 'text-primary', to: '/listings/new' },
    { label: 'المحادثات', icon: '💬', bg: 'bg-success-light', color: 'text-success', to: '/chat' },
    { label: 'الحجوزات', icon: '📅', bg: 'bg-warning-light', color: 'text-warning', to: '/bookings' },
    { label: 'عقاراتي', icon: '🏘', bg: 'bg-purple-light', color: 'text-purple', to: '/listings' },
  ];

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Header */}
      <div className="bg-dark sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white/50 text-xs">{getGreeting()}،</p>
            <h1 className="text-white font-black text-lg leading-tight">
              {user?.firstName} {user?.lastName}
            </h1>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/12 transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-dark" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-lg p-5 shadow-blue grid grid-cols-3 gap-4"
        >
          {[
            { emoji: '⭐', value: Number(stats?.rating ?? 0).toFixed(1), label: 'التقييم' },
            { emoji: '🤝', value: stats?.totalDeals ?? 0, label: 'صفقة مكتملة' },
            { emoji: '🏠', value: stats?.totalProperties ?? 0, label: 'إجمالي العقارات' },
          ].map((b) => (
            <div key={b.label} className="text-center">
              <div className="text-2xl mb-1">{b.emoji}</div>
              <div className="text-white font-black text-xl">{b.value}</div>
              <div className="text-white/65 text-xs mt-0.5">{b.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <div>
          <SectionHeader title="الإحصائيات" />
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {statItems.map((s) =>
              isLoading ? (
                <Skeleton key={s.label} className="h-28" />
              ) : (
                <motion.div key={s.label} variants={fadeUp}>
                  <Card className={`p-4 border-l-4 ${s.border} ${s.bg}`}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className={`text-2xl font-black ${s.color}`}>
                      {s.value.toLocaleString('ar-EG')}
                    </div>
                    <div className="text-text-sub text-xs mt-1">{s.label}</div>
                  </Card>
                </motion.div>
              ),
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <SectionHeader title="إجراءات سريعة" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover
                  onClick={() => navigate(a.to)}
                  className="p-5 flex flex-col items-center gap-3"
                >
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center ${a.bg}`}>
                    <span className="text-2xl">{a.icon}</span>
                  </div>
                  <span className={`text-sm font-bold ${a.color}`}>{a.label}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile completion */}
        <div>
          <SectionHeader title="اكتمال الملف الشخصي" />
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-3xl font-black text-primary">{completion}%</span>
                <p className="text-text-sub text-xs mt-0.5">اكتمال الملف</p>
              </div>
              {completion < 80 && (
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm font-bold text-primary bg-primary-light rounded-md border border-primary/20 hover:bg-blue-100 transition-colors"
                >
                  اكمل ملفك
                </button>
              )}
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${completion >= 80 ? 'bg-success' : 'bg-primary'}`}
              />
            </div>
            <p className="text-text-muted text-xs mt-2">أكمل ملفك لزيادة ظهورك للعملاء</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
