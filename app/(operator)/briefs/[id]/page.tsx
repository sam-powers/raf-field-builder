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

interface Brief {
  id: string
  version: number
  topic_questions: string[]
  approved_at: string | null
  brief_content: string | null
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

function relevanceLabel(score: number): { label: string; className: string } {
  if (score >= 0.80) return { label: 'High relevance', className: 'bg-green-100 text-green-800' }
  if (score >= 0.65) return { label: 'Relevant', className: 'bg-blue-100 text-blue-800' }
  return { label: 'Moderate match', className: 'bg-slate-100 text-slate-600' }
}

export default function BriefBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [brief, setBrief] = useState<Brief | null>(null)
  const [docs, setDocs] = useState<BriefDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [docsLoading, setDocsLoading] = useState(true)
  const [questions, setQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
  const [activeTab, setActiveTab] = useState('questions')

  const fetchBrief = useCallback(async () => {
    const res = await fetch(`/api/briefs/${id}`)
    const data = await res.json()
    setBrief(data)
    setQuestions(data.topic_questions ?? [])
    setLoading(false)
  }, [id])

  const fetchDocs = useCallback(async () => {
    setDocsLoading(true)
    const res = await fetch(`/api/briefs/${id}/documents`)
    const data = await res.json()
    setDocs(Array.isArray(data) ? data : [])
    setDocsLoading(false)
  }, [id])

  useEffect(() => {
    fetchBrief()
    fetchDocs()
  }, [fetchBrief, fetchDocs])

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

  const handleApprove = async () => {
    if (questions.length === 0) return setError('Add at least one topic question before approving')
    setApproving(true)
    setError(null)
    try {
      await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const res = await fetch(`/api/briefs/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await fetchBrief()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setApproving(false)
    }
  }

  const handleGenerateBrief = async () => {
    if (questions.length === 0) return setError('Add at least one topic question before generating a brief')
    setGenerating(true)
    setError(null)
    try {
      // Save questions first
      await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const res = await fetch(`/api/briefs/${id}/generate`, { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBrief(prev => prev ? { ...prev, brief_content: data.brief_content } : prev)
      setActiveTab('brief')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
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

  const includedCount = docs.filter(d => d.included).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link href="/detect" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-3">
          ← Topics
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{brief.issue_areas?.name}</h2>
              <Badge variant={brief.brief_content ? 'default' : brief.approved_at ? 'secondary' : 'outline'}>
                {brief.brief_content ? 'Brief ready' : brief.approved_at ? 'Codebook ready' : 'Draft'}
              </Badge>
            </div>
            {brief.issue_areas?.description && (
              <p className="text-slate-500">{brief.issue_areas.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {brief.approved_at && (
              <Link href={`/alignment/${id}`}>
                <Button variant="outline" size="sm">Alignment</Button>
              </Link>
            )}
            {brief.approved_at && (
              <Link href={`/codebook/${id}`}>
                <Button variant="ghost" size="sm" className="text-slate-500">Codebook</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="documents">
            Documents {includedCount > 0 && <span className="ml-1.5 text-xs text-slate-500">({includedCount})</span>}
          </TabsTrigger>
          <TabsTrigger value="brief">
            Brief {brief.brief_content && <span className="ml-1.5 text-xs text-green-600">✓</span>}
          </TabsTrigger>
        </TabsList>

        {/* Questions tab */}
        <TabsContent value="questions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                These questions will guide the analysis of each organization's position on this topic.
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
                <div className="ml-auto flex gap-2">
                  {!brief.approved_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleApprove}
                      disabled={approving}
                      className="text-slate-500"
                    >
                      {approving ? 'Generating codebook...' : 'Generate Codebook'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleGenerateBrief}
                    disabled={generating}
                  >
                    {generating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        Generating brief...
                      </span>
                    ) : brief.brief_content ? 'Regenerate Brief' : 'Generate Brief'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Document Bank</CardTitle>
                <p className="text-sm text-slate-500">
                  {includedCount} of {docs.length} included
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Documents are ranked by relevance to this topic. Toggle to include or exclude them from brief generation.
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

        {/* Brief tab */}
        <TabsContent value="brief" className="mt-6">
          {brief.brief_content ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Constituent-facing brief — suitable for sharing with coalition members
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateBrief}
                  disabled={generating}
                >
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
              <Button
                onClick={handleGenerateBrief}
                disabled={generating}
              >
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
