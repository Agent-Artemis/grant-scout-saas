import { NextRequest, NextResponse } from 'next/server'
import { searchSamGov, searchUsaSpending } from '@/lib/grants-api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const type = searchParams.get('type') || 'all' // 'rfp' | 'awards' | 'all'

  try {
    const [rfps, awards] = await Promise.allSettled([
      type !== 'awards' ? searchSamGov({ keyword }) : Promise.resolve([]),
      type !== 'rfp' ? searchUsaSpending({ keyword }) : Promise.resolve([]),
    ])

    return NextResponse.json({
      rfps: rfps.status === 'fulfilled' ? rfps.value : [],
      awards: awards.status === 'fulfilled' ? awards.value : [],
      total: (rfps.status === 'fulfilled' ? rfps.value.length : 0) +
             (awards.status === 'fulfilled' ? awards.value.length : 0),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('SAM API error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
