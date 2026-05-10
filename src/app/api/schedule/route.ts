import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: ESP32 dan website mengambil jadwal
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-esp32-token')

    // Kalau request dari ESP32, cek token
    if (token && token !== process.env.ESP32_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Token ESP32 tidak valid' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('watering_schedule')
      .select('id, hour, minute, duration_sec, enabled, created_at, updated_at')
      .order('hour', { ascending: true })
      .order('minute', { ascending: true })

    // Kalau dari ESP32, cukup ambil jadwal aktif
    if (token) {
      query = query.eq('enabled', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// POST: tambah jadwal baru dari website
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { hour, minute, duration_sec, enabled } = body

    if (hour === undefined || minute === undefined || duration_sec === undefined) {
      return NextResponse.json(
        { success: false, error: 'hour, minute, dan duration_sec wajib diisi' },
        { status: 400 }
      )
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return NextResponse.json(
        { success: false, error: 'Jam harus 0-23 dan menit harus 0-59' },
        { status: 400 }
      )
    }

    if (duration_sec < 1 || duration_sec > 3600) {
      return NextResponse.json(
        { success: false, error: 'Durasi harus 1-3600 detik' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('watering_schedule')
      .insert({
        hour: Number(hour),
        minute: Number(minute),
        duration_sec: Number(duration_sec),
        enabled: enabled !== false,
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
      message: 'Jadwal berhasil ditambahkan',
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// PUT: update jadwal dari website
export async function PUT(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jadwal wajib ada' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { hour, minute, duration_sec, enabled } = body

    const updates: Record<string, unknown> = {}

    if (hour !== undefined) updates.hour = Number(hour)
    if (minute !== undefined) updates.minute = Number(minute)
    if (duration_sec !== undefined) updates.duration_sec = Number(duration_sec)
    if (enabled !== undefined) updates.enabled = Boolean(enabled)

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('watering_schedule')
      .update(updates)
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
      message: 'Jadwal berhasil diupdate',
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE: hapus jadwal
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jadwal wajib ada' },
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}