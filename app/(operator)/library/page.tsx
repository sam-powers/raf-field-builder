'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DocumentRow {
  id: string
  title: string
  file_path: string | null
  submitted_at: string
  embedding: string | null
  organizations: { name: string } | null
}

export default function LibraryPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => setDocs(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false))
  }, [])

  const getDocUrl = (filePath: string | null) => {
    if (!filePath) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Library</h2>
          <p className="text-slate-500 mt-1">Position papers and policy documents from coalition members</p>
        </div>
        <Link href="/upload">
          <Button>Upload Document</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No documents yet.</p>
          <Link href="/upload" className="mt-3 inline-block">
            <Button variant="outline" size="sm">Upload your first document</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Organization</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map(doc => {
                const url = getDocUrl(doc.file_path)
                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-slate-700">
                      {doc.organizations?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-700">{doc.title}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(doc.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.embedding ? 'default' : 'secondary'}>
                        {doc.embedding ? 'Embedded' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
