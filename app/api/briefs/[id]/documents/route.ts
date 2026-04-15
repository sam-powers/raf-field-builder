import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo'
import { DEMO_BRIEF_DOCUMENTS } from '@/lib/demo-data'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isDemoMode) {
    return NextResponse.json(DEMO_BRIEF_DOCUMENTS.filter(bd => bd.brief_id === id))
  }
  const supabase = supabaseServer()

  // Get brief's issue area embedding
  const { data: brief } = await supabase
    .from('briefs')
    .select('*, issue_areas(embedding)')
    .eq('id', id)
    .single()

  const embedding = (brief as any)?.issue_areas?.embedding
  if (!embedding) return NextResponse.json([])

  // Find similar docs via pgvector cosine similarity
  const { data: docs } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 50,
  })

  // Also get existing brief_documents to preserve included/excluded state
  const { data: existing } = await supabase
    .from('brief_documents')
    .select('document_id, included')
    .eq('brief_id', id)

  const existingMap = new Map(existing?.map((e: any) => [e.document_id, e.included]))

  // Upsert brief_documents for new matches
  const toUpsert = docs?.map((d: any) => ({
    brief_id: id,
    document_id: d.id,
    similarity_score: d.similarity,
    included: existingMap.has(d.id) ? existingMap.get(d.id) : true,
  })) ?? []

  if (toUpsert.length > 0) {
    await supabase.from('brief_documents').upsert(toUpsert, { onConflict: 'brief_id,document_id' })
  }

  const { data: result } = await supabase
    .from('brief_documents')
    .select('*, documents(id, title, submitted_at, organizations(name))')
    .eq('brief_id', id)
    .order('similarity_score', { ascending: false })

  return NextResponse.json(result ?? [])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isDemoMode) return NextResponse.json({ ok: true })
  const supabase = supabaseServer()
  const { id } = await params
  const { document_id, included } = await req.json()
  const { error } = await supabase
    .from('brief_documents')
    .update({ included })
    .eq('brief_id', id)
    .eq('document_id', document_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
