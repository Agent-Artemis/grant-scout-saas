import { NextRequest, NextResponse } from 'next/server'
import { searchSamGov } from '@/lib/grants-api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const dateFrom = searchParams.get('dateFrom') || undefined
  const dateTo = searchParams.get('dateTo') || undefined

  try {
    const results = await searchSamGov({ keyword, dateFrom, dateTo })

    results.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())

    return NextResponse.json({
      results,
      total: results.length,
      source: 'sam.gov',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('RFP API error:', err)
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 })
  }
}
