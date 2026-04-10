import { NextRequest, NextResponse } from 'next/server'
import { searchWorldBank } from '@/lib/grants-api-extended'

// World Bank Projects API
// Free, no API key required
// Source: https://search.worldbank.org/api/v2/projects

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''

  try {
    const results = await searchWorldBank({ keyword })

    return NextResponse.json({
      results,
      total: results.length,
      source: 'worldbank',
      description: 'World Bank active development projects and grants',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('World Bank route error:', err)
    return NextResponse.json({ error: 'World Bank search failed', results: [] }, { status: 500 })
  }
}
