import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { DEMO_DOCUMENTS } from '@/lib/demo-data'

export async function GET() {
  if (isDemoMode) return NextResponse.json(DEMO_DOCUMENTS)
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('documents')
    .select('*, organizations(name)')
    .order('submitted_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
