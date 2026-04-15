import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ briefId: string }> }) {
  const supabase = supabaseServer()
  const { briefId } = await params
  const { data, error } = await supabase
    .from('codings')
    .select('*, documents(id, title, organizations(name))')
    .eq('brief_id', briefId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
