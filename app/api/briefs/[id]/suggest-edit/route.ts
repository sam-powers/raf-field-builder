import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import { isDemoMode } from '@/lib/demo'

const DEMO_SUGGESTED_CONTENT = `# Civil Service Reform: Field Brief for Coalition Members

## Overview

Member organizations share a common goal: a federal workforce that can recruit, retain, and empower talented people to serve the public. While approaches differ, the coalition agrees that the current system is too slow, too rigid, and too disconnected from modern talent needs. This brief maps where organizations align, where they diverge, and what that means for coalition strategy.

## Areas of Broad Consensus

**Hiring is broken — and everyone knows it.** The average federal hire taking 6–9 months is cited across virtually every member organization's position papers. This shared frustration is one of the coalition's strongest points of unity, and the most accessible entry point for public advocacy.

**Technical roles need different rules.** Organizations across the ideological spectrum agree that STEM, AI, and data skills require different recruitment and retention pathways than traditional civil service tracks. This isn't a controversial position — it's practical.

**Merit matters, but needs updating.** Nearly all member organizations support strengthening merit-based hiring. Where they differ is in defining what merit looks like in a modern context — skills testing, job-relevant assessments, or demonstrated track records.

## Areas of Divergence

**Civil service protections vs. accountability.** This is the sharpest dividing line. Some organizations argue that tenure protections are essential to guard against political pressure and preserve institutional knowledge. Others contend that those same protections shield poor performance and slow down agencies. Finding common ground requires careful, concrete framing.

**Centralized reform vs. agency flexibility.** Some organizations favor government-wide hiring standards; others point to successful agency-level experiments and argue for bottom-up change. Both have evidence on their side.

**The scope of political appointments.** Where to draw the line between career civil servants and political appointees remains contested, with real implications for how reform proposals are perceived across the coalition.

## Implications for Coalition Work

The coalition is best positioned to act together on hiring timelines and technical talent pathways — these have genuine cross-ideological support. Framing around "government effectiveness" and "public service capacity" resonates more broadly than either accountability-first or protection-first language.

On at-will employment and protections, the coalition may need to hold space for honest disagreement rather than forcing consensus. Focusing on shared process improvements — better performance feedback, clearer job descriptions, faster hiring — can move the field forward without requiring agreement on the hardest questions.

*This brief was prepared for coalition member organizations of the Recode America Fund.*`

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { comment } = await req.json()

  if (!comment?.trim()) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
  }

  if (isDemoMode) {
    await new Promise(r => setTimeout(r, 1800))
    return NextResponse.json({ suggested_content: DEMO_SUGGESTED_CONTENT })
  }

  const supabase = supabaseServer()
  const { id } = await params

  const { data: brief, error } = await supabase
    .from('briefs')
    .select('brief_content, issue_areas(name)')
    .eq('id', id)
    .single()

  if (error || !brief) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  if (!brief.brief_content) {
    return NextResponse.json({ error: 'No brief content to edit. Generate a brief first.' }, { status: 400 })
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are editing a policy field brief based on a reviewer's comment. Return the complete revised brief as markdown — not a diff, not a summary, just the full updated text.

Current brief:
${brief.brief_content}

Reviewer comment: "${comment}"

Apply the comment as a targeted edit. Preserve the overall structure, length, and tone unless the comment explicitly asks you to change them. Return only the revised markdown with no preamble or explanation.`,
    }],
  })

  const suggested_content = (response.content[0] as any).text
  return NextResponse.json({ suggested_content })
}
