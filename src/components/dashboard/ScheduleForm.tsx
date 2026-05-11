'use client';

import { useState } from 'react';
import { padZero } from '@/lib/utils';

type WateringSchedule = {
  id: number;
  label?: string;
  hour: number;
  minute: number;
  duration: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

interface Props {
  schedules: WateringSchedule[];
  onRefresh: () => void;
}

export default function ScheduleForm({ schedules, onRefresh }: Props) {
  const [hour, setHour] = useState('6');
  const [minute, setMinute] = useState('0');
  const [duration, setDuration] = useState('30');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAdd = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hour: Number(hour),
          minute: Number(minute),
          duration: Number(duration),
          enabled,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showMsg('ok', 'Jadwal berhasil ditambahkan & disimpan ke database!');
        onRefresh();
      } else {
        showMsg('err', json.error || 'Gagal menyimpan jadwal');
      }
    } catch {
      showMsg('err', 'Koneksi error');
    }

    setLoading(false);
  };

  const handleToggle = async (s: WateringSchedule) => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: s.id,
          enabled: !s.enabled,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showMsg('ok', 'Status jadwal berhasil diubah.');
        onRefresh();
      } else {
        showMsg('err', json.error || 'Gagal mengubah status jadwal');
      }
    } catch {
      showMsg('err', 'Koneksi error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;

    try {
      const res = await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      if (json.success) {
        showMsg('ok', 'Jadwal berhasil dihapus.');
        onRefresh();
      } else {
        showMsg('err', json.error || 'Gagal menghapus jadwal');
      }
    } catch {
      showMsg('err', 'Koneksi error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jadwal Baru
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Jam</label>
            <input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-yellow-200 bg-white focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Menit</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-yellow-200 bg-white focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Durasi (detik)</label>
            <input
              type="number"
              min="1"
              max="3600"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-yellow-200 bg-white focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="text-xs text-slate-500 font-medium block mb-1">Status</label>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                enabled
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {enabled ? '✓ Aktif' : '✗ Nonaktif'}
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Jadwal ke Database'}
        </button>

        {msg && (
          <div
            className={`mt-3 px-3 py-2 rounded-xl text-xs font-medium ${
              msg.type === 'ok'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Jadwal Tersimpan di Database
        </p>

        {schedules.length === 0 && (
          <p className="text-sm text-slate-400 py-3 text-center">
            Belum ada jadwal
          </p>
        )}

        {schedules.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
              s.enabled
                ? 'bg-white border-green-100'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  s.enabled ? 'bg-green-400' : 'bg-slate-300'
                }`}
              />

              <div>
                <p className="text-sm font-bold text-slate-700">
                  {padZero(s.hour)}:{padZero(s.minute)}
                </p>

                <p className="text-xs text-slate-400">
                  {s.duration}s · {s.enabled ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  s.enabled
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {s.enabled ? 'Nonaktifkan' : 'Aktifkan'}
              </button>

              <button
                onClick={() => handleDelete(s.id)}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}