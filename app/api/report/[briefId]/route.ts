import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import { isDemoMode } from '@/lib/demo'
import { DEMO_NARRATIVE } from '@/lib/demo-data'

export async function POST(_: NextRequest, { params }: { params: Promise<{ briefId: string }> }) {
  if (isDemoMode) {
    await new Promise(r => setTimeout(r, 2000))
    return NextResponse.json({ narrative: DEMO_NARRATIVE })
  }
  const supabase = supabaseServer()
  const { briefId } = await params

  const { data: brief } = await supabase
    .from('briefs')
    .select('*, issue_areas(name)')
    .eq('id', briefId)
    .single()

  const { data: codings } = await supabase
    .from('codings')
    .select('*, documents(title, organizations(name))')
    .eq('brief_id', briefId)
    .eq('addressed', true)

  const codingSummary = codings?.map((c: any) =>
    `Org: ${c.documents?.organizations?.name} | Question: ${c.topic_question}\nQuotes: ${JSON.stringify(c.quotes)}`
  ).join('\n\n') ?? ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Write a 1-2 page field landscape narrative for coalition coordinators based on these position codings.

Issue Area: ${(brief as any).issue_areas?.name}

Codings:
${codingSummary}

The narrative should:
- Identify where organizations cluster and agree
- Surface the live tensions and divergences
- Name which organizations are bridges between different camps
- Be written in plain, accessible prose (not academic)
- Be actionable for someone preparing for a coalition meeting

Write in markdown format.`
    }]
  })

  const narrative = (response.content[0] as any).text
  return NextResponse.json({ narrative })
}
