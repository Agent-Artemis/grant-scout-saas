// Grant & RFP API Integration Library
// Sources: Grants.gov, SAM.gov, USASpending.gov, SBIR.gov

export interface GrantOpportunity {
  id: string
  title: string
  agency: string
  amount?: string
  amountMin?: number
  amountMax?: number
  deadline?: string
  postedDate: string
  description: string
  eligibility?: string
  category: string
  source: 'grants.gov' | 'sam.gov' | 'sbir.gov' | 'usaspending.gov'
  url: string
  cfda?: string
  status: 'open' | 'closed' | 'forecasted'
}

export interface SearchParams {
  keyword?: string
  agency?: string
  eligibility?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  status?: 'open' | 'closed' | 'forecasted'
}

// ─── GRANTS.GOV API ───────────────────────────────────────────────────────────
// Free, no API key required
// Docs: https://www.grants.gov/web/grants/s2s/grantor/schemas.html

export async function searchGrantsGov(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const body = {
      keyword: params.keyword || '',
      oppStatuses: params.status === 'forecasted' ? 'forecasted' : 
                   params.status === 'closed' ? 'closed' : 'posted',
      agencies: params.agency ? [params.agency] : [],
      rows: 25,
      startRecordNum: 0,
      oppNum: '',
      cfda: '',
      sortBy: 'openDate|desc',
    }

    const res = await fetch('https://apply07.grants.gov/grantsws/rest/opportunities/search/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`Grants.gov error: ${res.status}`)
    const data = await res.json()

    return (data.oppHits || []).map((opp: Record<string, unknown>) => ({
      id: `grants-${opp.id}`,
      title: opp.title as string || 'Untitled',
      agency: opp.agencyName as string || opp.agencyCode as string || 'Unknown Agency',
      amountMin: opp.awardFloor as number,
      amountMax: opp.awardCeiling as number,
      amount: opp.awardCeiling ? `Up to $${Number(opp.awardCeiling).toLocaleString()}` : undefined,
      deadline: opp.closeDate as string,
      postedDate: opp.openDate as string || '',
      description: opp.synopsis as string || '',
      eligibility: opp.eligibilities as string,
      category: opp.fundingCategory as string || 'General',
      source: 'grants.gov' as const,
      url: `https://www.grants.gov/search-results-detail/${opp.id}`,
      cfda: opp.cfdaList as string,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('Grants.gov search failed:', err)
    return []
  }
}

// ─── SAM.GOV API ─────────────────────────────────────────────────────────────
// Free tier available, API key optional for higher rate limits
// Docs: https://open.gsa.gov/api/opportunities-api/

export async function searchSamGov(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const apiKey = process.env.SAM_API_KEY || 'DEMO_KEY'
    const keyword = encodeURIComponent(params.keyword || 'healthcare OR technology OR services')
    const postedFrom = params.dateFrom || getDateDaysAgo(90)
    const postedTo = params.dateTo || getTodayDate()

    const url = `https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&q=${keyword}&postedFrom=${postedFrom}&postedTo=${postedTo}&limit=25&offset=0&ptype=o,p,k,r`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`SAM.gov error: ${res.status}`)
    const data = await res.json()

    return (data.opportunitiesData || []).map((opp: Record<string, unknown>) => ({
      id: `sam-${opp.noticeId}`,
      title: opp.title as string || 'Untitled',
      agency: opp.departmentName as string || opp.subAgency as string || 'Federal Agency',
      amount: opp.awardAmount ? `$${Number(opp.awardAmount).toLocaleString()}` : 'See listing',
      deadline: opp.responseDeadLine as string,
      postedDate: opp.postedDate as string || '',
      description: opp.description as string || opp.fullParentPathName as string || '',
      eligibility: 'Open to eligible vendors',
      category: opp.classificationCode as string || 'Government Contract',
      source: 'sam.gov' as const,
      url: opp.uiLink as string || `https://sam.gov/opp/${opp.noticeId}`,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('SAM.gov search failed:', err)
    return []
  }
}

// ─── SBIR.GOV API ────────────────────────────────────────────────────────────
// Free, no API key required
// Docs: https://www.sbir.gov/api

export async function searchSbir(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const keyword = encodeURIComponent(params.keyword || '')
    const url = `https://api.sbir.gov/public/solicitations?keyword=${keyword}&open=true&rows=25&start=0`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`SBIR error: ${res.status}`)
    const data = await res.json()

    return (data.docs || []).map((opp: Record<string, unknown>) => ({
      id: `sbir-${opp.solicitation_id}`,
      title: opp.program_title as string || opp.solicitation_title as string || 'SBIR/STTR Opportunity',
      agency: opp.agency as string || 'Federal Agency',
      amount: opp.award_amount ? `$${Number(opp.award_amount).toLocaleString()}` : 'Phase I/II available',
      deadline: opp.close_date as string,
      postedDate: opp.open_date as string || '',
      description: opp.program_desc as string || '',
      eligibility: 'Small businesses only',
      category: 'SBIR/STTR',
      source: 'sbir.gov' as const,
      url: opp.solicitation_agencies_url as string || 
           `https://www.sbir.gov/sbirsearch/detail/${opp.solicitation_id}`,
      status: opp.open ? 'open' as const : 'closed' as const,
    }))
  } catch (err) {
    console.error('SBIR search failed:', err)
    return []
  }
}

// ─── USASPENDING.GOV API ─────────────────────────────────────────────────────
// Free, no API key required - pulls recent awards as intelligence
// Docs: https://api.usaspending.gov/

export async function searchUsaSpending(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const body = {
      filters: {
        keywords: params.keyword ? [params.keyword] : ['healthcare', 'technology'],
        award_type_codes: ['02', '03', '04', '05'], // grants
        date_range_start: params.dateFrom || getDateDaysAgo(30),
        date_range_end: params.dateTo || getTodayDate(),
      },
      fields: ['Award ID', 'Award Amount', 'Awarding Agency', 'Award Date', 
               'recipient_name', 'Description', 'period_of_performance_current_end_date'],
      page: 1,
      limit: 25,
      sort: 'Award Amount',
      order: 'desc',
    }

    const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`USASpending error: ${res.status}`)
    const data = await res.json()

    return (data.results || []).map((award: Record<string, unknown>, i: number) => ({
      id: `usa-${i}-${award['Award ID']}`,
      title: `Grant Award: ${award['recipient_name'] || 'Unknown Recipient'}`,
      agency: award['Awarding Agency'] as string || 'Federal Agency',
      amount: award['Award Amount'] ? `$${Number(award['Award Amount']).toLocaleString()}` : undefined,
      amountMax: award['Award Amount'] as number,
      deadline: award['period_of_performance_current_end_date'] as string,
      postedDate: award['Award Date'] as string || '',
      description: award['Description'] as string || 'Federal grant award',
      category: 'Award Intelligence',
      source: 'usaspending.gov' as const,
      url: `https://www.usaspending.gov/award/${award['Award ID']}`,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('USASpending search failed:', err)
    return []
  }
}


// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}
