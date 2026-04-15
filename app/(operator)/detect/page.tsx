'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface DetectedArea {
  name: string
  description: string
}

export default function DetectPage() {
  const router = useRouter()
  const [areas, setAreas] = useState<DetectedArea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  const handleDetect = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/detect', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAreas(data.areas ?? [])
    } catch (err: any) {
      setError(err.message || 'Detection failed')
    } finally {
      setLoading(false)
    }
  }

  const updateArea = (idx: number, field: keyof DetectedArea, value: string) => {
    setAreas(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  }

  const handleCreateBrief = async (area: DetectedArea) => {
    setCreating(area.name)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_name: area.name,
          area_description: area.description,
          topic_questions: [],
        }),
      })
      const brief = await res.json()
      if (brief.error) throw new Error(brief.error)
      router.push(`/briefs/${brief.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create brief')
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Issue Area Detection</h2>
        <p className="text-slate-500 mt-1">
          Use Claude to identify policy issue areas across the document corpus
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleDetect} disabled={loading} size="lg">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Detecting Issue Areas...
            </span>
          ) : 'Detect Issue Areas from Corpus'}
        </Button>
        {loading && (
          <p className="text-sm text-slate-500">This may take 30-60 seconds...</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {areas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Detected {areas.length} Issue Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas.map((area, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    <Input
                      value={area.name}
                      onChange={e => updateArea(idx, 'name', e.target.value)}
                      className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <Textarea
                    value={area.description}
                    onChange={e => updateArea(idx, 'description', e.target.value)}
                    className="text-sm text-slate-600 resize-none border-slate-200"
                    rows={3}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    onClick={() => handleCreateBrief(area)}
                    disabled={creating === area.name}
                  >
                    {creating === area.name ? 'Creating...' : 'Create Brief'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
