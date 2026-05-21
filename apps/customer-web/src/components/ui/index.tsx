import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] ?? '?').toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const bg = getAvatarColor(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      className={clsx('flex items-center justify-center rounded-full font-bold text-white flex-shrink-0', className)}
      style={{ width: size, height: size, backgroundColor: bg, fontSize }}
    >
      {initials}
    </div>
  );
}

export function Badge({ status, label, className }: { status: string; label: string; className?: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-success-light text-success border border-green-200',
    PENDING: 'bg-warning-light text-warning border border-amber-200',
    CONFIRMED: 'bg-success-light text-success border border-green-200',
    COMPLETED: 'bg-primary-light text-primary border border-blue-200',
    CANCELLED: 'bg-error-light text-error border border-red-200',
    NO_SHOW: 'bg-gray-100 text-gray-500 border border-gray-200',
  };
  const style = styles[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200';
  return <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', style, className)}>{label}</span>;
}

export function Card({ children, className, onClick, hover }: { children: React.ReactNode; className?: string; onClick?: () => void; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={clsx('bg-white rounded-xl shadow-card border border-gray-100', onClick && 'cursor-pointer', className)}
    >
      {children}
    </motion.div>
  );
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-dark text-white hover:bg-slate-800',
    secondary: 'bg-primary text-white hover:bg-blue-700 shadow-blue',
    danger: 'bg-error text-white hover:bg-red-700',
    outline: 'bg-white text-dark border-2 border-dark hover:bg-gray-50',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-3 text-sm', lg: 'px-7 py-4 text-base' };
  return (
    <button {...props} disabled={disabled || loading} className={clsx(base, variants[variant], sizes[size], className)}>
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={clsx('animate-spin', className)} style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl', className)} />;
}

export function EmptyState({ icon, title, subtitle, action }: {
  icon: string; title: string; subtitle?: string; action?: { label: string; onClick: () => void };
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-text-sub leading-relaxed mb-6 max-w-xs">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="px-6 py-3 rounded-xl bg-dark text-white font-bold text-sm hover:bg-slate-800 transition-colors">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-lg font-bold text-dark mb-4">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  );
}
