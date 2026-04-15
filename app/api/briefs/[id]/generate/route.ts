import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'
import { isDemoMode } from '@/lib/demo'

const DEMO_BRIEF_CONTENT = `# Civil Service Reform: Field Brief for Coalition Members

## Overview

Coalition member organizations share a common commitment to improving the federal civil service, though they approach the challenge from different angles — from technology modernization to workforce classification to democratic accountability. This brief maps out where organizations align, where they diverge, and what it means for coalition strategy.

## Areas of Broad Consensus

**Merit must be restored and modernized.** Nearly all member organizations support returning to merit-based hiring principles, though they differ on what "merit" means in practice. There is wide agreement that the current system is broken — too slow, too siloed, and too disconnected from actual job requirements.

**Hiring timelines are a crisis.** The average federal hire taking 6–9 months is cited across virtually every position paper as a root cause of the government's talent crisis. This is one of the strongest points of coalition unity.

**Technical and scientific talent needs special pathways.** Organizations spanning the ideological spectrum agree that STEM, AI, and data skills require different recruitment and retention approaches than traditional civil service tracks.

## Areas of Divergence

**At-will employment vs. civil service protections.** This is the sharpest fault line in the coalition. Some organizations advocate for significantly curtailing tenure protections to improve accountability; others argue that protections are essential to guard against politicization and ensure continuity of expertise. Bridging this divide will require careful framing.

**The role of political appointments.** Organizations differ on where to draw the line between career civil servants and political appointees. Some favor expanding the career service; others support a larger politically accountable layer at agency leadership.

**Centralization vs. agency flexibility.** Some organizations argue for government-wide reform frameworks; others advocate for agency-by-agency modernization, pointing to state-level experiments as models.

## Implications for Coalition Work

Organizations are best positioned to act together on hiring reform and workforce classification — areas with genuine cross-ideological consensus. Narrative framing around "capacity" and "effectiveness" tends to land better across the coalition than framing around either accountability or protection.

On at-will employment and protections, the coalition may need to agree to disagree, or find middle-ground proposals (e.g., improved performance management that stops short of eliminating protections).

*This brief was prepared for coalition member organizations of the Recode America Fund.*`

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isDemoMode) {
    await new Promise(r => setTimeout(r, 2000))
    return NextResponse.json({ brief_content: DEMO_BRIEF_CONTENT })
  }

  const supabase = supabaseServer()
  const { id } = await params

  // Fetch brief with issue area
  const { data: brief, error: briefError } = await supabase
    .from('briefs')
    .select('*, issue_areas(*)')
    .eq('id', id)
    .single()

  if (briefError || !brief) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  // Fetch included documents with raw text and org info
  const { data: briefDocs } = await supabase
    .from('brief_documents')
    .select('documents(raw_text, title, organizations(name))')
    .eq('brief_id', id)
    .eq('included', true)

  if (!briefDocs || briefDocs.length === 0) {
    return NextResponse.json({ error: 'No documents included. Add documents in the Documents tab first.' }, { status: 400 })
  }

  const topicQuestions: string[] = brief.topic_questions ?? []
  if (topicQuestions.length === 0) {
    return NextResponse.json({ error: 'No topic questions found. Add questions in the Questions tab first.' }, { status: 400 })
  }

  // Build document summaries (truncate to fit context)
  const docSummaries = briefDocs.map((bd: any) => {
    const org = bd.documents?.organizations?.name ?? 'Unknown Organization'
    const title = bd.documents?.title ?? 'Untitled'
    const text = bd.documents?.raw_text?.slice(0, 3000) ?? ''
    return `## ${org}: "${title}"\n\n${text}`
  }).join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are writing a field brief for member organizations of a policy coalition coordinated by the Recode America Fund (RAF). The brief is for the constituent organizations — not for internal RAF staff. It should be accessible, clear, and useful to a policy staffer at any of the member organizations, regardless of their technical background or ideological orientation.

Issue Area: ${brief.issue_areas?.name}
Description: ${brief.issue_areas?.description ?? ''}

Analysis Questions:
${topicQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Source Documents:
${docSummaries}

Write a field brief in markdown format that:
1. Opens with a brief overview of the issue area and why it matters to the coalition
2. Identifies 2-4 areas of broad consensus across organizations, citing specific positions with quotes where available
3. Identifies 2-3 meaningful points of divergence, explaining the different perspectives fairly
4. Closes with implications for coalition strategy — where orgs can act together, where they may need to agree to disagree

Use plain, accessible prose. Avoid jargon. Attribute positions to specific organizations by name. Use markdown headers (##) for sections. The brief should be 600–900 words.

End with a brief attribution line: *This brief was prepared for coalition member organizations of the Recode America Fund.*`
    }]
  })

  const brief_content = (response.content[0] as any).text

  // Save to DB
  await supabase
    .from('briefs')
    .update({ brief_content })
    .eq('id', id)

  return NextResponse.json({ brief_content })
}
