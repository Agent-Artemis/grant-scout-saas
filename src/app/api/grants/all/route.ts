import { NextRequest, NextResponse } from 'next/server'
import { searchGrantsGov, searchSbir, searchUsaSpending } from '@/lib/grants-api'
import {
  searchNihReporter,
  searchNsfAwards,
  searchWorldBank,
  searchEuFunding,
  searchFederalRegister,
} from '@/lib/grants-api-extended'

// Unified Grant Search — All Sources
// Pulls from: Grants.gov, SBIR.gov, USASpending.gov, NIH RePORTER,
//             NSF Awards, World Bank, EU Funding Portal, Federal Register

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const agency = searchParams.get('agency') || undefined
  const status = (searchParams.get('status') as 'open' | 'closed' | 'forecasted') || 'open'
  const sources = searchParams.get('sources')?.split(',') || [
    'grants.gov', 'sbir', 'nih', 'nsf', 'worldbank', 'eu', 'federal-register'
  ]

  const enabled = (name: string) => sources.includes(name) || sources.includes('all')

  const [grantsGov, sbir, nih, nsf, worldbank, eu, fedReg] = await Promise.allSettled([
    enabled('grants.gov') ? searchGrantsGov({ keyword, agency, status }) : Promise.resolve([]),
    enabled('sbir') ? searchSbir({ keyword }) : Promise.resolve([]),
    enabled('nih') ? searchNihReporter({ keyword, agency }) : Promise.resolve([]),
    enabled('nsf') ? searchNsfAwards({ keyword }) : Promise.resolve([]),
    enabled('worldbank') ? searchWorldBank({ keyword }) : Promise.resolve([]),
    enabled('eu') ? searchEuFunding({ keyword }) : Promise.resolve([]),
    enabled('federal-register') ? searchFederalRegister({ keyword, agency }) : Promise.resolve([]),
  ])

  const sourceMap = {
    'grants.gov': grantsGov.status === 'fulfilled' ? grantsGov.value.length : 0,
    'sbir.gov': sbir.status === 'fulfilled' ? sbir.value.length : 0,
    'nih-reporter': nih.status === 'fulfilled' ? nih.value.length : 0,
    'nsf-awards': nsf.status === 'fulfilled' ? nsf.value.length : 0,
    'worldbank': worldbank.status === 'fulfilled' ? worldbank.value.length : 0,
    'eu-funding': eu.status === 'fulfilled' ? eu.value.length : 0,
    'federal-register': fedReg.status === 'fulfilled' ? fedReg.value.length : 0,
  }

  const results = [
    ...(grantsGov.status === 'fulfilled' ? grantsGov.value : []),
    ...(sbir.status === 'fulfilled' ? sbir.value : []),
    ...(nih.status === 'fulfilled' ? nih.value : []),
    ...(nsf.status === 'fulfilled' ? nsf.value : []),
    ...(worldbank.status === 'fulfilled' ? worldbank.value : []),
    ...(eu.status === 'fulfilled' ? eu.value : []),
    ...(fedReg.status === 'fulfilled' ? fedReg.value : []),
  ]

  // Sort by posted date desc
  results.sort((a, b) => {
    const da = new Date(a.postedDate || 0).getTime()
    const db = new Date(b.postedDate || 0).getTime()
    return db - da
  })

  return NextResponse.json({
    results,
    total: results.length,
    sources: sourceMap,
    timestamp: new Date().toISOString(),
  })
}
