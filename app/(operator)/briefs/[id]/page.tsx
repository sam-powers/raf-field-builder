'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Brief {
  id: string
  version: number
  topic_questions: string[]
  approved_at: string | null
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
  const [error, setError] = useState<string | null>(null)

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
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
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
      // Save questions first
      await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_questions: questions }),
      })
      const res = await fetch(`/api/briefs/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      router.push(`/codebook/${id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setApproving(false)
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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">{brief.issue_areas?.name}</h2>
            <Badge variant={brief.approved_at ? 'default' : 'secondary'}>
              {brief.approved_at ? 'Approved' : 'Draft'}
            </Badge>
          </div>
          <p className="text-slate-500">{brief.issue_areas?.description}</p>
        </div>
        <div className="flex gap-2">
          {brief.approved_at && (
            <>
              <Link href={`/codebook/${id}`}>
                <Button variant="outline" size="sm">View Codebook</Button>
              </Link>
              <Link href={`/alignment/${id}`}>
                <Button variant="outline" size="sm">Alignment View</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Topic Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 text-sm w-5 shrink-0">{idx + 1}.</span>
                <span className="flex-1 text-sm text-slate-700 bg-slate-50 rounded px-3 py-2">{q}</span>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="text-slate-400 hover:text-red-500 text-xs px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a topic question..."
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addQuestion()}
            />
            <Button variant="outline" onClick={addQuestion}>Add</Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={saveQuestions} disabled={saving}>
              {saving ? 'Saving...' : 'Save Questions'}
            </Button>
            {!brief.approved_at && (
              <Button size="sm" onClick={handleApprove} disabled={approving}>
                {approving ? 'Approving & Generating Codebook...' : 'Approve & Generate Codebook'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Document Shortlist */}
      <Card>
        <CardHeader>
          <CardTitle>Document Shortlist</CardTitle>
        </CardHeader>
        <CardContent>
          {docsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
            </div>
          ) : docs.length === 0 ? (
            <p className="text-slate-500 text-sm">No documents matched. Upload documents first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Include</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map(doc => (
                  <TableRow key={doc.id} className={!doc.included ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      {doc.documents?.organizations?.name ?? '—'}
                    </TableCell>
                    <TableCell>{doc.documents?.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Math.round((doc.similarity_score ?? 0) * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={doc.included}
                        onCheckedChange={checked => toggleDoc(doc.document_id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
