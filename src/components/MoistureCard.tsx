// src/components/MoistureCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { SensorData } from '@/types';

interface MoistureCardProps {
  data: SensorData | null;
}

const MOISTURE_MAX = 600; // ADC max value (completely dry)
const MOISTURE_MIN = 0;   // ADC min value (completely wet)

function getMoisturePercent(raw: number): number {
  // Invert: lower ADC = more wet, higher ADC = more dry
  const clamped = Math.max(MOISTURE_MIN, Math.min(raw, MOISTURE_MAX));
  return Math.round(((MOISTURE_MAX - clamped) / (MOISTURE_MAX - MOISTURE_MIN)) * 100);
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'Basah':
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        bar: 'bg-blue-500',
        icon: '💧',
        desc: 'Tanah sangat lembap, tidak perlu disiram',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
      };
    case 'Lembap':
      return {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        bar: 'bg-green-500',
        icon: '🌿',
        desc: 'Tanah dalam kondisi ideal',
        badge: 'bg-green-100 text-green-700 border-green-200',
      };
    case 'Kering':
      return {
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        bar: 'bg-amber-500',
        icon: '🌵',
        desc: 'Tanah kering, membutuhkan air',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    default:
      return {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        bar: 'bg-gray-400',
        icon: '❓',
        desc: 'Status tidak diketahui',
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
      };
  }
}

export default function MoistureCard({ data }: MoistureCardProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const percent = data ? getMoisturePercent(data.soil_moisture) : 0;
  const config = getStatusConfig(data?.soil_status || '');

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      setAnimatedPercent(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent, data]);

  return (
    <div className={`bg-white rounded-2xl border ${config.border} shadow-sm card-hover overflow-hidden animate-fade-in-up`}>
      {/* Header */}
      <div className={`${config.bg} px-6 py-4 border-b ${config.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Kelembapan Tanah
              </p>
              <h2 className={`text-lg font-bold ${config.color}`}>Soil Moisture</h2>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${config.badge}`}>
            {data?.soil_status || '—'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* RAW ADC Value */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Nilai ADC (Raw)</p>
            <p className="font-mono text-4xl font-bold text-gray-900">
              {data ? data.soil_moisture : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium mb-1">Kelembapan</p>
            <p className={`font-mono text-3xl font-bold ${config.color}`}>
              {data ? `${percent}%` : '—'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Kering (ADC: 600)</span>
            <span>Basah (ADC: 0)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.bar} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${animatedPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-amber-500 font-medium">0%</span>
            <span className="text-blue-500 font-medium">100%</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center italic">{config.desc}</p>
      </div>
    </div>
  );
}
