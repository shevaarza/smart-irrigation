// src/components/SensorTable.tsx
'use client';

import { SensorData } from '@/types';

interface SensorTableProps {
  data: SensorData[];
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function SoilStatusBadge({ status }: { status: string }) {
  const config = {
    Kering: 'bg-amber-100 text-amber-700 border-amber-200',
    Lembap: 'bg-green-100 text-green-700 border-green-200',
    Basah: 'bg-blue-100 text-blue-700 border-blue-200',
  }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  const icon = { Kering: '🌵', Lembap: '🌿', Basah: '💧' }[status] || '❓';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config}`}>
      <span>{icon}</span>
      {status}
    </span>
  );
}

function PumpStatusBadge({ status }: { status: string }) {
  const isOn = status === 'ON';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border font-mono ${
        isOn
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export default function SensorTable({ data, isLoading }: SensorTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <div>
            <h3 className="font-bold text-gray-900">Riwayat Data Sensor</h3>
            <p className="text-xs text-gray-400">Menampilkan {data.length} data terbaru</p>
          </div>
        </div>
        <div className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
          Total: {data.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                ADC Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status Tanah
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status Pompa
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Waktu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📭</span>
                    <p className="text-gray-400 font-medium">Belum ada data sensor</p>
                    <p className="text-gray-300 text-xs">Data akan muncul setelah ESP32 mengirim request</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`table-row-hover ${idx === 0 ? 'bg-green-50/40' : ''}`}
                >
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-xs font-bold text-gray-400">
                      #{row.id}
                    </span>
                    {idx === 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        Terbaru
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono font-bold text-gray-900">
                      {row.soil_moisture}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <SoilStatusBadge status={row.soil_status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PumpStatusBadge status={row.pump_status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-xs text-gray-500">
                      {formatDate(row.created_at)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
