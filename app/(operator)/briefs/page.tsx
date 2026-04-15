'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface BriefItem {
  id: string
  version: number
  approved_at: string | null
  created_at: string
  issue_areas: { name: string; description: string | null } | null
}

export default function BriefsPage() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<BriefItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [areaName, setAreaName] = useState('')
  const [areaDesc, setAreaDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBriefs = async () => {
    setLoading(true)
    const res = await fetch('/api/briefs')
    const data = await res.json()
    setBriefs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchBriefs() }, [])

  const handleCreate = async () => {
    if (!areaName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_name: areaName,
          area_description: areaDesc,
          topic_questions: [],
        }),
      })
      const brief = await res.json()
      if (brief.error) throw new Error(brief.error)
      setDialogOpen(false)
      setAreaName('')
      setAreaDesc('')
      router.push(`/briefs/${brief.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Briefs</h2>
          <p className="text-slate-500 mt-1">Policy analysis briefs for each issue area</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New Brief</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : briefs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No briefs yet.</p>
          <p className="text-sm mt-1">Detect issue areas first, or create a brief manually.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {briefs.map(brief => (
            <Card key={brief.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">
                    {brief.issue_areas?.name ?? 'Untitled'}
                  </CardTitle>
                  <Badge variant={brief.approved_at ? 'default' : 'secondary'} className="shrink-0">
                    {brief.approved_at ? 'Approved' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                {brief.issue_areas?.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {brief.issue_areas.description}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  v{brief.version} · Created {new Date(brief.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/briefs/${brief.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Open Brief
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brief</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Issue Area Name</Label>
              <Input
                placeholder="e.g. Civil Service Reform"
                value={areaName}
                onChange={e => setAreaName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this issue area..."
                value={areaDesc}
                onChange={e => setAreaDesc(e.target.value)}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !areaName.trim()}>
              {creating ? 'Creating...' : 'Create Brief'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
