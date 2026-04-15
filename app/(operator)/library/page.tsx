'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DocumentRow {
  id: string
  title: string
  submitted_at: string
  embedding: string | null
  organizations: { name: string } | null
}

interface Organization {
  id: string
  name: string
}

export default function LibraryPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [orgId, setOrgId] = useState('')
  const [newOrgName, setNewOrgName] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [useNewOrg, setUseNewOrg] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [docsRes, orgsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/organizations'),
      ])
      const docsData = await docsRes.json()
      const orgsData = await orgsRes.json()
      setDocs(Array.isArray(docsData) ? docsData : [])
      setOrgs(Array.isArray(orgsData) ? orgsData : [])
    } catch (e) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

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
      }

      if (!resolvedOrgId) return setError('Please select or create an organization')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('org_id', resolvedOrgId)
      formData.append('title', title)

      const res = await fetch('/api/ingest', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSuccess('Document uploaded and embedded successfully')
      setTitle('')
      setFile(null)
      setNewOrgName('')
      if (fileRef.current) fileRef.current.value = ''
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Document Library</h2>
        <p className="text-slate-500 mt-1">Upload position papers from coalition member organizations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Organization</Label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUseNewOrg(false)}
                  className={`text-sm px-3 py-1 rounded ${!useNewOrg ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => setUseNewOrg(true)}
                  className={`text-sm px-3 py-1 rounded ${useNewOrg ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  New
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
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading & Embedding...' : 'Upload Document'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
          ) : docs.length === 0 ? (
            <p className="text-slate-500 text-sm">No documents yet. Upload your first position paper above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.organizations?.name ?? '—'}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(doc.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.embedding ? 'default' : 'secondary'}>
                        {doc.embedding ? 'Embedded' : 'Pending'}
                      </Badge>
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
