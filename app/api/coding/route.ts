import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import { isDemoMode } from '@/lib/demo'

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ batch_id: 'demo-batch', request_counts: { processing: 0, succeeded: 7, errored: 0, canceled: 0, expired: 0 } })
  }
  const supabase = supabaseServer()
  const { brief_id } = await req.json()

  const { data: brief } = await supabase
    .from('briefs')
    .select('*, issue_areas(name)')
    .eq('id', brief_id)
    .single()

  const { data: briefDocs } = await supabase
    .from('brief_documents')
    .select('documents(id, title, raw_text, organizations(name))')
    .eq('brief_id', brief_id)
    .eq('included', true)

  const topicQuestions = (brief as any).topic_questions as string[]
  const issueName = (brief as any).issue_areas?.name

  const systemPrompt = `You are analyzing policy documents for a coalition focused on government capacity and modernization.

Brief: ${issueName}
Topic Questions:
${topicQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each topic question, extract the most relevant verbatim quote(s) from the document. If the document does not address a question, set addressed to false and leave quotes empty.`

  const tool = {
    name: 'record_codings',
    description: 'Record position codings extracted from this document',
    input_schema: {
      type: 'object' as const,
      properties: {
        codings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              addressed: { type: 'boolean' },
              quotes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', description: 'Verbatim quote from document' },
                    context: { type: 'string', description: 'One sentence explaining relevance' },
                  },
                  required: ['text', 'context'],
                },
              },
            },
            required: ['question', 'addressed', 'quotes'],
          },
        },
      },
      required: ['codings'],
    },
  }

  const requests = briefDocs?.map((bd: any) => ({
    custom_id: bd.documents.id,
    params: {
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: [{ type: 'text' as const, text: systemPrompt, cache_control: { type: 'ephemeral' as const } }],
      tools: [tool],
      tool_choice: { type: 'tool' as const, name: 'record_codings' },
      messages: [{
        role: 'user' as const,
        content: `Organization: ${bd.documents.organizations?.name}\nDocument: ${bd.documents.title}\n\n${bd.documents.raw_text?.slice(0, 10000)}`,
      }],
    },
  })) ?? []

  const batch = await anthropic.messages.batches.create({ requests })

  await supabase.from('briefs').update({ batch_id: batch.id }).eq('id', brief_id)

  return NextResponse.json({ batch_id: batch.id, request_counts: batch.request_counts })
}
