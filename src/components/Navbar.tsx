// src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">🌱</span>
            </div>
            <div>
              <h1 className="font-bold text-green-900 text-sm sm:text-base leading-tight">
                Smart Irrigation
              </h1>
              <p className="text-green-600 text-xs font-medium hidden sm:block">
                IoT Monitoring System
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot inline-block"></span>
            <span className="text-green-700 text-xs font-semibold">LIVE</span>
          </div>

          {/* Date & Time */}
          <div className="text-right">
            <p className="font-mono text-green-900 font-semibold text-sm sm:text-base tracking-wide">
              {time}
            </p>
            <p className="text-green-600 text-xs hidden sm:block">{date}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
