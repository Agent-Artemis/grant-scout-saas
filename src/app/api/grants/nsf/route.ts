import { NextRequest, NextResponse } from 'next/server'
import { searchNsfAwards } from '@/lib/grants-api-extended'

// NSF Awards API
// Free, no API key required
// Source: https://api.nsf.gov/services/v1/awards.json

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const dateFrom = searchParams.get('dateFrom') || undefined
  const dateTo = searchParams.get('dateTo') || undefined

  try {
    const results = await searchNsfAwards({ keyword, dateFrom, dateTo })

    return NextResponse.json({
      results,
      total: results.length,
      source: 'nsf-awards',
      description: 'NSF-funded research awards via NSF Awards API',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('NSF route error:', err)
    return NextResponse.json({ error: 'NSF search failed', results: [] }, { status: 500 })
  }
}
