import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import { isDemoMode } from '@/lib/demo'

export async function GET(_: NextRequest, { params }: { params: Promise<{ briefId: string }> }) {
  if (isDemoMode) {
    return NextResponse.json({ status: 'ended', request_counts: { processing: 0, succeeded: 7, errored: 0, canceled: 0, expired: 0 }, codings_saved: 28 })
  }
  const supabase = supabaseServer()
  const { briefId } = await params

  const { data: brief } = await supabase
    .from('briefs')
    .select('batch_id, topic_questions')
    .eq('id', briefId)
    .single()

  if (!(brief as any)?.batch_id) return NextResponse.json({ status: 'no_batch' })

  const batch = await anthropic.messages.batches.retrieve((brief as any).batch_id)

  if (batch.processing_status === 'ended') {
    // Process results
    const { data: existingCodings } = await supabase
      .from('codings')
      .select('document_id')
      .eq('brief_id', briefId)

    const codedDocIds = new Set(existingCodings?.map((c: any) => c.document_id))

    for await (const result of await anthropic.messages.batches.results((brief as any).batch_id)) {
      if (result.result.type !== 'succeeded') continue
      if (codedDocIds.has(result.custom_id)) continue

      const toolUse = result.result.message.content.find((b: any) => b.type === 'tool_use')
      if (!toolUse) continue

      const { codings } = (toolUse as any).input as { codings: Array<{ question: string; addressed: boolean; quotes: any[] }> }

      const rows = codings.map(c => ({
        document_id: result.custom_id,
        brief_id: briefId,
        topic_question: c.question,
        addressed: c.addressed,
        quotes: c.quotes,
      }))

      await supabase.from('codings').insert(rows)
    }
  }

  const { count } = await supabase
    .from('codings')
    .select('*', { count: 'exact', head: true })
    .eq('brief_id', briefId)

  return NextResponse.json({
    status: batch.processing_status,
    request_counts: batch.request_counts,
    codings_saved: count ?? 0,
  })
}
