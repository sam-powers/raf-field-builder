import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { DEMO_CODINGS } from '@/lib/demo-data'

export async function GET(_: NextRequest, { params }: { params: Promise<{ briefId: string }> }) {
  const { briefId } = await params
  if (isDemoMode) {
    return NextResponse.json(DEMO_CODINGS.filter(c => c.brief_id === briefId))
  }
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('codings')
    .select('*, documents(id, title, organizations(name))')
    .eq('brief_id', briefId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
