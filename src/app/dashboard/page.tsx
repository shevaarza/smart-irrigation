'use client'

import { useCallback, useEffect, useState } from 'react'
import SensorCard from '@/components/dashboard/SensorCard'
import ScheduleForm from '@/components/dashboard/ScheduleForm'
import SensorTable from '@/components/dashboard/SensorTable'

type SensorData = {
  id: string
  soil_moisture: number
  soil_status?: string
  temperature: number
  air_humidity: number
  pump_status: boolean
  device_time?: string
  wifi_rssi?: number
  device_ip?: string
  recorded_at?: string
  created_at: string
}

type WateringSchedule = {
  id: string
  hour: number
  minute: number
  duration_sec: number
  enabled: boolean
  created_at?: string
  updated_at?: string
}

function timeSince(dateString?: string) {
  if (!dateString) return '-'

  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000
  )

  if (seconds < 60) return `${seconds} detik lalu`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`

  return `${Math.floor(seconds / 86400)} hari lalu`
}

function getSoilStatusLabel(value?: number) {
  if (value === undefined || value === null) return '-'
  if (value <= 30) return 'Kering'
  if (value <= 60) return 'Cukup'
  return 'Lembap'
}

export default function DashboardPage() {
  const [sensor, setSensor] = useState<SensorData | null>(null)
  const [history, setHistory] = useState<SensorData[]>([])
  const [schedules, setSchedules] = useState<WateringSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchSensor = useCallback(async () => {
    try {
      const res = await fetch('/api/sensor/latest', {
        cache: 'no-store',
      })

      const json = await res.json()

      if (json.success) {
        setSensor(json.data)
      } else {
        setSensor(null)
      }
    } catch (error) {
      console.error(error)
      setSensor(null)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/sensor?limit=20', {
        cache: 'no-store',
      })

      const json = await res.json()

      if (json.success) {
        setHistory(json.data)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule', {
        cache: 'no-store',
      })

      const json = await res.json()

      if (json.success) {
        setSchedules(json.data)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)

    await Promise.all([
      fetchSensor(),
      fetchHistory(),
      fetchSchedules(),
    ])

    setLastFetch(new Date())
    setLoading(false)
  }, [fetchSensor, fetchHistory, fetchSchedules])

  useEffect(() => {
    fetchAll()

    const id = setInterval(() => {
      fetchSensor()
      fetchHistory()
    }, 5000)

    return () => clearInterval(id)
  }, [fetchAll, fetchSensor, fetchHistory])

  const soilStatus = sensor
    ? getSoilStatusLabel(sensor.soil_moisture)
    : '-'

  const lastSensorTime =
    sensor?.recorded_at || sensor?.created_at

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Monitoring Realtime
          </h2>

          <p className="text-sm text-slate-400 mt-0.5">
            {lastFetch
              ? `Diperbarui ${timeSince(lastFetch.toISOString())}`
              : 'Memuat data...'}
          </p>
        </div>

        <button
          onClick={fetchAll}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {sensor ? (
        <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center gap-4 shadow-sm flex-wrap">

          <span className="text-xs font-semibold text-green-600">
            🟢 ESP32 Online
          </span>

          <span className="text-xs text-slate-500">
            IP:{' '}
            <span className="font-mono font-medium text-slate-700">
              {sensor.device_ip || '-'}
            </span>
          </span>

          <span className="text-xs text-slate-500">
            WiFi:{' '}
            <span className="font-medium text-slate-700">
              {sensor.wifi_rssi ?? '-'} dBm
            </span>
          </span>

          <span className="text-xs text-slate-500">
            Waktu ESP32:{' '}
            <span className="font-mono font-medium text-slate-700">
              {sensor.device_time || '-'}
            </span>
          </span>

          <span className="text-xs text-slate-500">
            Koneksi terakhir:{' '}
            <span className="font-medium text-slate-700">
              {timeSince(lastSensorTime)}
            </span>
          </span>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-red-600">
            🔴 ESP32 Offline
          </p>

          <p className="text-xs text-red-400 mt-1">
            Belum ada data sensor terbaru.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <SensorCard
          label="Kelembapan Tanah"
          value={sensor?.soil_moisture ?? '-'}
          unit="%"
          color={
            !sensor
              ? 'blue'
              : sensor.soil_moisture < 30
              ? 'red'
              : sensor.soil_moisture < 60
              ? 'yellow'
              : 'green'
          }
          sub={soilStatus}
        />

        <SensorCard
          label="Suhu Udara"
          value={sensor?.temperature ?? '-'}
          unit="°C"
          color="blue"
        />

        <SensorCard
          label="Kelembapan Udara"
          value={sensor?.air_humidity ?? '-'}
          unit="%"
          color="blue"
        />

        <SensorCard
          label="Status Pompa"
          value={sensor ? (sensor.pump_status ? 'ON' : 'OFF') : '-'}
          color={sensor?.pump_status ? 'green' : 'yellow'}
          sub={sensor?.pump_status ? 'Aktif' : 'Standby'}
        />

        <SensorCard
          label="Waktu Device"
          value={sensor?.device_time?.slice(11, 19) || '-'}
          color="blue"
          sub="WIB"
        />

        <SensorCard
          label="Terakhir Update"
          value={sensor ? timeSince(lastSensorTime) : '-'}
          color={!sensor ? 'yellow' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">
              Data Sensor Terbaru
            </h3>

            <span className="text-xs text-slate-400">
            {history?.length ?? 0} record
            </span>
          </div>

      <SensorTable data={history as any} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

          <h3 className="text-sm font-bold text-slate-700 mb-4">
            Jadwal Penyiraman
          </h3>

        <ScheduleForm
        schedules={schedules as any}
        onRefresh={fetchSchedules}
/>
        </div>
      </div>
    </div>
  )
}