import { NextRequest, NextResponse } from 'next/server'
import { searchGrantsGov, searchSbir } from '@/lib/grants-api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const agency = searchParams.get('agency') || undefined
  const status = (searchParams.get('status') as 'open' | 'closed' | 'forecasted') || 'open'

  try {
    const [grants, sbir] = await Promise.allSettled([
      searchGrantsGov({ keyword, agency, status }),
      searchSbir({ keyword }),
    ])

    const results = [
      ...(grants.status === 'fulfilled' ? grants.value : []),
      ...(sbir.status === 'fulfilled' ? sbir.value : []),
    ]

    // Sort by posted date desc
    results.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())

    return NextResponse.json({
      results,
      total: results.length,
      sources: {
        grantsGov: grants.status === 'fulfilled' ? grants.value.length : 0,
        sbir: sbir.status === 'fulfilled' ? sbir.value.length : 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Grants API error:', err)
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 })
  }
}
