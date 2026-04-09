'use client'

import { useState } from 'react'
import { Search, DollarSign, Calendar, ExternalLink, Filter, RefreshCw, Target, FileText, Award } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  agency: string
  amount?: string
  deadline?: string
  postedDate: string
  description: string
  category: string
  source: string
  url: string
  status: string
}

const SOURCE_COLORS: Record<string, string> = {
  'grants.gov': 'bg-green-100 text-green-800',
  'sam.gov': 'bg-blue-100 text-blue-800',
  'sbir.gov': 'bg-purple-100 text-purple-800',
  'usaspending.gov': 'bg-orange-100 text-orange-800',
}

const SOURCE_LABELS: Record<string, string> = {
  'grants.gov': 'Grants.gov',
  'sam.gov': 'SAM.gov (RFP)',
  'sbir.gov': 'SBIR/STTR',
  'usaspending.gov': 'USASpending',
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('healthcare')
  const [activeTab, setActiveTab] = useState<'grants' | 'rfps' | 'all'>('all')
  const [results, setResults] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [stats, setStats] = useState({ grants: 0, rfps: 0, sbir: 0, awards: 0, total: 0 })
  const [lastSearched, setLastSearched] = useState('')

  const QUICK_SEARCHES = [
    'healthcare AI',
    'CCM remote patient monitoring',
    'compounding pharmacy',
    'telehealth',
    'small business technology',
    'rural health',
    'medical billing',
    'healthcare operations',
  ]

  async function doSearch(kw?: string) {
    const q = kw || keyword
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    setLastSearched(q)

    try {
      const [grantsRes, rfpsRes] = await Promise.allSettled([
        fetch(`/api/grants?keyword=${encodeURIComponent(q)}`).then(r => r.json()),
        fetch(`/api/rfps?keyword=${encodeURIComponent(q)}`).then(r => r.json()),
      ])

      const grants = grantsRes.status === 'fulfilled' ? grantsRes.value.results || [] : []
      const rfps = rfpsRes.status === 'fulfilled' ? rfpsRes.value.results || [] : []

      const allResults = [...grants, ...rfps].sort(
        (a: Opportunity, b: Opportunity) => 
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      )

      setResults(allResults)
      setStats({
        grants: grantsRes.status === 'fulfilled' ? (grantsRes.value.sources?.grantsGov || 0) : 0,
        sbir: grantsRes.status === 'fulfilled' ? (grantsRes.value.sources?.sbir || 0) : 0,
        rfps: rfpsRes.status === 'fulfilled' ? rfpsRes.value.total || 0 : 0,
        awards: 0,
        total: allResults.length,
      })
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = activeTab === 'all' 
    ? results 
    : activeTab === 'grants' 
      ? results.filter(r => r.source === 'grants.gov' || r.source === 'sbir.gov')
      : results.filter(r => r.source === 'sam.gov')

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      })
    } catch { return dateStr }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">GrantScout</h1>
              <p className="text-blue-300 text-sm">Live search: Grants.gov · SAM.gov · SBIR.gov</p>
            </div>
          </div>
          {searched && (
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-300 text-sm">opportunities found</div>
            </div>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Search grants and RFPs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => doSearch()}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick searches */}
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_SEARCHES.map(q => (
              <button
                key={q}
                onClick={() => { setKeyword(q); doSearch(q) }}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats bar */}
        {searched && !loading && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Federal Grants', value: stats.grants, icon: DollarSign, color: 'text-green-600', source: 'grants' },
              { label: 'SBIR/STTR', value: stats.sbir, icon: Award, color: 'text-purple-600', source: 'grants' },
              { label: 'SAM.gov RFPs', value: stats.rfps, icon: FileText, color: 'text-blue-600', source: 'rfps' },
              { label: 'Total Found', value: stats.total, icon: Target, color: 'text-gray-800', source: 'all' },
            ].map(stat => (
              <button
                key={stat.label}
                onClick={() => setActiveTab(stat.source as 'grants' | 'rfps' | 'all')}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 transition"
              >
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        {searched && (
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
            {(['all', 'grants', 'rfps'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? 'All Results' : tab === 'grants' ? 'Grants & SBIR' : 'RFPs (SAM.gov)'}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-gray-500">Searching Grants.gov, SAM.gov, and SBIR.gov...</p>
          </div>
        )}

        {!loading && searched && filteredResults.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Filter className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No results found for "{lastSearched}"</p>
            <p className="text-sm mt-1">Try broader keywords or check the other tabs</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-20 text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-600">Search live federal opportunities</p>
            <p className="text-sm mt-2">Enter keywords above or click a quick search to pull live data from Grants.gov, SAM.gov, and SBIR.gov</p>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Showing {filteredResults.length} results for "{lastSearched}"
            </p>
            {filteredResults.map(opp => (
              <div key={opp.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[opp.source] || 'bg-gray-100 text-gray-700'}`}>
                        {SOURCE_LABELS[opp.source] || opp.source}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {opp.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 font-medium">{opp.agency}</p>
                    {opp.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{opp.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {opp.amount && (
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <DollarSign className="h-3 w-3" />
                          {opp.amount}
                        </span>
                      )}
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {formatDate(opp.deadline)}
                        </span>
                      )}
                      {opp.postedDate && (
                        <span>Posted: {formatDate(opp.postedDate)}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
