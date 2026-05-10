import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const date = searchParams.get('date')
  const limit = Number(searchParams.get('limit') || 500)

  if (!date) {
    return NextResponse.json(
      { success: false, error: 'Tanggal wajib diisi' },
      { status: 400 }
    )
  }

  const startDate = `${date}T00:00:00+00:00`
  const endDate = `${date}T23:59:59+00:00`

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .gte('recorded_at', startDate)
    .lte('recorded_at', endDate)
    .order('recorded_at', { ascending: true })
    .limit(limit)

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: data || [],
  })
}