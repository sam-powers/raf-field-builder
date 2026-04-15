'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface CodebookQuestion {
  question: string
  guidance: string
  examples: string[]
}

interface Codebook {
  issue_area: string
  description: string
  version: number
  generated_at: string
  questions: CodebookQuestion[]
}

export default function CodebookPage() {
  const params = useParams()
  const briefId = params.briefId as string

  const [codebook, setCodebook] = useState<Codebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCodebook = async () => {
      const res = await fetch(`/api/briefs/${briefId}`)
      const data = await res.json()
      if (data.codebook_content) {
        setCodebook(data.codebook_content)
      } else {
        setError('Codebook not yet generated. Approve the brief first.')
      }
      setLoading(false)
    }
    fetchCodebook()
  }, [briefId])

  const downloadMarkdown = () => {
    if (!codebook) return

    const lines: string[] = [
      `# Codebook: ${codebook.issue_area}`,
      '',
      `**Description:** ${codebook.description}`,
      `**Version:** ${codebook.version}`,
      `**Generated:** ${new Date(codebook.generated_at).toLocaleDateString()}`,
      '',
      '---',
      '',
    ]

    codebook.questions.forEach((q, idx) => {
      lines.push(`## Question ${idx + 1}: ${q.question}`)
      lines.push('')
      lines.push(`**Guidance:** ${q.guidance}`)
      lines.push('')
      if (q.examples && q.examples.length > 0) {
        lines.push('**Example Quotes:**')
        q.examples.forEach(ex => {
          lines.push(`- "${ex}"`)
        })
      }
      lines.push('')
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codebook-${codebook.issue_area.toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
        <Link href={`/briefs/${briefId}`}>
          <Button variant="outline" className="mt-4">Back to Brief</Button>
        </Link>
      </div>
    )
  }

  if (!codebook) return null

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Codebook: {codebook.issue_area}</h2>
          <p className="text-slate-500 mt-1">{codebook.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Version {codebook.version}</Badge>
            <span className="text-xs text-slate-400">
              Generated {new Date(codebook.generated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/alignment/${briefId}`}>
            <Button variant="outline" size="sm">View Alignment</Button>
          </Link>
          <Button size="sm" onClick={downloadMarkdown}>
            Download Markdown
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {codebook.questions?.map((q, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Guidance</p>
                <p className="text-sm text-slate-700">{q.guidance}</p>
              </div>

              {q.examples && q.examples.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Example Quotes
                    </p>
                    <div className="space-y-2">
                      {q.examples.map((ex, ei) => (
                        <blockquote
                          key={ei}
                          className="border-l-2 border-blue-300 pl-4 text-sm text-slate-600 italic"
                        >
                          "{ex}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
