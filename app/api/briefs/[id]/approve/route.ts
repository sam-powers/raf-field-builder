import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = supabaseServer()
  const { id } = await params

  const { data: brief } = await supabase
    .from('briefs')
    .select('*, issue_areas(*)')
    .eq('id', id)
    .single()

  // Get a sample of included docs for the codebook examples
  const { data: briefDocs } = await supabase
    .from('brief_documents')
    .select('documents(raw_text, title, organizations(name))')
    .eq('brief_id', id)
    .eq('included', true)
    .limit(5)

  const sampleTexts = briefDocs?.map((bd: any) =>
    `Organization: ${bd.documents?.organizations?.name}\nDocument: ${bd.documents?.title}\n\n${bd.documents?.raw_text?.slice(0, 2000)}`
  ).join('\n\n---\n\n') ?? ''

  const topicQuestions = (brief as any).topic_questions as string[]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Generate a codebook for this policy analysis brief.

Issue Area: ${(brief as any).issue_areas?.name}
Description: ${(brief as any).issue_areas?.description}

Topic Questions:
${topicQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Sample documents from corpus:
${sampleTexts}

For each topic question, provide:
1. A clear description of what counts as "addressing" this question
2. 2-3 example quotes from the sample documents that would count as addressing it (use real quotes if present)

Return as JSON: {
  "issue_area": "...",
  "description": "...",
  "version": 1,
  "generated_at": "...",
  "questions": [
    {
      "question": "...",
      "guidance": "What counts as addressing this question...",
      "examples": ["quote 1", "quote 2"]
    }
  ]
}`
    }]
  })

  const text = (response.content[0] as any).text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const codebook = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] }
  codebook.generated_at = new Date().toISOString()

  await supabase.from('briefs').update({
    approved_at: new Date().toISOString(),
    codebook_content: codebook,
  }).eq('id', id)

  return NextResponse.json({ ok: true, codebook })
}
