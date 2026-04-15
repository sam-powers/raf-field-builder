'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface BriefItem {
  id: string
  approved_at: string | null
  created_at: string
  brief_content: string | null
  issue_areas: { name: string; description: string | null } | null
}

interface DetectedArea {
  name: string
  description: string
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

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

function relevanceLabel(score: number): { label: string; className: string } {
  if (score >= 0.80) return { label: 'High relevance', className: 'bg-green-100 text-green-800' }
  if (score >= 0.65) return { label: 'Relevant', className: 'bg-blue-100 text-blue-800' }
  return { label: 'Moderate match', className: 'bg-slate-100 text-slate-600' }
}

export default function WriteBriefPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'select' | 'define'>('select')

  // Select Topic state
  const [briefs, setBriefs] = useState<BriefItem[]>([])
  const [loadingBriefs, setLoadingBriefs] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [detectedAreas, setDetectedAreas] = useState<DetectedArea[]>([])
  const [detectError, setDetectError] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  // Manual add dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [areaName, setAreaName] = useState('')
  const [areaDesc, setAreaDesc] = useState('')
  const [addingManual, setAddingManual] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)

  // Define Analysis state
  const [selectedTopic, setSelectedTopic] = useState<DetectedArea | null>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [defineError, setDefineError] = useState<string | null>(null)
  const [runningAnalysis, setRunningAnalysis] = useState(false)

  // Documents for Define Analysis tab (loaded after brief created or all docs)
  const [defineDocs, setDefineDocs] = useState<BriefDoc[]>([])
  const [defineDocsLoading, setDefineDocsLoading] = useState(false)
  const [createdBriefId, setCreatedBriefId] = useState<string | null>(null)

  const fetchBriefs = async () => {
    setLoadingBriefs(true)
    const res = await fetch('/api/briefs')
    const data = await res.json()
    setBriefs(Array.isArray(data) ? data : [])
    setLoadingBriefs(false)
  }

  useEffect(() => { fetchBriefs() }, [])

  const existingNames = briefs.map(b => b.issue_areas?.name?.toLowerCase().trim() ?? '')

  const handleDetect = async () => {
    setDetecting(true)
    setDetectError(null)
    setDetectedAreas([])
    try {
      const res = await fetch('/api/detect', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const newAreas = (data.areas ?? []).filter(
        (a: DetectedArea) => !existingNames.includes(a.name.toLowerCase().trim())
      )
      setDetectedAreas(newAreas)
    } catch (err: any) {
      setDetectError(err.message || 'Detection failed')
    } finally {
      setDetecting(false)
    }
  }

  const updateDetectedArea = (idx: number, field: keyof DetectedArea, value: string) => {
    setDetectedAreas(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  }

  // Instead of creating the brief immediately, switch to Define Analysis tab
  const handleCreateBrief = (area: DetectedArea) => {
    setSelectedTopic(area)
    setQuestions([])
    setNewQuestion('')
    setDefineError(null)
    setCreatedBriefId(null)
    setDefineDocs([])
    setActiveTab('define')
  }

  // For existing topic cards — also switch to define tab
  const handleExistingTopicClick = (brief: BriefItem) => {
    if (!brief.issue_areas) return
    setSelectedTopic({ name: brief.issue_areas.name, description: brief.issue_areas.description ?? '' })
    setQuestions([])
    setNewQuestion('')
    setDefineError(null)
    setCreatedBriefId(brief.id)
    // Load documents for existing brief
    fetchDefineDocsForBrief(brief.id)
    setActiveTab('define')
  }

  const fetchDefineDocsForBrief = async (briefId: string) => {
    setDefineDocsLoading(true)
    try {
      const res = await fetch(`/api/briefs/${briefId}/documents`)
      const data = await res.json()
      setDefineDocs(Array.isArray(data) ? data : [])
    } catch {
      setDefineDocs([])
    } finally {
      setDefineDocsLoading(false)
    }
  }

  const handleAddManual = async () => {
    if (!areaName.trim()) return
    setAddingManual(true)
    setDialogError(null)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_name: areaName, area_description: areaDesc, topic_questions: [] }),
      })
      const brief = await res.json()
      if (brief.error) throw new Error(brief.error)
      setDialogOpen(false)
      setAreaName('')
      setAreaDesc('')
      // Switch to define tab with the new topic
      handleCreateBrief({ name: areaName, description: areaDesc })
      setCreatedBriefId(brief.id)
      fetchDefineDocsForBrief(brief.id)
      await fetchBriefs()
    } catch (err: any) {
      setDialogError(err.message)
    } finally {
      setAddingManual(false)
    }
  }

  // Define Analysis tab handlers
  const addQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions(prev => [...prev, newQuestion.trim()])
    setNewQuestion('')
  }

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleDefineDoc = (docId: string, included: boolean) => {
    setDefineDocs(prev => prev.map(d => d.document_id === docId ? { ...d, included } : d))
  }

  const handleRunAnalysis = async () => {
    if (!selectedTopic) return
    setRunningAnalysis(true)
    setDefineError(null)

    if (DEMO_MODE) {
      // Demo: fake 1.5s loading then navigate to brief-1
      setTimeout(() => {
        router.push('/briefs/brief-1')
      }, 1500)
      return
    }

    try {
      // 1. Create brief if not yet created
      let briefId = createdBriefId
      if (!briefId) {
        const res = await fetch('/api/briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            area_name: selectedTopic.name,
            area_description: selectedTopic.description,
            topic_questions: questions,
          }),
        })
        const brief = await res.json()
        if (brief.error) throw new Error(brief.error)
        briefId = brief.id
      } else {
        // Update questions on existing brief
        await fetch(`/api/briefs/${briefId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_questions: questions }),
        })
        // Sync doc include/exclude state
        for (const doc of defineDocs) {
          await fetch(`/api/briefs/${briefId}/documents`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document_id: doc.document_id, included: doc.included }),
          })
        }
      }

      // 2. Run coding
      const codingRes = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief_id: briefId }),
      })
      const codingData = await codingRes.json()
      if (codingData.error) throw new Error(codingData.error)

      // 3. Navigate to brief page
      router.push(`/briefs/${briefId}`)
    } catch (err: any) {
      setDefineError(err.message || 'Analysis failed')
      setRunningAnalysis(false)
    }
  }

  const includedCount = defineDocs.filter(d => d.included).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Write Brief</h2>
        <p className="text-slate-500 mt-1">Detect topics and define analysis questions</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'define')}>
        <TabsList>
          <TabsTrigger value="select">Select Topic</TabsTrigger>
          <TabsTrigger value="define" disabled={!selectedTopic && activeTab !== 'define'}>
            Define Analysis
          </TabsTrigger>
        </TabsList>

        {/* SELECT TOPIC TAB */}
        <TabsContent value="select" className="mt-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Choose a topic to build a coalition brief around</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  Add Topic
                </Button>
                <Button onClick={handleDetect} disabled={detecting}>
                  {detecting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Detecting...
                    </span>
                  ) : 'Detect from Corpus'}
                </Button>
              </div>
            </div>

            {detecting && (
              <p className="text-sm text-slate-500">
                Analyzing document corpus with Claude — this may take 30–60 seconds...
              </p>
            )}

            {detectError && <p className="text-sm text-red-600">{detectError}</p>}

            {/* Detected new areas (staging) */}
            {detectedAreas.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    New topics detected
                  </h3>
                  <Badge variant="secondary">{detectedAreas.length}</Badge>
                </div>
                <p className="text-sm text-slate-500 -mt-2">
                  Edit names or descriptions before adding to your topics list.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectedAreas.map((area, idx) => (
                    <Card key={idx} className="border-blue-100 bg-blue-50/30">
                      <CardHeader className="pb-2">
                        <Input
                          value={area.name}
                          onChange={e => updateDetectedArea(idx, 'name', e.target.value)}
                          className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                        />
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Textarea
                          value={area.description}
                          onChange={e => updateDetectedArea(idx, 'description', e.target.value)}
                          className="text-sm text-slate-600 resize-none border-slate-200 bg-white"
                          rows={2}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button
                          size="sm"
                          onClick={() => handleCreateBrief(area)}
                          disabled={creating === area.name}
                        >
                          {creating === area.name ? 'Adding...' : 'Create Brief'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Existing topics */}
            <div className="space-y-4">
              {briefs.length > 0 && (
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Your topics
                </h3>
              )}

              {loadingBriefs ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                </div>
              ) : briefs.length === 0 && detectedAreas.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-500">No topics yet.</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Detect topics from your document corpus, or add one manually.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {briefs.map(brief => (
                    <button
                      key={brief.id}
                      onClick={() => handleExistingTopicClick(brief)}
                      className="block group text-left"
                    >
                      <Card className="flex flex-col h-full hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-tight group-hover:text-blue-600 transition-colors">
                              {brief.issue_areas?.name ?? 'Untitled'}
                            </CardTitle>
                            <Badge
                              variant={brief.brief_content ? 'default' : 'outline'}
                              className="shrink-0 text-xs"
                            >
                              {brief.brief_content ? 'Brief ready' : 'Draft'}
                            </Badge>
                          </div>
                        </CardHeader>
                        {brief.issue_areas?.description && (
                          <CardContent className="pb-3 flex-1">
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {brief.issue_areas.description}
                            </p>
                          </CardContent>
                        )}
                        <CardFooter className="pt-0">
                          <p className="text-xs text-slate-400">
                            Created {new Date(brief.created_at).toLocaleDateString()}
                          </p>
                        </CardFooter>
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* DEFINE ANALYSIS TAB */}
        <TabsContent value="define" className="mt-6">
          {!selectedTopic ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-500">Select a topic first.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('select')}
              >
                Go to Select Topic
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Topic header */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Issue Area</p>
                <h3 className="text-lg font-semibold text-slate-900">{selectedTopic.name}</h3>
                {selectedTopic.description && (
                  <p className="text-sm text-slate-500 mt-1">{selectedTopic.description}</p>
                )}
              </div>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Topic Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">
                    These questions will guide analysis of each organization's position on this topic.
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
                </CardContent>
              </Card>

              {/* Document selector */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Document Selection</CardTitle>
                    {defineDocs.length > 0 && (
                      <p className="text-sm text-slate-500">
                        {includedCount} of {defineDocs.length} included
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!createdBriefId ? (
                    <p className="text-sm text-slate-400 italic">
                      Documents will load after the brief is created. Run Analysis to proceed.
                    </p>
                  ) : defineDocsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
                    </div>
                  ) : defineDocs.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No documents matched. <Link href="/upload" className="text-blue-600 hover:underline">Upload documents</Link> first.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500 mb-4">
                        Documents ranked by relevance. Toggle to include or exclude from analysis.
                      </p>
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
                          {defineDocs.map(doc => {
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
                                    onCheckedChange={checked => toggleDefineDoc(doc.document_id, checked)}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>

              {defineError && <p className="text-sm text-red-600">{defineError}</p>}

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleRunAnalysis}
                  disabled={runningAnalysis}
                >
                  {runningAnalysis ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Running Analysis...
                    </span>
                  ) : 'Run Analysis'}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Manual add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input
                placeholder="e.g. Civil Service Reform"
                value={areaName}
                onChange={e => setAreaName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddManual()}
              />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                placeholder="Brief description of this policy area..."
                value={areaDesc}
                onChange={e => setAreaDesc(e.target.value)}
                rows={3}
              />
            </div>
            {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManual} disabled={addingManual || !areaName.trim()}>
              {addingManual ? 'Adding...' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
