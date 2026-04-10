import { NextRequest, NextResponse } from 'next/server'
import { searchNihReporter } from '@/lib/grants-api-extended'

// NIH RePORTER API
// Free, no API key required
// Source: https://api.reporter.nih.gov/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const agency = searchParams.get('agency') || undefined
  const dateFrom = searchParams.get('dateFrom') || undefined

  try {
    const results = await searchNihReporter({ keyword, agency, dateFrom })

    return NextResponse.json({
      results,
      total: results.length,
      source: 'nih-reporter',
      description: 'NIH-funded research grants via NIH RePORTER API',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('NIH route error:', err)
    return NextResponse.json({ error: 'NIH search failed', results: [] }, { status: 500 })
  }
}
