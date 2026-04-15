import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { DEMO_ORGS } from '@/lib/demo-data'

export async function GET() {
  if (isDemoMode) return NextResponse.json(DEMO_ORGS)
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('organizations').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()
  const { data, error } = await supabase.from('organizations').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
