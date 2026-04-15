'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Brief {
  id: string
  version: number
  topic_questions: string[]
  approved_at: string | null
  brief_content: string | null
  codebook_content: Record<string, unknown> | null
  issue_areas: { id: string; name: string; description: string | null }
}

interface BriefDoc {
  id: string
  document_id: string
  similarity_score: number
  included: boolean
  documents: {
    id: string
    title: string
    submitted_at: string
    organizations: { name: string } | null
  }
}

interface Quote {
  text: string
  context: string
}

interface Coding {
  id: string
  document_id: string
  brief_id: string
  topic_question: string
  addressed: boolean
  quotes: Quote[]
  documents: {
    id: string
    title: string
    organizations: { name: string } | null
  }
}

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function relevanceLabel(score: number): { label: string; className: string } {
  if (score >= 0.80) return { label: 'High relevance', className: 'bg-green-100 text-green-800' }
  if (score >= 0.65) return { label: 'Relevant', className: 'bg-blue-100 text-blue-800' }
  return { label: 'Moderate match', className: 'bg-slate-100 text-slate-600' }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BriefTab({ brief, id, onBriefGenerated }: {
  brief: Brief
  id: string
  onBriefGenerated: (content: string) => void
}) {
  const [questions, setQuestions] = useState<string[]>(brief.topic_questions ?? [])
  const [newQuestion, setNewQuestion] = useState('')
  const [docs, setDocs] = useState<BriefDoc[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
  const [innerTab, setInnerTab] = useState('questions')

  const fetchDocs = useCallback(async () => {
    setDocsLoading(true)
    const res = await fetch(`/api/briefs/${id}/documents`)
    const data = await res.json()
    setDocs(Array.isArray(data) ? data : [])
    setDocsLoading(false)
  }, [id])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const includedCount = docs.filter(d => d.included).length

  const addQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions(prev => [...prev, newQuestion.trim()])
    setNewQuestion('')
  }

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const saveQuestions = async () => {
    setSaving(true)
    setError(null)
    setSavedOk(false)
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleDoc = async (docId: string, included: boolean) => {
    setDocs(prev => prev.map(d => d.document_id === docId ? { ...d, included } : d))
    await fetch(`/api/briefs/${id}/documents`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: docId, included }),
    })
  }

  const handleGenerateBrief = async () => {
    if (questions.length === 0) return setError('Add at least one topic question before generating a brief')
    setGenerating(true)
    setError(null)
    try {
      await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const res = await fetch(`/api/briefs/${id}/generate`, { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onBriefGenerated(data.brief_content)
      setInnerTab('narrative')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="documents">
            Documents {includedCount > 0 && <span className="ml-1.5 text-xs text-slate-500">({includedCount})</span>}
          </TabsTrigger>
          <TabsTrigger value="narrative">
            Narrative {brief.brief_content && <span className="ml-1.5 text-xs text-green-600">✓</span>}
          </TabsTrigger>
        </TabsList>

        {/* Questions */}
        <TabsContent value="questions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                These questions guide the analysis of each organization's position on this topic.
              </p>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 text-sm w-5 shrink-0 pt-2">{idx + 1}.</span>
                    <span className="flex-1 text-sm text-slate-700 bg-slate-50 rounded px-3 py-2 leading-snug">
                      {q}
                    </span>
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="text-slate-300 hover:text-red-500 text-sm px-2 pt-1.5 transition-colors"
                      title="Remove question"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-sm text-slate-400 py-2">No questions yet. Add some below.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Does the org support merit-based hiring reforms?"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addQuestion()}
                />
                <Button variant="outline" onClick={addQuestion} className="shrink-0">Add</Button>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={saveQuestions} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Questions'}
                </Button>
                {savedOk && <span className="text-sm text-green-600">Saved</span>}
                <div className="ml-auto">
                  <Button size="sm" onClick={handleGenerateBrief} disabled={generating}>
                    {generating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        Generating...
                      </span>
                    ) : brief.brief_content ? 'Regenerate Brief' : 'Generate Brief'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Document Bank</CardTitle>
                <p className="text-sm text-slate-500">{includedCount} of {docs.length} included</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Documents ranked by relevance. Toggle to include or exclude from brief generation.
              </p>
              {docsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
                </div>
              ) : docs.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No documents matched. <Link href="/upload" className="text-blue-600 hover:underline">Upload documents</Link> first.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Relevance</TableHead>
                      <TableHead>Include</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map(doc => {
                      const rel = relevanceLabel(doc.similarity_score ?? 0)
                      return (
                        <TableRow key={doc.id} className={!doc.included ? 'opacity-40' : ''}>
                          <TableCell className="font-medium text-slate-700">
                            {doc.documents?.organizations?.name ?? '—'}
                          </TableCell>
                          <TableCell className="text-slate-700">{doc.documents?.title}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${rel.className}`}>
                              {rel.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={doc.included}
                              onCheckedChange={checked => toggleDoc(doc.document_id, checked)}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Narrative */}
        <TabsContent value="narrative" className="mt-6">
          {brief.brief_content ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Constituent-facing brief — suitable for sharing with coalition members
                </p>
                <Button size="sm" variant="outline" onClick={handleGenerateBrief} disabled={generating}>
                  {generating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </div>
              <div className="border border-slate-200 rounded-lg p-8 bg-white prose prose-slate max-w-none">
                <ReactMarkdown>{brief.brief_content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-600 font-medium mb-1">No brief generated yet</p>
              <p className="text-sm text-slate-400 mb-6">
                Add questions and select documents, then generate a constituent-facing brief.
              </p>
              <Button onClick={handleGenerateBrief} disabled={generating}>
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating brief...
                  </span>
                ) : 'Generate Brief'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlignmentTab({ id }: { id: string }) {
  const [codings, setCodings] = useState<Coding[]>([])
  const [briefName, setBriefName] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [reportOpen, setReportOpen] = useState(false)
  const [narrative, setNarrative] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [sideBySideOrg1, setSideBySideOrg1] = useState('')
  const [sideBySideOrg2, setSideBySideOrg2] = useState('')
  const [innerTab, setInnerTab] = useState('questions')

  useEffect(() => {
    const fetchData = async () => {
      const [codingsRes, briefRes] = await Promise.all([
        fetch(`/api/codings/${id}`),
        fetch(`/api/briefs/${id}`),
      ])
      const codingsData = await codingsRes.json()
      const briefData = await briefRes.json()
      setCodings(Array.isArray(codingsData) ? codingsData : [])
      setBriefName(briefData?.issue_areas?.name ?? 'Brief')
      setLoading(false)
    }
    fetchData()
  }, [id])

  const questions = Array.from(new Set(codings.map(c => c.topic_question)))
  const orgs = Array.from(new Set(
    codings.map(c => c.documents?.organizations?.name).filter(Boolean)
  )) as string[]

  const codingMap = new Map<string, Map<string, Coding>>()
  for (const coding of codings) {
    const org = coding.documents?.organizations?.name ?? ''
    if (!codingMap.has(org)) codingMap.set(org, new Map())
    codingMap.get(org)!.set(coding.topic_question, coding)
  }

  const toggleQuestion = (q: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(q)) next.delete(q)
      else next.add(q)
      return next
    })
  }

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await fetch(`/api/report/${id}`, { method: 'POST' })
      const data = await res.json()
      setNarrative(data.narrative ?? '')
      setReportOpen(true)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingReport(false)
    }
  }

  const getSideBySideData = (orgName: string) => {
    return questions.map(q => ({
      question: q,
      coding: codingMap.get(orgName)?.get(q) ?? null,
    }))
  }

  const copyNarrative = () => {
    navigator.clipboard.writeText(narrative)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          {orgs.length} organizations · {questions.length} questions
        </p>
        <Button onClick={generateReport} disabled={generatingReport} variant="outline" size="sm">
          {generatingReport ? 'Generating...' : 'Generate Field Narrative'}
        </Button>
      </div>

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList>
          <TabsTrigger value="questions">Question View</TabsTrigger>
          <TabsTrigger value="sidebyside">Side by Side</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          {codings.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p>No codings yet.</p>
              <p className="text-sm mt-1">Run analysis from the Write Brief flow first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qi) => {
                const addressedOrgs = orgs.filter(org => codingMap.get(org)?.get(q)?.addressed)
                const notAddressedOrgs = orgs.filter(org => !codingMap.get(org)?.get(q)?.addressed)
                const isExpanded = expandedQuestions.has(q)

                return (
                  <Card key={qi} className="overflow-hidden">
                    <CardHeader
                      className="pb-3 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                      onClick={() => addressedOrgs.length > 0 && toggleQuestion(q)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 text-sm font-medium shrink-0 mt-0.5">Q{qi + 1}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium text-slate-800 leading-snug mb-2">
                            {q}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-500">
                              {addressedOrgs.length} of {orgs.length} orgs addressed this
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {addressedOrgs.map(org => (
                                <Badge key={org} className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                  {org}
                                </Badge>
                              ))}
                              {notAddressedOrgs.map(org => (
                                <Badge key={org} variant="outline" className="text-xs text-slate-400 border-slate-200">
                                  {org}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {addressedOrgs.length > 0 && (
                          <span className="text-slate-400 text-xs shrink-0 mt-0.5">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    {isExpanded && addressedOrgs.length > 0 && (
                      <CardContent className="pt-0 border-t border-slate-100">
                        <div className="space-y-4 pt-4">
                          {addressedOrgs.map(org => {
                            const coding = codingMap.get(org)?.get(q)
                            const quotes = coding?.quotes ?? []
                            return (
                              <div key={org}>
                                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">{org}</p>
                                {quotes.slice(0, 2).map((quote, qi2) => (
                                  <div key={qi2} className="mb-2">
                                    <blockquote className="border-l-2 border-blue-300 pl-3 text-sm text-slate-700 italic">
                                      "{quote.text}"
                                    </blockquote>
                                    {quote.context && (
                                      <p className="text-xs text-slate-400 pl-3 mt-0.5">{quote.context}</p>
                                    )}
                                  </div>
                                ))}
                                {quotes.length === 0 && (
                                  <p className="text-xs text-slate-400 italic">Addressed but no specific quotes extracted.</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sidebyside" className="mt-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Organization 1</label>
                <select
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={sideBySideOrg1}
                  onChange={e => setSideBySideOrg1(e.target.value)}
                >
                  <option value="">Select org...</option>
                  {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Organization 2</label>
                <select
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={sideBySideOrg2}
                  onChange={e => setSideBySideOrg2(e.target.value)}
                >
                  <option value="">Select org...</option>
                  {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {sideBySideOrg1 && sideBySideOrg2 && (
              <div className="grid grid-cols-2 gap-4">
                {[sideBySideOrg1, sideBySideOrg2].map(org => (
                  <div key={org}>
                    <h3 className="font-semibold text-slate-800 mb-3">{org}</h3>
                    <div className="space-y-4">
                      {getSideBySideData(org).map(({ question, coding }, idx) => (
                        <Card key={idx} className="text-sm">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-slate-500 leading-snug">
                              {question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            {coding?.addressed && coding.quotes.length > 0 ? (
                              <div className="space-y-2">
                                {coding.quotes.slice(0, 2).map((q, qi) => (
                                  <blockquote key={qi} className="border-l-2 border-green-400 pl-3 text-slate-600 text-xs italic">
                                    "{q.text}"
                                    <p className="not-italic text-slate-400 mt-1">{q.context}</p>
                                  </blockquote>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-xs">Not addressed</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Field Narrative: {briefName}</DialogTitle>
              <Button variant="outline" size="sm" onClick={copyNarrative} className="ml-4 shrink-0">
                Copy
              </Button>
            </div>
          </DialogHeader>
          <Separator />
          <div className="prose prose-slate prose-sm max-w-none mt-2">
            <ReactMarkdown>{narrative}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CodeBookTab({ brief }: { brief: Brief }) {
  const codebook = brief.codebook_content as Codebook | null

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
        q.examples.forEach(ex => { lines.push(`- "${ex}"`) })
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

  if (!codebook) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-600 mb-2">Codebook not yet generated.</p>
        <p className="text-sm text-slate-400">Finalize the brief to generate a codebook.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">Version {codebook.version}</Badge>
            <span className="text-xs text-slate-400">
              Generated {new Date(codebook.generated_at).toLocaleDateString()}
            </span>
          </div>
          {codebook.description && (
            <p className="text-sm text-slate-500 mt-2">{codebook.description}</p>
          )}
        </div>
        <Button size="sm" onClick={downloadMarkdown}>
          Download Markdown
        </Button>
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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function BriefPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('brief')
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeToast, setFinalizeToast] = useState<string | null>(null)

  const fetchBrief = useCallback(async () => {
    const res = await fetch(`/api/briefs/${id}`)
    const data = await res.json()
    setBrief(data)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  const handleBriefGenerated = (content: string) => {
    setBrief(prev => prev ? { ...prev, brief_content: content } : prev)
  }

  const handleFinalize = async () => {
    if (!brief) return
    setFinalizing(true)

    if (DEMO_MODE) {
      // Demo: just update local state
      setBrief(prev => prev ? { ...prev, approved_at: new Date().toISOString() } : prev)
      setFinalizeToast('Brief finalized successfully!')
      setTimeout(() => setFinalizeToast(null), 3000)
      setFinalizing(false)
      return
    }

    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_at: new Date().toISOString() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBrief(prev => prev ? { ...prev, approved_at: data.approved_at ?? new Date().toISOString() } : prev)
      setFinalizeToast('Brief finalized successfully!')
      setTimeout(() => setFinalizeToast(null), 3000)
    } catch (err: any) {
      setFinalizeToast(`Error: ${err.message}`)
      setTimeout(() => setFinalizeToast(null), 4000)
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  if (!brief) return <p className="text-red-600">Brief not found</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/detect" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-3">
          ← Write Brief
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{brief.issue_areas?.name}</h2>
              <Badge variant={brief.brief_content ? 'default' : 'outline'}>
                {brief.brief_content ? 'Brief ready' : 'Draft'}
              </Badge>
              {brief.approved_at && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Finalized ✓</Badge>
              )}
            </div>
            {brief.issue_areas?.description && (
              <p className="text-slate-500">{brief.issue_areas.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Three main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="alignment">Alignment View</TabsTrigger>
          <TabsTrigger value="codebook">Code Book</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="mt-6">
          <BriefTab brief={brief} id={id} onBriefGenerated={handleBriefGenerated} />
        </TabsContent>

        <TabsContent value="alignment" className="mt-6">
          <AlignmentTab id={id} />
        </TabsContent>

        <TabsContent value="codebook" className="mt-6">
          <CodeBookTab brief={brief} />
        </TabsContent>
      </Tabs>

      {/* Finalize section — always visible, outside tabs */}
      <div className="border-t border-slate-200 pt-6">
        {finalizeToast && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            finalizeToast.startsWith('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {finalizeToast}
          </div>
        )}
        {brief.approved_at ? (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm px-3 py-1">
              Finalized ✓
            </Badge>
            <span className="text-sm text-slate-500">
              Finalized on {new Date(brief.approved_at).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              onClick={handleFinalize}
              disabled={finalizing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {finalizing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Finalizing...
                </span>
              ) : 'Finalize Brief'}
            </Button>
            <p className="text-sm text-slate-500">
              Finalizing will lock this brief and add it to the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
