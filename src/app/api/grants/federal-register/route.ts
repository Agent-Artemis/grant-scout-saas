import { NextRequest, NextResponse } from 'next/server'
import { searchFederalRegister } from '@/lib/grants-api-extended'

// Federal Register Grant Notices API
// Free, no API key required
// Source: https://www.federalregister.gov/developers/documentation/api/v1

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const agency = searchParams.get('agency') || undefined

  try {
    const results = await searchFederalRegister({ keyword, agency })

    return NextResponse.json({
      results,
      total: results.length,
      source: 'federal-register',
      description: 'Federal Register grant opportunity notices',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Federal Register route error:', err)
    return NextResponse.json({ error: 'Federal Register search failed', results: [] }, { status: 500 })
  }
}
