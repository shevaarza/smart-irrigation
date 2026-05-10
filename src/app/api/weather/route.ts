import { NextResponse } from 'next/server'

const CITY = process.env.WEATHER_CITY || 'Malang'
const LATITUDE = process.env.WEATHER_LATITUDE || '-7.9666'
const LONGITUDE = process.env.WEATHER_LONGITUDE || '112.6326'

export async function GET() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LATITUDE}` +
    `&longitude=${LONGITUDE}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
    `&timezone=Asia%2FBangkok`

  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  const current = json.current

  return NextResponse.json({
    success: true,
    data: {
      city: CITY,

      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        weather_code: current.weather_code,
        weather_condition: getWeatherCondition(current.weather_code),
        time: current.time,
      },

      hourly: json.hourly.time.map((time: string, i: number) => ({
        time,
        temperature: json.hourly.temperature_2m[i],
        humidity: json.hourly.relative_humidity_2m[i],
        rain_probability: json.hourly.precipitation_probability[i],
        precipitation: json.hourly.precipitation[i],
        weather_code: json.hourly.weather_code[i],
        weather_condition: getWeatherCondition(json.hourly.weather_code[i]),
      })),

      daily: json.daily.time.map((date: string, i: number) => ({
        date,
        temp_max: json.daily.temperature_2m_max[i],
        temp_min: json.daily.temperature_2m_min[i],
        precipitation_sum: json.daily.precipitation_sum[i],
        rain_probability: json.daily.precipitation_probability_max[i],
        weather_code: json.daily.weather_code[i],
        weather_condition: getWeatherCondition(json.daily.weather_code[i]),
      })),

      source: 'open-meteo',
    },
  })
}

function getWeatherCondition(code: number) {
  const weatherCodes: Record<number, string> = {
    0: 'Cerah',
    1: 'Sebagian cerah',
    2: 'Berawan sebagian',
    3: 'Berawan',
    45: 'Berkabut',
    48: 'Kabut beku',
    51: 'Gerimis ringan',
    53: 'Gerimis sedang',
    55: 'Gerimis lebat',
    61: 'Hujan ringan',
    63: 'Hujan sedang',
    65: 'Hujan lebat',
    80: 'Hujan lokal ringan',
    81: 'Hujan lokal sedang',
    82: 'Hujan lokal lebat',
    95: 'Badai petir',
  }

  return weatherCodes[code] || 'Tidak diketahui'
}