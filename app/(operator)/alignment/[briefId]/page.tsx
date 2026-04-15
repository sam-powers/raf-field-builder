'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface Quote {
  text: string
  context: string
}

interface Coding {
  id: string
  document_id: string
  brief_id: string
  topic_question: string
  addressed: boolean
  quotes: Quote[]
  documents: {
    id: string
    title: string
    organizations: { name: string } | null
  }
}

interface SheetData {
  org: string
  question: string
  quotes: Quote[]
}

export default function AlignmentPage() {
  const params = useParams()
  const briefId = params.briefId as string

  const [codings, setCodings] = useState<Coding[]>([])
  const [briefName, setBriefName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [narrative, setNarrative] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [sideBySideOrg1, setSideBySideOrg1] = useState('')
  const [sideBySideOrg2, setSideBySideOrg2] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [codingsRes, briefRes] = await Promise.all([
        fetch(`/api/codings/${briefId}`),
        fetch(`/api/briefs/${briefId}`),
      ])
      const codingsData = await codingsRes.json()
      const briefData = await briefRes.json()
      setCodings(Array.isArray(codingsData) ? codingsData : [])
      setBriefName(briefData?.issue_areas?.name ?? 'Brief')
      setLoading(false)
    }
    fetchData()
  }, [briefId])

  // Derive unique questions and orgs
  const questions = Array.from(new Set(codings.map(c => c.topic_question)))
  const orgs = Array.from(new Set(
    codings.map(c => c.documents?.organizations?.name).filter(Boolean)
  )) as string[]

  // Build lookup: org -> question -> coding
  const codingMap = new Map<string, Map<string, Coding>>()
  for (const coding of codings) {
    const org = coding.documents?.organizations?.name ?? ''
    if (!codingMap.has(org)) codingMap.set(org, new Map())
    codingMap.get(org)!.set(coding.topic_question, coding)
  }

  const openSheet = (org: string, question: string) => {
    const coding = codingMap.get(org)?.get(question)
    if (!coding || !coding.addressed) return
    setSheetData({ org, question, quotes: coding.quotes ?? [] })
    setSheetOpen(true)
  }

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await fetch(`/api/report/${briefId}`, { method: 'POST' })
      const data = await res.json()
      setNarrative(data.narrative ?? '')
      setReportOpen(true)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingReport(false)
    }
  }

  const getSideBySideData = (orgName: string) => {
    return questions.map(q => ({
      question: q,
      coding: codingMap.get(orgName)?.get(q) ?? null,
    }))
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alignment: {briefName}</h2>
          <p className="text-slate-500 mt-1">
            {orgs.length} organizations · {questions.length} questions
          </p>
        </div>
        <Button onClick={generateReport} disabled={generatingReport}>
          {generatingReport ? 'Generating...' : 'Generate Field Narrative'}
        </Button>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="sidebyside">Side by Side</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          {codings.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p>No codings yet.</p>
              <p className="text-sm mt-1">Run coding from the Coding dashboard first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-3 bg-slate-50 border border-slate-200 font-medium text-slate-700 min-w-[200px]">
                      Question
                    </th>
                    {orgs.map(org => (
                      <th key={org} className="text-left p-3 bg-slate-50 border border-slate-200 font-medium text-slate-700 min-w-[120px]">
                        <span className="truncate block max-w-[140px]" title={org}>{org}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, qi) => (
                    <tr key={qi} className={qi % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3 border border-slate-200 text-slate-700 text-xs leading-snug">
                        {q}
                      </td>
                      {orgs.map(org => {
                        const coding = codingMap.get(org)?.get(q)
                        const addressed = coding?.addressed ?? false
                        return (
                          <td
                            key={org}
                            className="p-3 border border-slate-200 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => openSheet(org, q)}
                          >
                            {addressed ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                ✓
                              </Badge>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sidebyside" className="mt-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Organization 1</label>
                <select
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={sideBySideOrg1}
                  onChange={e => setSideBySideOrg1(e.target.value)}
                >
                  <option value="">Select org...</option>
                  {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Organization 2</label>
                <select
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={sideBySideOrg2}
                  onChange={e => setSideBySideOrg2(e.target.value)}
                >
                  <option value="">Select org...</option>
                  {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {sideBySideOrg1 && sideBySideOrg2 && (
              <div className="grid grid-cols-2 gap-4">
                {[sideBySideOrg1, sideBySideOrg2].map(org => (
                  <div key={org}>
                    <h3 className="font-semibold text-slate-800 mb-3">{org}</h3>
                    <div className="space-y-4">
                      {getSideBySideData(org).map(({ question, coding }, idx) => (
                        <Card key={idx} className="text-sm">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-slate-500 leading-snug">
                              {question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            {coding?.addressed && coding.quotes.length > 0 ? (
                              <div className="space-y-2">
                                {coding.quotes.slice(0, 2).map((q, qi) => (
                                  <blockquote key={qi} className="border-l-2 border-green-400 pl-3 text-slate-600 text-xs italic">
                                    "{q.text}"
                                    <p className="not-italic text-slate-400 mt-1">{q.context}</p>
                                  </blockquote>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-xs">Not addressed</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quote Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{sheetData?.org}</SheetTitle>
            <p className="text-sm text-slate-500 mt-1 leading-snug">{sheetData?.question}</p>
          </SheetHeader>
          <Separator className="mb-4" />
          <div className="space-y-4">
            {sheetData?.quotes.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <blockquote className="border-l-2 border-blue-400 pl-4 text-sm text-slate-700 italic">
                  "{q.text}"
                </blockquote>
                <p className="text-xs text-slate-500 pl-4">{q.context}</p>
              </div>
            ))}
            {(!sheetData?.quotes || sheetData.quotes.length === 0) && (
              <p className="text-slate-400 text-sm">No quotes extracted.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Field Landscape Narrative: {briefName}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
              {narrative}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
