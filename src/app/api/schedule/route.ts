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

  // UPDATE EXISTING
  if (body.id) {
    const { data, error } = await supabase
      .from('watering_schedule')
      .update({
        hour: body.hour,
        minute: body.minute,
        duration: body.duration,
        enabled: body.enabled,
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
      hour: body.hour,
      minute: body.minute,
      duration: body.duration,
      enabled: body.enabled,
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

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)

  const id = searchParams.get('id')

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
  })
}