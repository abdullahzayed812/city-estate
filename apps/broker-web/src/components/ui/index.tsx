import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// ── Avatar ──────────────────────────────────────────────────────────────────
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

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}
export function Avatar({ name, size = 40, className }: AvatarProps) {
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

// ── Badge ────────────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, string> = {
  ACTIVE: 'bg-success-light text-success border border-green-200',
  PENDING: 'bg-warning-light text-warning border border-amber-200',
  DRAFT: 'bg-gray-100 text-gray-500 border border-gray-200',
  SOLD: 'bg-primary-light text-primary border border-blue-200',
  RENTED: 'bg-purple-light text-purple border border-purple-200',
  REJECTED: 'bg-error-light text-error border border-red-200',
  SUSPENDED: 'bg-gray-100 text-gray-500 border border-gray-200',
  CONFIRMED: 'bg-success-light text-success border border-green-200',
  COMPLETED: 'bg-primary-light text-primary border border-blue-200',
  CANCELLED: 'bg-error-light text-error border border-red-200',
  NO_SHOW: 'bg-gray-100 text-gray-500 border border-gray-200',
};

interface BadgeProps {
  status: string;
  label: string;
  className?: string;
}
export function Badge({ status, label, className }: BadgeProps) {
  const style = BADGE_STYLES[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200';
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', style, className)}>
      {label}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}
export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={clsx(
        'bg-bg-card rounded-lg shadow-card border border-gray-100',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-blue',
    secondary: 'bg-transparent text-white border-2 border-white/20 hover:bg-white/10',
    danger: 'bg-error-light text-error border border-red-200 hover:bg-red-100',
    ghost: 'bg-transparent text-text-sub hover:bg-gray-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={clsx('animate-spin', className)}
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}
export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-semibold text-gray-200">{label}</label>}
      <input
        {...props}
        className={clsx(
          'w-full px-4 py-3 rounded-md bg-white/8 border text-white placeholder-white/35 text-sm outline-none transition-all',
          error ? 'border-red-400 focus:border-red-400' : 'border-white/15 focus:border-primary',
          className,
        )}
      />
      {hint && <p className="text-xs text-white/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-semibold text-text-sub">{label}</label>}
      <textarea
        {...props}
        className={clsx(
          'w-full px-4 py-3 rounded-md bg-bg border text-text-main placeholder-text-muted text-sm outline-none resize-none transition-all',
          error ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-primary',
          className,
        )}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}
export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-text-muted leading-relaxed mb-6">{subtitle}</p>}
      {action && (
        <Button onClick={action.onClick} size="md">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg', className)} />
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-text-main">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-bg-card rounded-xl shadow-lg w-full max-w-md p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-bold text-text-main mb-1">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}
export function Toast({ message, type = 'info' }: ToastProps) {
  const styles = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-dark text-white',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={clsx('fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm font-semibold shadow-lg z-50', styles[type])}
    >
      {message}
    </motion.div>
  );
}
