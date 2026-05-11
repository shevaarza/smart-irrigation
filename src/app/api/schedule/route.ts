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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(req: Request) {
  const body = await req.json()

  const hour = Number(body.hour)
  const minute = Number(body.minute)
  const duration = Number(body.duration)
  const enabled = body.enabled ?? true

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(duration) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    duration <= 0
  ) {
    return NextResponse.json(
      { success: false, error: 'Input jadwal tidak valid' },
      { status: 400 }
    )
  }

  const label =
    body.label ||
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('watering_schedule')
    .insert({
      label,
      hour,
      minute,
      duration,
      enabled,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: Request) {
  const body = await req.json()

  const id = Number(body.id)

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID jadwal tidak valid' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('watering_schedule')
    .update({
      enabled: body.enabled,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(req: Request) {
  const body = await req.json()

  const id = Number(body.id)

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID jadwal tidak valid' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('watering_schedule')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}