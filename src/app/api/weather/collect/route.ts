import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CITY = process.env.WEATHER_CITY || 'Malang'
const LATITUDE = process.env.WEATHER_LATITUDE || '-7.9666'
const LONGITUDE = process.env.WEATHER_LONGITUDE || '112.6326'

function getCondition(code: number) {
  if (code === 0) return 'Cerah'
  if ([1, 2, 3].includes(code)) return 'Berawan'
  if ([45, 48].includes(code)) return 'Kabut'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Hujan'
  if ([95, 96, 99].includes(code)) return 'Badai'
  return 'Tidak diketahui'
}

export async function POST() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LATITUDE}` +
      `&longitude=${LONGITUDE}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
      `&timezone=Asia%2FJakarta`

    const res = await fetch(url, { cache: 'no-store' })
    const json = await res.json()
    const current = json.current

    const weatherCode = Number(current.weather_code)

    const { data, error } = await supabase
      .from('weather_data')
      .insert({
        city: CITY,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        weather_code: weatherCode,
        weather_condition: getCondition(weatherCode),
        weather_time: current.time,
        source: 'open-meteo',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}