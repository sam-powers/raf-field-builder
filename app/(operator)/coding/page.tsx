'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Brief {
  id: string
  batch_id: string | null
  approved_at: string
  issue_areas: { name: string }
}

interface CodingStatus {
  status: string
  request_counts?: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
  codings_saved?: number
}

export default function CodingPage() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [statuses, setStatuses] = useState<Record<string, CodingStatus>>({})
  const [error, setError] = useState<string | null>(null)

  const fetchBriefs = async () => {
    setLoading(true)
    const res = await fetch('/api/briefs')
    const data = await res.json()
    const approved = (Array.isArray(data) ? data : []).filter((b: any) => b.approved_at)
    setBriefs(approved)
    setLoading(false)
  }

  useEffect(() => { fetchBriefs() }, [])

  const pollStatus = useCallback(async (briefId: string) => {
    const res = await fetch(`/api/coding/${briefId}`)
    const data = await res.json()
    setStatuses(prev => ({ ...prev, [briefId]: data }))

    if (data.status === 'in_progress' || data.status === 'processing') {
      setTimeout(() => pollStatus(briefId), 5000)
    }
  }, [])

  const runCoding = async (briefId: string) => {
    setRunning(prev => ({ ...prev, [briefId]: true }))
    setError(null)
    try {
      const res = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief_id: briefId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Start polling
      pollStatus(briefId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRunning(prev => ({ ...prev, [briefId]: false }))
    }
  }

  const getStatusLabel = (status: CodingStatus) => {
    if (status.status === 'no_batch') return null
    if (status.status === 'in_progress' || status.status === 'processing') return 'Processing'
    if (status.status === 'ended') return 'Complete'
    return status.status
  }

  const getProgress = (status: CodingStatus) => {
    if (!status.request_counts) return 0
    const { processing, succeeded, errored, canceled, expired } = status.request_counts
    const total = processing + succeeded + errored + canceled + expired
    if (total === 0) return 0
    return Math.round((succeeded / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Coding Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Run async batch coding on approved briefs using Claude
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {briefs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No approved briefs yet.</p>
          <p className="text-sm mt-1">Approve a brief in the Briefs section first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {briefs.map(brief => {
            const status = statuses[brief.id]
            const statusLabel = status ? getStatusLabel(status) : null
            const progress = status ? getProgress(status) : 0

            return (
              <Card key={brief.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{brief.issue_areas?.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      {statusLabel && (
                        <Badge variant={statusLabel === 'Complete' ? 'default' : 'secondary'}>
                          {statusLabel}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => runCoding(brief.id)}
                        disabled={running[brief.id]}
                      >
                        {running[brief.id] ? 'Starting...' : brief.batch_id ? 'Re-run Coding' : 'Run Coding'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {status && status.status !== 'no_batch' && (
                  <CardContent className="pt-0 space-y-3">
                    {status.status === 'in_progress' || status.status === 'processing' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Processing batch...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : null}
                    <div className="flex gap-6 text-sm text-slate-600">
                      {status.request_counts && (
                        <>
                          <span>
                            <span className="font-medium text-green-600">{status.request_counts.succeeded}</span> succeeded
                          </span>
                          {status.request_counts.errored > 0 && (
                            <span>
                              <span className="font-medium text-red-600">{status.request_counts.errored}</span> errored
                            </span>
                          )}
                          {status.request_counts.processing > 0 && (
                            <span>
                              <span className="font-medium text-yellow-600">{status.request_counts.processing}</span> processing
                            </span>
                          )}
                        </>
                      )}
                      {status.codings_saved !== undefined && status.codings_saved > 0 && (
                        <span>
                          <span className="font-medium">{status.codings_saved}</span> codings saved
                        </span>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
