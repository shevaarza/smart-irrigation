import { SensorData } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface Props {
  data: SensorData[];
}

export default function SensorTable({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Belum ada data sensor
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
            <th className="px-4 py-3 text-left">Waktu</th>
            <th className="px-4 py-3 text-center">Tanah (%)</th>
            <th className="px-4 py-3 text-center">Suhu (°C)</th>
            <th className="px-4 py-3 text-center">Kelembapan (%)</th>
            <th className="px-4 py-3 text-center">Pompa</th>
            <th className="px-4 py-3 text-center">RSSI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-600 text-xs">{formatDateTime(row.created_at)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`font-semibold ${row.soil_moisture < 30 ? 'text-red-500' : row.soil_moisture < 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {row.soil_moisture}%
                </span>
              </td>
              <td className="px-4 py-3 text-center text-blue-600 font-medium">{row.temperature}°</td>
              <td className="px-4 py-3 text-center text-blue-600 font-medium">{row.air_humidity}%</td>
              <td className="px-4 py-3 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${row.pump_status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {row.pump_status ? 'ON' : 'OFF'}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-xs text-slate-400">{row.wifi_rssi} dBm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
