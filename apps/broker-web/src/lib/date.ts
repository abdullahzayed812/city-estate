const AR = 'ar-EG';

function parseLocalDate(d: string): Date {
  if (d.includes('T') || d.includes('Z')) return new Date(d);
  return new Date(`${d}T00:00:00`);
}

function safeDate(d: string): Date | null {
  const date = parseLocalDate(d);
  return isNaN(date.getTime()) ? null : date;
}

export function formatBookingDate(dateStr: string): string {
  const d = safeDate(dateStr);
  if (!d) return dateStr;
  return new Intl.DateTimeFormat(AR, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export function formatBookingCalendar(dateStr: string): { day: string; month: string; weekday: string } {
  const d = safeDate(dateStr);
  if (!d) return { day: '--', month: '--', weekday: '--' };
  const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(AR, opts).format(d);
  return { day: fmt({ day: 'numeric' }), month: fmt({ month: 'short' }), weekday: fmt({ weekday: 'short' }) };
}

export function formatBookingTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(AR, { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
}

export function formatChatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `${diffMins} د`;
  if (diffHours < 24) return new Intl.DateTimeFormat(AR, { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return new Intl.DateTimeFormat(AR, { weekday: 'long' }).format(date);
  return new Intl.DateTimeFormat(AR, { day: 'numeric', month: 'short' }).format(date);
}

export function formatMessageTime(dateStr: string): string {
  return new Intl.DateTimeFormat(AR, { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dateStr));
}
