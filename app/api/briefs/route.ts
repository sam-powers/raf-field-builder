import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { embed } from '@/lib/voyage'
import { isDemoMode } from '@/lib/demo'
import { DEMO_BRIEFS, DEMO_ISSUE_AREAS } from '@/lib/demo-data'

export async function GET() {
  if (isDemoMode) return NextResponse.json(DEMO_BRIEFS)
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('briefs')
    .select('*, issue_areas(name, description)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    const body = await req.json()
    const newArea = { id: `area-demo-${Date.now()}`, name: body.area_name, description: body.area_description, created_at: new Date().toISOString() }
    const newBrief = { id: `brief-demo-${Date.now()}`, issue_area_id: newArea.id, version: 1, topic_questions: body.topic_questions ?? [], codebook_content: null, batch_id: null, approved_at: null, created_at: new Date().toISOString(), issue_areas: newArea }
    return NextResponse.json(newBrief)
  }
  const supabase = supabaseServer()
  const body = await req.json()

  // Create issue area with embedding
  const embedding = await embed(`${body.area_name} ${body.area_description}`)
  const { data: area } = await supabase.from('issue_areas').insert({
    name: body.area_name,
    description: body.area_description,
    embedding: JSON.stringify(embedding),
  }).select().single()

  const { data: brief, error } = await supabase.from('briefs').insert({
    issue_area_id: (area as any).id,
    topic_questions: body.topic_questions ?? [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(brief)
}
