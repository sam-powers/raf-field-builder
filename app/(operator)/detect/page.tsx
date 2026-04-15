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

export default function TopicsPage() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<BriefItem[]>([])
  const [loadingBriefs, setLoadingBriefs] = useState(true)

  // Detect
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
      // Filter out areas that already have briefs (fuzzy name match)
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

  const createBriefFromArea = async (area: DetectedArea) => {
    setCreating(area.name)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_name: area.name, area_description: area.description, topic_questions: [] }),
      })
      const brief = await res.json()
      if (brief.error) throw new Error(brief.error)
      router.push(`/briefs/${brief.id}`)
    } catch (err: any) {
      setDetectError(err.message || 'Failed to create topic')
    } finally {
      setCreating(null)
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
      router.push(`/briefs/${brief.id}`)
    } catch (err: any) {
      setDialogError(err.message)
    } finally {
      setAddingManual(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Topics</h2>
          <p className="text-slate-500 mt-1">Policy issue areas for coalition analysis</p>
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
                    onClick={() => createBriefFromArea(area)}
                    disabled={creating === area.name}
                  >
                    {creating === area.name ? 'Adding...' : 'Add to Topics'}
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
              <Link key={brief.id} href={`/briefs/${brief.id}`} className="block group">
                <Card className="flex flex-col h-full hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {brief.issue_areas?.name ?? 'Untitled'}
                      </CardTitle>
                      <Badge
                        variant={brief.brief_content ? 'default' : brief.approved_at ? 'secondary' : 'outline'}
                        className="shrink-0 text-xs"
                      >
                        {brief.brief_content ? 'Brief ready' : brief.approved_at ? 'Codebook ready' : 'Draft'}
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
              </Link>
            ))}
          </div>
        )}
      </div>

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
