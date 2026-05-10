'use client';
import { useState, useEffect } from 'react';
import { SensorData, DailySummary } from '@/lib/types';

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }}/>
    </div>
  );
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 48;
  const w = Math.max(data.length * 6, 100);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 48 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AnalysisPage() {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/sensor/history?date=${date}&limit=500`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        const d: SensorData[] = json.data;
        setHistory(d);
        setSummary({
          date,
          avg_soil_moisture: +(d.reduce((s, x) => s + x.soil_moisture, 0) / d.length).toFixed(1),
          avg_temperature: +(d.reduce((s, x) => s + x.temperature, 0) / d.length).toFixed(1),
          avg_air_humidity: +(d.reduce((s, x) => s + x.air_humidity, 0) / d.length).toFixed(1),
          pump_on_count: d.filter(x => x.pump_status).length,
          data_count: d.length,
        });
      } else {
        setHistory([]);
        setSummary(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [date]);

  const soilData = history.map(d => d.soil_moisture);
  const tempData = history.map(d => d.temperature);
  const humData = history.map(d => d.air_humidity);

  const charts = [
    { label: 'Kelembapan Tanah', data: soilData, unit: '%', color: '#22c55e', lineColor: '#22c55e', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700' },
    { label: 'Suhu Udara', data: tempData, unit: '°C', color: '#3b82f6', lineColor: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
    { label: 'Kelembapan Udara', data: humData, unit: '%', color: '#0ea5e9', lineColor: '#0ea5e9', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header + date filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analisis Data Sensor</h2>
          <p className="text-sm text-slate-400 mt-0.5">Riwayat dan tren kondisi tanaman</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} max={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-400 transition"/>
          <span className="text-xs text-slate-400 font-medium">
            {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm text-slate-400">Memuat data analisis...</p>
        </div>
      ) : !summary ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="1.5" strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">Tidak ada data untuk tanggal ini</p>
          <p className="text-sm text-slate-400 mt-1">Pilih tanggal lain atau pastikan ESP32 mengirim data.</p>
        </div>
      ) : (
        <>
          {/* Daily summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Rata-rata Kelembapan Tanah', value: summary.avg_soil_moisture, unit: '%', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
              { label: 'Rata-rata Suhu', value: summary.avg_temperature, unit: '°C', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Rata-rata Kelembapan Udara', value: summary.avg_air_humidity, unit: '%', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
              { label: 'Pompa Aktif', value: summary.pump_on_count, unit: 'kali', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
              { label: 'Total Data Masuk', value: summary.data_count, unit: 'record', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
            ].map(item => (
              <div key={item.label} className={`border rounded-2xl p-4 ${item.bg}`}>
                <p className="text-xs text-slate-500 font-medium leading-tight">{item.label}</p>
                <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                  {item.value}<span className="text-xs font-normal ml-0.5">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Charts like battery history */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {charts.map(chart => {
              const vals = chart.data;
              const avg = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
              const min = vals.length ? Math.min(...vals) : 0;
              const max = vals.length ? Math.max(...vals) : 100;
              return (
                <div key={chart.label} className={`${chart.bg} border ${chart.border} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-600">{chart.label}</p>
                    <span className={`text-xs font-bold ${chart.text}`}>{avg}{chart.unit}</span>
                  </div>
                  <SparkLine data={vals} color={chart.lineColor} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400">Min: {min}{chart.unit}</span>
                    <span className="text-[10px] text-slate-400">{vals.length} titik</span>
                    <span className="text-[10px] text-slate-400">Max: {max}{chart.unit}</span>
                  </div>
                  <MiniBar value={avg} max={chart.label.includes('Suhu') ? 50 : 100} color={`bg-[${chart.lineColor}]`} />
                </div>
              );
            })}
          </div>

          {/* Pump history timeline */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Riwayat Status Pompa
            </h3>
            <div className="flex gap-0.5 flex-wrap">
              {history.map((d, i) => (
                <div key={i} title={`${d.device_time}: ${d.pump_status ? 'ON' : 'OFF'}`}
                  className={`w-2 h-6 rounded-sm ${d.pump_status ? 'bg-green-400' : 'bg-slate-100'}`}/>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-400"/>
                <span className="text-xs text-slate-500">Pompa ON ({summary.pump_on_count})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-slate-100"/>
                <span className="text-xs text-slate-500">Pompa OFF ({summary.data_count - summary.pump_on_count})</span>
              </div>
            </div>
          </div>

          {/* Data table preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Tabel Data (10 Terakhir)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wide">
                    <th className="px-3 py-2 text-left">Waktu</th>
                    <th className="px-3 py-2 text-center">Tanah</th>
                    <th className="px-3 py-2 text-center">Suhu</th>
                    <th className="px-3 py-2 text-center">Kelembapan</th>
                    <th className="px-3 py-2 text-center">Pompa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.slice(-10).reverse().map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-500">{row.device_time?.slice(11, 19) || row.created_at?.slice(11, 19)}</td>
                      <td className="px-3 py-2 text-center font-semibold text-green-600">{row.soil_moisture}%</td>
                      <td className="px-3 py-2 text-center text-blue-600">{row.temperature}°C</td>
                      <td className="px-3 py-2 text-center text-sky-600">{row.air_humidity}%</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${row.pump_status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {row.pump_status ? 'ON' : 'OFF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
