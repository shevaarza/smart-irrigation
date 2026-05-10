import { SensorData } from '@/lib/types'

interface WeatherCardProps {
  weather: any | null
}

export function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          ☁️
        </div>
        <p className="text-sm text-slate-500">Data cuaca tidak tersedia</p>
      </div>
    )
  }

  const current = weather.current || weather

  const temperature = current.temperature ?? '-'
  const humidity = current.humidity ?? '-'
  const precipitation = current.precipitation ?? 0
  const condition = current.weather_condition || 'Cuaca realtime'
  const time = current.time || weather.time || '-'

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">
            Cuaca Kota
          </p>
          <p className="text-lg font-bold text-blue-800 mt-0.5">
            {weather.city || 'Malang'}
          </p>
          <p className="text-xs text-blue-500 capitalize mt-0.5">
            {getWeatherEmoji(condition)} {condition}
          </p>
          <p className="text-[11px] text-blue-400 mt-1">
            {time}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
          {getWeatherEmoji(condition)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400">Suhu</p>
          <p className="text-xl font-bold text-blue-700">
            {temperature}°
            <span className="text-sm font-normal">C</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400">Kelembapan</p>
          <p className="text-xl font-bold text-blue-700">
            {humidity}
            <span className="text-sm font-normal">%</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400">Hujan</p>
          <p className="text-xl font-bold text-blue-700">
            {precipitation}
            <span className="text-sm font-normal"> mm</span>
          </p>
        </div>
      </div>

        {weather.hourly && (
  <div className="mt-5">
    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
      Prediksi Beberapa Jam Ke Depan
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {weather.hourly.slice(1, 5).map((hour: any) => (
        <div
          key={hour.time}
          className="bg-white rounded-xl p-3 text-center border border-blue-50"
        >
          <p className="text-xs text-slate-400">
            {new Date(hour.time).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          <p className="text-xl mt-1">
            {getWeatherEmoji(hour.weather_condition)}
          </p>

          <p className="text-sm font-bold text-blue-700 mt-1">
            {Math.round(hour.temperature)}°C
          </p>

          <p className="text-[11px] text-slate-400">
            Hujan {hour.rain_probability ?? 0}%
          </p>
        </div>
      ))}
    </div>
  </div>
)}

      {weather.daily && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
            Prediksi Harian
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weather.daily.slice(0, 4).map((day: any) => (
              <div
                key={day.date}
                className="bg-white rounded-xl p-3 text-center border border-blue-50"
              >
                <p className="text-xs text-slate-400">
                  {formatDay(day.date)}
                </p>
                <p className="text-xl mt-1">
                  {getWeatherEmoji(day.weather_condition)}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {day.weather_condition}
                </p>
                <p className="text-sm font-bold text-blue-700 mt-1">
                  {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                </p>
                <p className="text-[11px] text-slate-400">
                  Hujan {day.rain_probability ?? 0}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface CompareCardProps {
  weather: any | null
  sensor: SensorData | null
}

export function WeatherCompareCard({ weather, sensor }: CompareCardProps) {
  if (!weather || !sensor) return null

  const current = weather.current || weather

  const weatherTemp = Number(current.temperature)
  const weatherHumidity = Number(current.humidity)

  const tempDiff = (sensor.temperature - weatherTemp).toFixed(1)
  const humDiff = (sensor.air_humidity - weatherHumidity).toFixed(1)

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-4">
        Perbandingan Data
      </h3>

      <div className="space-y-3">
        {[
          {
            label: 'Suhu',
            unit: '°C',
            cityVal: weatherTemp,
            sensorVal: sensor.temperature,
            diff: Number(tempDiff),
          },
          {
            label: 'Kelembapan',
            unit: '%',
            cityVal: weatherHumidity,
            sensorVal: sensor.air_humidity,
            diff: Number(humDiff),
          },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-3 gap-2 items-center">
            <div className="bg-blue-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-blue-400 font-medium">Kota</p>
              <p className="text-sm font-bold text-blue-700">
                {row.cityVal}
                {row.unit}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                {row.label}
              </p>
              <p
                className={`text-xs font-bold ${
                  Math.abs(row.diff) > 5 ? 'text-red-500' : 'text-slate-500'
                }`}
              >
                {row.diff > 0 ? '+' : ''}
                {row.diff}
                {row.unit}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-green-500 font-medium">Sensor</p>
              <p className="text-sm font-bold text-green-700">
                {row.sensorVal}
                {row.unit}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mt-3 text-center">
        Selisih besar menandakan kondisi mikro berbeda dari cuaca umum kota.
      </p>
    </div>
  )
}

function getWeatherEmoji(condition?: string) {
  const c = condition?.toLowerCase() || ''

  if (c.includes('cerah')) return '☀️'
  if (c.includes('berawan')) return '☁️'
  if (c.includes('hujan')) return '🌧️'
  if (c.includes('badai')) return '⛈️'
  if (c.includes('kabut')) return '🌫️'
  if (c.includes('gerimis')) return '🌦️'

  return '🌤️'
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}