import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function makeLabel(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

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
  const enabled = Boolean(body.enabled)
  const label = makeLabel(hour, minute)

  // UPDATE EXISTING
  if (body.id) {
    const { data, error } = await supabase
      .from('watering_schedule')
      .update({
        label,
        hour,
        minute,
        duration,
        enabled,
      })
      .eq('id', body.id)
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

  // INSERT NEW
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

export async function PATCH(req: Request) {
  const body = await req.json()

  const id = body.id
  const enabled = Boolean(body.enabled)

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID kosong' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('watering_schedule')
    .update({ enabled })
    .eq('id', id)
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

export async function DELETE(req: Request) {
  const body = await req.json()

  const id = body.id

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID kosong' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('watering_schedule')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Jadwal berhasil dihapus',
  })
}