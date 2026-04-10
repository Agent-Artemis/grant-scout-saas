import { NextRequest, NextResponse } from 'next/server'
import { searchEuFunding } from '@/lib/grants-api-extended'

// EU Funding & Tenders Portal API
// Free, uses public SEDIA API key
// Source: https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis
// Covers: Horizon Europe, ERDF, ESF, Creative Europe, Erasmus+, Life Programme, etc.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''

  try {
    const results = await searchEuFunding({ keyword })

    return NextResponse.json({
      results,
      total: results.length,
      source: 'eu-funding',
      description: 'EU Funding & Tenders Portal — Horizon Europe, ERDF, ESF+, and more',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('EU Funding route error:', err)
    return NextResponse.json({ error: 'EU Funding search failed', results: [] }, { status: 500 })
  }
}
