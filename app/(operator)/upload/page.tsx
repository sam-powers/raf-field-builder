'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Organization {
  id: string
  name: string
}

export default function UploadPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [orgId, setOrgId] = useState('')
  const [newOrgName, setNewOrgName] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [useNewOrg, setUseNewOrg] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/organizations')
      .then(r => r.json())
      .then(data => setOrgs(Array.isArray(data) ? data : []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return setError('Title and file are required')
    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      let resolvedOrgId = orgId

      if (useNewOrg && newOrgName.trim()) {
        const orgRes = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newOrgName.trim() }),
        })
        const newOrg = await orgRes.json()
        if (newOrg.error) throw new Error(newOrg.error)
        resolvedOrgId = newOrg.id
        setOrgs(prev => [...prev, newOrg])
        setOrgId(newOrg.id)
        setUseNewOrg(false)
        setNewOrgName('')
      }

      if (!resolvedOrgId) return setError('Please select or create an organization')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('org_id', resolvedOrgId)
      formData.append('title', title)

      const res = await fetch('/api/ingest', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSuccess(`"${title}" uploaded and embedded successfully.`)
      setTitle('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href="/library" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-4">
          ← Document Library
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Upload Document</h2>
        <p className="text-slate-500 mt-1">Add a position paper or policy document from a coalition member organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Organization</Label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUseNewOrg(false)}
                  className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                    !useNewOrg
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Existing org
                </button>
                <button
                  type="button"
                  onClick={() => setUseNewOrg(true)}
                  className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                    useNewOrg
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  New org
                </button>
              </div>
              {useNewOrg ? (
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                />
              ) : (
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={orgId}
                  onChange={e => setOrgId(e.target.value)}
                >
                  <option value="">Select organization...</option>
                  {orgs.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="e.g. Civil Service Reform Position Paper 2024"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                ref={fileRef}
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-xs text-slate-500">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading & embedding...' : 'Upload Document'}
              </Button>
              <Link href="/library">
                <Button type="button" variant="outline">Back to Library</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
