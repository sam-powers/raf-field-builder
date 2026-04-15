import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { DEMO_BRIEFS } from '@/lib/demo-data'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isDemoMode) {
    const brief = DEMO_BRIEFS.find(b => b.id === id) ?? DEMO_BRIEFS[0]
    return NextResponse.json(brief)
  }
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('briefs')
    .select('*, issue_areas(*)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (isDemoMode) {
    const brief = DEMO_BRIEFS.find(b => b.id === id) ?? DEMO_BRIEFS[0]
    return NextResponse.json({ ...brief, ...body })
  }
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('briefs').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
