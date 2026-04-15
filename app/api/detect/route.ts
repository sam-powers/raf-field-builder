import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { anthropic } from '@/lib/anthropic'

export async function POST() {
  const supabase = supabaseServer()
  const { data: docs } = await supabase.from('documents').select('id, title, raw_text, organizations(name)')

  const corpus = docs?.map((d: any) =>
    `Organization: ${d.organizations?.name}\nDocument: ${d.title}\n\n${d.raw_text?.slice(0, 3000)}`
  ).join('\n\n---\n\n') ?? ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    thinking: { type: 'enabled', budget_tokens: 8000 },
    messages: [{
      role: 'user',
      content: `Here are position papers from member organizations in a government capacity coalition:\n\n${corpus}\n\nIdentify 5-10 distinct policy issue areas these organizations address. For each, give a short name and 1-2 sentence description.\n\nReturn ONLY a JSON array: [{"name": "...", "description": "..."}]`
    }]
  })

  const textBlock = response.content.find((b: any) => b.type === 'text')
  const text = (textBlock as any)?.text ?? ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const areas = jsonMatch ? JSON.parse(jsonMatch[0]) : []

  return NextResponse.json({ areas })
}
