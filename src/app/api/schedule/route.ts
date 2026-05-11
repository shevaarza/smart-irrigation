import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('watering_schedule')
    .select('*')
    .order('hour', { ascending: true })
    .order('minute', { ascending: true })

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
}

export async function POST(req: Request) {
  const body = await req.json()

  const hour = Number(body.hour)
  const minute = Number(body.minute)
  const duration = Number(body.duration)

  if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(duration)) {
    return NextResponse.json(
      { success: false, error: 'Input jadwal tidak valid' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('watering_schedule')
    .insert({
      label: body.label || `Jadwal ${hour}:${String(minute).padStart(2, '0')}`,
      hour,
      minute,
      duration,
      enabled: body.enabled ?? true,
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
}