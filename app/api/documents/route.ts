import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('documents')
    .select('*, organizations(name)')
    .order('submitted_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
