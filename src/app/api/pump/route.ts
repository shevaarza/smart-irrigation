import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ======================
// GET
// ======================
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Pump API aktif',
  })
}

// ======================
// POST
// ======================
export async function POST(req: Request) {
  const token = req.headers.get('x-esp32-token')

  if (token !== process.env.ESP32_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()

  const { pump_status, trigger, device_time, wifi_rssi, device_ip } = body

  const { error } = await supabase.from('pump_logs').insert({
    pump_status: Boolean(pump_status),
    trigger: trigger ?? 'unknown',
    device_time,
    wifi_rssi,
    device_ip,
  })

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: true, message: 'Pump log saved' },
    { status: 201 }
  )
}