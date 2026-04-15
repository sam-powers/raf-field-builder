import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { extractText } from '@/lib/extract'
import { embed } from '@/lib/voyage'

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const orgId = formData.get('org_id') as string
  const title = formData.get('title') as string

  const buffer = Buffer.from(await file.arrayBuffer())
  const rawText = await extractText(buffer)
  const embedding = await embed(rawText.slice(0, 8000))

  const { data: uploadData } = await supabase.storage
    .from('documents')
    .upload(`${Date.now()}-${file.name}`, buffer, { contentType: file.type })

  const { data, error } = await supabase.from('documents').insert({
    org_id: orgId,
    title,
    file_path: uploadData?.path,
    raw_text: rawText,
    embedding: JSON.stringify(embedding),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
