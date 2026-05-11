import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 20)

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-esp32-token')

    if (token !== process.env.ESP32_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from('sensor_data')
      .insert({
        soil_moisture: body.soil_moisture,
        soil_status: body.soil_status,
        temperature: body.temperature,
        air_humidity: body.air_humidity,
        pump_status: Boolean(body.pump_status),
        device_time: body.device_time,
        wifi_rssi: body.wifi_rssi,
        device_ip: body.device_ip,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}