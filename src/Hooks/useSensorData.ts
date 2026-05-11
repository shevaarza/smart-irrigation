// hooks/useSensorData.ts
// Versi lengkap dengan: Realtime subscription, removeById untuk hapus lokal

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SensorData } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Sesuaikan nama tabel dengan Supabase kamu ──
const SENSOR_TABLE = 'sensor_data'
const PUMP_LOG_TABLE = 'pump_log'
const SCHEDULE_TABLE = 'watering_schedule'

// ─────────────────────────────────────────────────────
// useSensorData
// Mengambil N data terbaru + subscribe realtime INSERT
// Mengembalikan removeById untuk update state lokal saat hapus
// ─────────────────────────────────────────────────────
export function useSensorData(limit = 20) {
  const [data, setData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch awal
    const fetchData = async () => {
      const { data: rows, error } = await supabase
        .from(SENSOR_TABLE)
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit)

      if (!error && rows) {
        setData(rows as SensorData[])
      }
      setLoading(false)
    }

    fetchData()

    // ── Realtime subscription ──
    // Setiap kali ESP32 INSERT data baru, langsung update state tanpa reload.
    // Ini juga yang membuat "Status Pompa" otomatis berubah ON/OFF
    // sesuai nilai pump_status terbaru dari ESP32.
    const channel = supabase
      .channel('sensor-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: SENSOR_TABLE },
        (payload) => {
          const newRow = payload.new as SensorData
          setData((prev) => [newRow, ...prev.slice(0, limit - 1)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [limit])

  // Hapus dari state lokal setelah delete dari database berhasil
const removeById = (id: string | number) => {
  setData((prev) => prev.filter((row) => String(row.id) !== String(id)))
}
  return {
    data,
    latest: data[0] ?? null,
    loading,
    removeById, // ← expose ini ke page.tsx
  }
}

// ─────────────────────────────────────────────────────
// usePumpLog
// ─────────────────────────────────────────────────────
export function usePumpLog(limit = 8) {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from(PUMP_LOG_TABLE)
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(limit)

      if (!error && data) setLogs(data)
    }

    fetchLogs()

    const channel = supabase
      .channel('pump-log-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: PUMP_LOG_TABLE },
        (payload) => {
          setLogs((prev) => [payload.new, ...prev.slice(0, limit - 1)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [limit])

  return { logs }
}

// ─────────────────────────────────────────────────────
// useSchedule
// ─────────────────────────────────────────────────────
export function useSchedule() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from(SCHEDULE_TABLE)
        .select('*')
        .order('hour', { ascending: true })

      if (!error && data) setSchedules(data)
      setLoading(false)
    }

    fetchSchedules()
  }, [])

  const updateSchedule = async (id: number, patch: Partial<any>) => {
    const { error } = await supabase
      .from(SCHEDULE_TABLE)
      .update(patch)
      .eq('id', id)

    if (!error) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      )
    } else {
      alert('Gagal update jadwal: ' + error.message)
    }
  }

  return { schedules, loading, updateSchedule }
}