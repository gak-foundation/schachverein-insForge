'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertCircle, Wallet, Trophy, Calendar, Mail, Users, type LucideIcon } from 'lucide-react';
import type { AttentionItem } from '@/features/dashboard/attention';

const iconMap: Record<string, LucideIcon> = {
  AlertCircle, Wallet, Trophy, Calendar, Mail, Users
};

const urgencyStyles = {
  critical: { card: 'border-red-200 bg-red-50/50 hover:border-red-300', badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
  warning: { card: 'border-amber-200 bg-amber-50/50 hover:border-amber-300', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  ok: { card: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600' },
};

export function AttentionCard({ item }: { item: AttentionItem }) {
  const Icon = iconMap[item.icon] || AlertCircle;
  const styles = urgencyStyles[item.urgency] || urgencyStyles.warning;

  return (
    <Link href={item.href} className={cn('group block rounded-xl border p-5 transition-all hover:shadow-md', styles.card)}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className={cn('inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold', styles.badge)}>
              {item.count}
            </span>
            <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              {item.label}
            </span>
          </div>
          <p className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
            {item.actionLabel}
          </p>
        </div>
        <div className={cn('rounded-lg p-2', styles.icon)}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </Link>
  );
}
