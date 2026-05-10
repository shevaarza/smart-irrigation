// lib/supabase/client.ts
// Dipakai di komponen React (browser side)
// Menggunakan ANON KEY — hanya untuk SELECT yang sudah diberi policy public

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
