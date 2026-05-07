'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AttentionCard } from './attention-card';
import type { AttentionItem } from '@/features/dashboard/attention';

export function AttentionWidget({ items, roleLabel }: { items: AttentionItem[]; roleLabel: string }) {
  if (items.length === 0) {
    return (
      <div className='rounded-xl border border-emerald-200 bg-emerald-50/30 p-5'>
        <p className='text-sm text-emerald-700 font-medium'>
          Alles erledigt! Keine dringenden Aufgaben fuer {roleLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <div>
          <h2 className='text-xl font-heading tracking-tight text-foreground'>Aufmerksamkeit erforderlich</h2>
          <p className='text-muted-foreground text-sm mt-1'>Dringende Aufgaben fuer {roleLabel}</p>
        </div>
      </div>
      <ScrollArea className='w-full whitespace-nowrap'>
        <div className='flex w-max space-x-4 pb-4'>
          {items.map((item) => (
            <div key={item.id} className='w-[280px] shrink-0'>
              <AttentionCard item={item} />
            </div>
          ))}
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </div>
  );
}
