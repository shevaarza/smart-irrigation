import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({
      success: true,
      online: false,
      data: null,
      message: 'Belum ada data sensor',
    })
  }

  const lastUpdate = new Date(data.recorded_at)
  const now = new Date()

  const diffMs = now.getTime() - lastUpdate.getTime()
  const diffSeconds = diffMs / 1000

  const online = diffSeconds <= 60

  return NextResponse.json({
    success: true,
    online,
    last_update: data.recorded_at,
    data: online ? data : null,
    message: online
      ? 'ESP32 online'
      : 'ESP32 offline',
  })
}