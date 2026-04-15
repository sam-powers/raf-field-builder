'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'

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

export default function AlignmentPage() {
  const params = useParams()
  const briefId = params.briefId as string

  const [codings, setCodings] = useState<Coding[]>([])
  const [briefName, setBriefName] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
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

  const toggleQuestion = (q: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(q)) next.delete(q)
      else next.add(q)
      return next
    })
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

  const copyNarrative = () => {
    navigator.clipboard.writeText(narrative)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link href={`/briefs/${briefId}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-3">
          ← Back to Brief
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Alignment: {briefName}</h2>
            <p className="text-slate-500 mt-1">
              {orgs.length} organizations · {questions.length} questions
            </p>
          </div>
          <Button onClick={generateReport} disabled={generatingReport} variant="outline">
            {generatingReport ? 'Generating...' : 'Generate Field Narrative'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Question View</TabsTrigger>
          <TabsTrigger value="sidebyside">Side by Side</TabsTrigger>
        </TabsList>

        {/* Question-first cards */}
        <TabsContent value="questions" className="mt-6">
          {codings.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p>No codings yet.</p>
              <p className="text-sm mt-1">Run coding from the <Link href="/coding" className="text-blue-600 hover:underline">Coding dashboard</Link> first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qi) => {
                const addressedOrgs = orgs.filter(org => codingMap.get(org)?.get(q)?.addressed)
                const notAddressedOrgs = orgs.filter(org => !codingMap.get(org)?.get(q)?.addressed)
                const isExpanded = expandedQuestions.has(q)

                return (
                  <Card key={qi} className="overflow-hidden">
                    <CardHeader
                      className="pb-3 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                      onClick={() => addressedOrgs.length > 0 && toggleQuestion(q)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 text-sm font-medium shrink-0 mt-0.5">
                          Q{qi + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium text-slate-800 leading-snug mb-2">
                            {q}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-500">
                              {addressedOrgs.length} of {orgs.length} orgs addressed this
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {addressedOrgs.map(org => (
                                <Badge
                                  key={org}
                                  className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                                >
                                  {org}
                                </Badge>
                              ))}
                              {notAddressedOrgs.map(org => (
                                <Badge
                                  key={org}
                                  variant="outline"
                                  className="text-xs text-slate-400 border-slate-200"
                                >
                                  {org}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {addressedOrgs.length > 0 && (
                          <span className="text-slate-400 text-xs shrink-0 mt-0.5">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    {isExpanded && addressedOrgs.length > 0 && (
                      <CardContent className="pt-0 border-t border-slate-100">
                        <div className="space-y-4 pt-4">
                          {addressedOrgs.map(org => {
                            const coding = codingMap.get(org)?.get(q)
                            const quotes = coding?.quotes ?? []
                            return (
                              <div key={org}>
                                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">{org}</p>
                                {quotes.slice(0, 2).map((quote, qi2) => (
                                  <div key={qi2} className="mb-2">
                                    <blockquote className="border-l-2 border-blue-300 pl-3 text-sm text-slate-700 italic">
                                      "{quote.text}"
                                    </blockquote>
                                    {quote.context && (
                                      <p className="text-xs text-slate-400 pl-3 mt-0.5">{quote.context}</p>
                                    )}
                                  </div>
                                ))}
                                {quotes.length === 0 && (
                                  <p className="text-xs text-slate-400 italic">Addressed but no specific quotes extracted.</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Side by side — unchanged */}
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

      {/* Field Narrative Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Field Narrative: {briefName}</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyNarrative}
                className="ml-4 shrink-0"
              >
                Copy
              </Button>
            </div>
          </DialogHeader>
          <Separator />
          <div className="prose prose-slate prose-sm max-w-none mt-2">
            <ReactMarkdown>{narrative}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
