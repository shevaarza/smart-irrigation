'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, { title: string; desc: string }> = {
  '/dashboard': { title: 'Dashboard', desc: 'Monitor kondisi tanaman realtime' },
  '/issue': { title: 'Issue', desc: 'Log error dan peringatan sistem' },
  '/analysis': { title: 'Analisis', desc: 'Grafik dan ringkasan data historis' },
  '/weather': { title: 'Weather', desc: 'Data cuaca dan perbandingan sensor' },
};

export default function Navbar() {
  const pathname = usePathname();
  const info = pageTitles[pathname] || { title: 'Smart Plant', desc: 'IoT Monitoring System' };
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-base font-bold text-slate-800">{info.title}</h1>
        <p className="text-xs text-slate-400">{info.desc}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-700">{time}</p>
          <p className="text-[10px] text-slate-400">WIB · Asia/Jakarta</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
