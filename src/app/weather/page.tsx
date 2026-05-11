'use client'

import { useState, useEffect } from 'react'
import { WeatherCard, WeatherCompareCard } from '@/components/weather/WeatherCard'

type HourlyWeather = {
  time: string
  temperature: number
  rain_probability: number
  weather_condition: string
}

type DailyWeather = {
  date: string
  temp_max: number
  temp_min: number
  weather_condition: string
}

type WeatherData = {
  city: string

  current: {
    temperature: number
    humidity: number
    precipitation?: number
    weather_code?: number
    weather_condition: string
    time?: string
  }

  hourly?: HourlyWeather[]
  daily?: DailyWeather[]

  source?: string
}

type SensorData = {
  temperature: number
  air_humidity: number
  soil_moisture: number
  device_time?: string
  created_at?: string
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [sensor, setSensor] = useState<SensorData | null>(null)

  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const fetchWeather = async () => {
    const res = await fetch('/api/weather', {
      cache: 'no-store',
    })

    const json = await res.json()

    if (json.success) {
      setWeather(json.data)
    }
  }

  const fetchSensor = async () => {
    const res = await fetch('/api/sensor/latest', {
      cache: 'no-store',
    })

    const json = await res.json()

    if (json.success) {
      setSensor(json.data)
    }
  }

  const fetchAll = async () => {
    setLoading(true)

    await Promise.all([
      fetchWeather(),
      fetchSensor(),
    ])

    setLoading(false)
  }

  const collectWeather = async () => {
    setCollecting(true)

    const res = await fetch('/api/weather/collect', {
      method: 'POST',
    })

    const json = await res.json()

    setMsg(
      json.success
        ? 'Data cuaca berhasil disimpan ke database!'
        : json.error || 'Gagal menyimpan data cuaca'
    )

    setTimeout(() => {
      setMsg(null)
    }, 3000)

    setCollecting(false)
  }

  useEffect(() => {
    fetchAll()

    const id = setInterval(() => {
      fetchWeather()
      fetchSensor()
    }, 600000)

    return () => clearInterval(id)
  }, [])

  const conditionEmoji = (condition?: string) => {
    const c = condition?.toLowerCase() || ''

    if (c.includes('cerah')) return '☀️'
    if (c.includes('berawan')) return '☁️'
    if (c.includes('hujan')) return '🌧️'
    if (c.includes('badai')) return '⛈️'
    if (c.includes('kabut')) return '🌫️'

    return '🌤️'
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Data Cuaca Realtime
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Perbandingan cuaca kota dari Open-Meteo dengan sensor ESP32
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
          >
            {loading ? 'Memuat...' : 'Refresh'}
          </button>

          <button
            onClick={collectWeather}
            disabled={collecting}
            className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
          >
            {collecting ? 'Menyimpan...' : 'Simpan ke DB'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400">
            Mengambil data cuaca realtime...
          </p>
        </div>
      ) : (
        <>
          {weather && (
            <div className="bg-gradient-to-r from-blue-500 to-sky-600 rounded-3xl p-8 text-white shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">

                <div>
                  <p className="text-blue-100 text-xs uppercase font-semibold tracking-wide">
                    Cuaca Saat Ini
                  </p>

                  <h1 className="text-5xl font-bold mt-2">
                    {weather.city}
                  </h1>

                  <p className="text-xl mt-3">
                    {conditionEmoji(weather.current.weather_condition)}{' '}
                    {weather.current.weather_condition}
                  </p>

                  <p className="text-blue-100 text-sm mt-2">
                    Source: {weather.source}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-7xl font-bold">
                    {Math.round(Number(weather.current.temperature))}°
                  </p>

                  <p className="text-lg text-blue-100">
                    Kelembapan: {weather.current.humidity}%
                  </p>

                  <p className="text-lg text-blue-100">
                    Hujan: {weather.current.precipitation ?? 0} mm
                  </p>

                  <p className="text-sm text-blue-100 mt-2">
                    {weather.current.time}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <WeatherCard weather={weather as any} />

            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-green-700 mb-4">
                Sensor ESP32
              </h3>

              {sensor ? (
                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-slate-400">
                      Suhu
                    </p>

                    <p className="text-2xl font-bold text-green-700">
                      {sensor.temperature}°C
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-slate-400">
                      Kelembapan
                    </p>

                    <p className="text-2xl font-bold text-green-700">
                      {sensor.air_humidity}%
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 col-span-2">
                    <p className="text-sm text-slate-400">
                      Kelembapan Tanah
                    </p>

                    <p className="text-2xl font-bold text-green-700">
                      {sensor.soil_moisture}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">
                  Belum ada data sensor
                </p>
              )}
            </div>
          </div>

{weather?.hourly && (
  <div className="bg-white border border-slate-100 rounded-2xl p-5">
    <h3 className="text-lg font-bold text-slate-700 mb-5">
      Prediksi Beberapa Jam Kedepan
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {weather.hourly
        .filter((item) => {
          const now = new Date()

          const nextHour = now.getMinutes() > 0
            ? now.getHours() + 1
            : now.getHours()

          const itemHour = Number(item.time.slice(11, 13))

          return itemHour >= nextHour
        })
        .slice(0, 8)
        .map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 rounded-2xl p-4 text-center"
          >
            <p className="text-sm text-slate-500">
              {item.time.slice(11, 16)}
            </p>

            <p className="text-3xl mt-2">
              {conditionEmoji(item.weather_condition)}
            </p>

            <p className="text-xl font-bold text-blue-700 mt-2">
              {item.temperature}°C
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Hujan {item.rain_probability}%
            </p>
          </div>
        ))}
    </div>
  </div>
)}

          <WeatherCompareCard
            weather={weather as any}
            sensor={sensor as any}
          />
        </>
      )}
    </div>
  )
}