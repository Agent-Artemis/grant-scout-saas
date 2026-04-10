// Extended Grant & RFP API Integration Library
// New sources: NIH RePORTER, NSF Awards, World Bank, EU Funding Portal, Federal Register, OpenAlex
// All free, no API key required unless noted

import { GrantOpportunity, SearchParams } from './grants-api'

// ─── NIH REPORTER API ────────────────────────────────────────────────────────
// Free, no API key required
// Docs: https://api.reporter.nih.gov/
// Returns active NIH/HHS-funded research grants

export async function searchNihReporter(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const criteria: Record<string, unknown> = {
      fiscal_years: [2025, 2024],
    }

    if (params.keyword) {
      criteria.advanced_text_search = {
        operator: 'and',
        search_field: 'projecttitle,terms',
        search_text: params.keyword,
      }
    }

    if (params.agency) {
      criteria.agencies = [{ abbrev: params.agency }]
    }

    const body = {
      criteria,
      offset: 0,
      limit: 25,
      sort_field: 'project_start_date',
      sort_order: 'desc',
      include_fields: [
        'ApplId', 'SubprojectId', 'FiscalYear', 'OrgName', 'OrgCity', 'OrgState',
        'OrgCountry', 'DeptType', 'ProjectNum', 'ProjectSerialNum', 'ActivityCode',
        'FullStudySection', 'ProjectStartDate', 'ProjectEndDate', 'IsActive',
        'ProjectTitle', 'PrincipalInvestigators', 'ProgramOfficers',
        'AgencyIcAdmin', 'AgencyIcFundings', 'CongDist', 'ProjectDetailUrl',
        'Terms', 'AbstractText', 'PhrText', 'SpendingCategoriesDesc',
        'AwardAmount', 'TotalCost', 'TotalCostSubProject',
      ],
    }

    const res = await fetch('https://api.reporter.nih.gov/v2/projects/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`NIH RePORTER error: ${res.status}`)
    const data = await res.json()

    return (data.results || []).map((p: Record<string, unknown>) => {
      const agencies = (p.agency_ic_fundings as Record<string, unknown>[]) || []
      const agencyName = agencies.length > 0
        ? (agencies[0] as Record<string, unknown>).abbreviation as string || 'NIH'
        : (p.agency_ic_admin as Record<string, unknown>)?.abbreviation as string || 'NIH'

      return {
        id: `nih-${p.appl_id || p.project_num}`,
        title: p.project_title as string || 'NIH Research Grant',
        agency: `NIH / ${agencyName}`,
        amount: p.award_amount
          ? `$${Number(p.award_amount).toLocaleString()}`
          : p.total_cost
          ? `$${Number(p.total_cost).toLocaleString()}`
          : 'See listing',
        amountMax: (p.award_amount as number) || (p.total_cost as number),
        deadline: p.project_end_date as string,
        postedDate: p.project_start_date as string || '',
        description: (p.abstract_text as string || p.phr_text as string || '').slice(0, 500),
        eligibility: 'Research institutions, universities, hospitals',
        category: p.spending_categories_desc as string || 'Research Grant',
        source: 'nih.gov' as unknown as 'grants.gov',
        url: p.project_detail_url as string || `https://reporter.nih.gov/project-details/${p.appl_id}`,
        status: (p.is_active ? 'open' : 'closed') as 'open' | 'closed',
      }
    })
  } catch (err) {
    console.error('NIH RePORTER search failed:', err)
    return []
  }
}

// ─── NSF AWARDS API ──────────────────────────────────────────────────────────
// Free, no API key required
// Docs: https://resources.research.gov/common/webapi/awardapisearch-v1.htm

export async function searchNsfAwards(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const today = new Date()
    const startDate = params.dateFrom
      ? new Date(params.dateFrom).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      : `01/01/${today.getFullYear()}`

    const searchParams = new URLSearchParams({
      keyword: params.keyword || '',
      dateStart: startDate,
      rpp: '25',
      offset: '1',
      printFields: 'id,title,agency,awardee,awardeeCity,awardeeStateCode,date,expDate,fundsObligatedAmt,abstractText,piFirstName,piLastName,primaryProgram',
    })

    const res = await fetch(`https://api.nsf.gov/services/v1/awards.json?${searchParams}`)
    if (!res.ok) throw new Error(`NSF error: ${res.status}`)
    const data = await res.json()

    return (data.response?.award || []).map((a: Record<string, unknown>) => ({
      id: `nsf-${a.id}`,
      title: a.title as string || 'NSF Award',
      agency: `NSF / ${a.agency as string || 'National Science Foundation'}`,
      amount: a.fundsObligatedAmt
        ? `$${Number(a.fundsObligatedAmt).toLocaleString()}`
        : 'See listing',
      amountMax: a.fundsObligatedAmt as number,
      deadline: a.expDate as string,
      postedDate: a.date as string || '',
      description: (a.abstractText as string || '').slice(0, 500),
      eligibility: 'Universities, research institutions, small businesses',
      category: a.primaryProgram as string || 'NSF Award',
      source: 'nsf.gov' as unknown as 'grants.gov',
      url: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${a.id}`,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('NSF Awards search failed:', err)
    return []
  }
}

// ─── WORLD BANK PROJECTS API ─────────────────────────────────────────────────
// Free, no API key required
// Docs: https://search.worldbank.org/api/v2/projects

export async function searchWorldBank(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const searchParams = new URLSearchParams({
      format: 'json',
      rows: '25',
      fl: 'id,project_name,totalamt,status,pdo,url,boardapprovaldate,closingdate,countryname,sector1,theme1,lendinginstr',
      status: 'Active',
    })

    if (params.keyword) {
      searchParams.set('qterm', params.keyword)
    }

    const res = await fetch(`https://search.worldbank.org/api/v2/projects?${searchParams}`)
    if (!res.ok) throw new Error(`World Bank error: ${res.status}`)
    const data = await res.json()

    const projects = data.projects || {}
    const items = Object.values(projects) as Record<string, unknown>[]

    return items.slice(0, 25).map((p) => ({
      id: `wb-${p.id}`,
      title: p.project_name as string || 'World Bank Project',
      agency: 'World Bank',
      amount: p.totalamt ? `$${Number(p.totalamt).toLocaleString()}` : 'See listing',
      amountMax: p.totalamt as number,
      deadline: p.closingdate as string,
      postedDate: p.boardapprovaldate as string || '',
      description: (p.pdo as string || '').slice(0, 500),
      eligibility: 'Countries, development organizations, NGOs',
      category: p.sector1 as string || p.theme1 as string || 'International Development',
      source: 'worldbank.org' as unknown as 'grants.gov',
      url: p.url as string || `https://projects.worldbank.org/en/projects-operations/project-detail/${p.id}`,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('World Bank search failed:', err)
    return []
  }
}

// ─── EU FUNDING & TENDERS PORTAL ─────────────────────────────────────────────
// Free, no auth needed (uses public SEDIA key)
// Docs: https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis
// Covers: Horizon Europe, ERDF, ESF, Creative Europe, Erasmus+, etc.

export async function searchEuFunding(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const queryBody = {
      bool: {
        must: [
          { terms: { type: ['1', '2', '8'] } }, // call types
          { terms: { status: ['31094501', '31094502'] } }, // open + forthcoming
        ],
      },
    }

    if (params.keyword) {
      (queryBody.bool.must as unknown[]).push({
        query_string: { query: params.keyword },
      })
    }

    const url = new URL('https://api.tech.ec.europa.eu/search-api/prod/rest/search')
    url.searchParams.set('apiKey', 'SEDIA')
    url.searchParams.set('text', params.keyword || '*')
    url.searchParams.set('pageSize', '25')
    url.searchParams.set('pageNumber', '1')

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
    })

    if (!res.ok) throw new Error(`EU Funding error: ${res.status}`)
    const data = await res.json()

    return (data.results || []).map((r: Record<string, unknown>) => {
      const meta = r.metadata as Record<string, unknown> || {}
      const title = Array.isArray(meta.title) ? meta.title[0] : (meta.title as string) || r.title as string || 'EU Funding Call'
      const deadline = Array.isArray(meta.deadlineDate) ? meta.deadlineDate[0] : meta.deadlineDate as string
      const startDate = Array.isArray(meta.startDate) ? meta.startDate[0] : meta.startDate as string
      const description = Array.isArray(meta.description) ? meta.description[0] : meta.description as string || ''
      const identifier = Array.isArray(meta.reference) ? meta.reference[0] : meta.reference as string || r.id as string

      return {
        id: `eu-${identifier || Math.random().toString(36).slice(2)}`,
        title,
        agency: 'European Commission',
        amount: Array.isArray(meta.budgetOverallAmount) ? `€${Number(meta.budgetOverallAmount[0]).toLocaleString()}` : 'See listing',
        deadline,
        postedDate: startDate || '',
        description: description.slice(0, 500),
        eligibility: 'EU member state organizations, research institutions, SMEs',
        category: Array.isArray(meta.programmePeriod) ? meta.programmePeriod[0] : 'EU Grant',
        source: 'ec.europa.eu' as unknown as 'grants.gov',
        url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${identifier}`,
        status: 'open' as const,
      }
    })
  } catch (err) {
    console.error('EU Funding search failed:', err)
    return []
  }
}

// ─── FEDERAL REGISTER GRANT NOTICES ──────────────────────────────────────────
// Free, no API key required
// Docs: https://www.federalregister.gov/developers/documentation/api/v1

export async function searchFederalRegister(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const searchParams = new URLSearchParams({
      per_page: '25',
      order: 'newest',
      'conditions[type][]': 'Notice',
      'conditions[term]': params.keyword
        ? `${params.keyword} grant funding opportunity`
        : 'grant funding opportunity announcement',
    })

    if (params.agency) {
      searchParams.set('conditions[agencies][]', params.agency.toLowerCase().replace(/\s+/g, '-'))
    }

    const res = await fetch(`https://www.federalregister.gov/api/v1/documents.json?${searchParams}`)
    if (!res.ok) throw new Error(`Federal Register error: ${res.status}`)
    const data = await res.json()

    return (data.results || []).map((doc: Record<string, unknown>) => ({
      id: `fedreg-${doc.document_number}`,
      title: doc.title as string || 'Federal Register Notice',
      agency: (doc.agencies as Record<string, unknown>[])?.[0]?.name as string || 'Federal Agency',
      amount: 'See listing',
      deadline: doc.comments_close_on as string || doc.effective_on as string,
      postedDate: doc.publication_date as string || '',
      description: (doc.abstract as string || doc.excerpt as string || '').slice(0, 500),
      eligibility: 'See individual notice',
      category: 'Federal Notice',
      source: 'federalregister.gov' as unknown as 'grants.gov',
      url: doc.html_url as string || doc.pdf_url as string || `https://www.federalregister.gov/documents/${doc.document_number}`,
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('Federal Register search failed:', err)
    return []
  }
}

// ─── OPENALEX FUNDERS & GRANTS ───────────────────────────────────────────────
// Free, no API key required (polite pool - 10 req/sec)
// Docs: https://docs.openalex.org/
// Note: This is grants intelligence/research data, not open opportunities

export async function searchOpenAlexFunders(params: SearchParams): Promise<GrantOpportunity[]> {
  try {
    const searchParams = new URLSearchParams({
      search: params.keyword || 'health research',
      'per-page': '25',
      mailto: 'jeff@augeo-hq.com',
    })

    const res = await fetch(`https://api.openalex.org/funders?${searchParams}`)
    if (!res.ok) throw new Error(`OpenAlex error: ${res.status}`)
    const data = await res.json()

    return (data.results || []).map((f: Record<string, unknown>) => ({
      id: `openalex-${f.id as string || Math.random().toString(36).slice(2)}`,
      title: `Funder: ${f.display_name as string || 'Unknown'}`,
      agency: f.display_name as string || 'Unknown Funder',
      amount: f.grants_count ? `${f.grants_count} grants funded` : 'See profile',
      deadline: undefined,
      postedDate: '',
      description: `${f.display_name} is a research funder. Total grants: ${f.grants_count || 0}. Works count: ${f.works_count || 0}. Cited by: ${f.cited_by_count || 0}.`,
      eligibility: 'Researchers, institutions',
      category: 'Funder Profile',
      source: 'openalex.org' as unknown as 'grants.gov',
      url: (f.id as string || '').replace('https://openalex.org/', 'https://openalex.org/') || 'https://openalex.org/',
      status: 'open' as const,
    }))
  } catch (err) {
    console.error('OpenAlex search failed:', err)
    return []
  }
}
