// src/components/PumpCard.tsx
'use client';

import { SensorData } from '@/types';

interface PumpCardProps {
  data: SensorData | null;
}

export default function PumpCard({ data }: PumpCardProps) {
  const isOn = data?.pump_status === 'ON';

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm card-hover overflow-hidden animate-fade-in-up delay-100 ${
        isOn ? 'border-green-300' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          isOn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Status Pompa
              </p>
              <h2 className={`text-lg font-bold ${isOn ? 'text-green-700' : 'text-gray-700'}`}>
                Water Pump
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col items-center">
        {/* Pump Visual */}
        <div
          className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
            isOn
              ? 'bg-gradient-to-br from-green-400 to-green-600 pump-glow'
              : 'bg-gradient-to-br from-gray-300 to-gray-400'
          }`}
        >
          <span className="text-4xl">{isOn ? '💦' : '🚿'}</span>

          {/* Ripple effect when ON */}
          {isOn && (
            <>
              <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-green-300 opacity-20 animate-ping delay-100" />
            </>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-lg mb-3 ${
            isOn
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${isOn ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`}
          />
          <span className="font-mono font-bold">
            {data ? data.pump_status : '—'}
          </span>
        </div>

        <p className="text-sm text-gray-500 text-center">
          {data
            ? isOn
              ? 'Pompa sedang aktif menyiram tanaman'
              : 'Pompa dalam keadaan standby'
            : 'Menunggu data dari sensor...'}
        </p>
      </div>
    </div>
  );
}
