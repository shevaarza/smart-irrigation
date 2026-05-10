'use client';
import { useState, useEffect } from 'react';
import { SystemIssue } from '@/lib/types';
import { IssueList, EmptyIssue } from '@/components/issue/IssueList';

export default function IssuePage() {
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/issue');
      const json = await res.json();
      if (json.success) setIssues(json.data);
    } catch {
      setIssues([{
        id: 'fetch-err',
        type: 'error',
        source: 'API /api/issue',
        message: 'Gagal menghubungi API issue. Periksa koneksi server.',
        timestamp: new Date().toISOString(),
        resolved: false,
      }]);
    }
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
    const id = setInterval(fetchIssues, 60000);
    return () => clearInterval(id);
  }, []);

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Status Sistem</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {lastCheck ? `Dicek: ${lastCheck.toLocaleTimeString('id-ID')}` : 'Memeriksa...'}
          </p>
        </div>
        <button onClick={fetchIssues} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold transition disabled:opacity-50">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Periksa Ulang
        </button>
      </div>

      {/* Summary chips */}
      {!loading && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
            issues.length === 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-white border-slate-100 text-slate-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${issues.length === 0 ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}/>
            {issues.length === 0 ? 'Semua Normal' : `${issues.length} Issue Ditemukan`}
          </div>
          {errors.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 border border-red-100 text-red-700">
              <span>{errors.length} Error</span>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-50 border border-yellow-100 text-yellow-700">
              <span>{warnings.length} Warning</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm text-slate-400">Memeriksa semua komponen sistem...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <EmptyIssue />
        </div>
      ) : (
        <div className="space-y-6">
          {errors.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-red-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                Error ({errors.length})
              </h3>
              <IssueList issues={errors} />
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-yellow-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                Warning ({warnings.length})
              </h3>
              <IssueList issues={warnings} />
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Daftar Pemeriksaan Sistem</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            'ESP32 koneksi & kirim data', 'Sensor Soil Moisture', 'DHT22 Suhu & Kelembapan',
            'WiFi ESP32 Signal', 'API /api/sensor', 'API /api/schedule',
            'Database Supabase', 'Weather API',
          ].map(item => {
            const hasIssue = issues.some(i => i.message.toLowerCase().includes(item.toLowerCase().split(' ')[0].toLowerCase()));
            return (
              <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${hasIssue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {hasIssue
                    ? <path strokeWidth="2.5" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                    : <path strokeWidth="2.5" strokeLinecap="round" d="M5 13l4 4L19 7"/>
                  }
                </svg>
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
