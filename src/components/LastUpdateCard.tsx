// src/components/LastUpdateCard.tsx
'use client';

import { SensorData } from '@/types';
import { useEffect, useState } from 'react';

interface LastUpdateCardProps {
  data: SensorData | null;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 10) return 'Baru saja';
  if (diff < 60) return `${diff} detik yang lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
  return `${Math.floor(diff / 86400)} hari yang lalu`;
}

export default function LastUpdateCard({ data }: LastUpdateCardProps) {
  const [ago, setAgo] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    if (!data) return;

    const update = () => {
      setAgo(timeAgo(data.created_at));
    };

    update();
    const interval = setInterval(update, 5000);

    setFormattedDate(
      new Date(data.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 card-hover animate-fade-in-up delay-200">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center text-xl shrink-0">
          🕐
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Update Terakhir
          </p>
          {data ? (
            <>
              <p className="font-bold text-gray-900 text-base">{ago}</p>
              <p className="font-mono text-xs text-gray-400 mt-0.5 truncate">{formattedDate}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Belum ada data</p>
          )}
        </div>
        {data && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400">ID</p>
            <p className="font-mono text-xs font-bold text-gray-700">#{data.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
