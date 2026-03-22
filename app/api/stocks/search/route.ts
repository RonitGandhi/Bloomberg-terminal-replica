import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  
  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    )
    const data = await res.json()

    const results = (data.result || [])
      .filter((item: { type: string }) => item.type === 'Common Stock')
      .slice(0, 10)
      .map((item: { symbol: string; description: string; displaySymbol: string }) => ({
        symbol: item.symbol,
        name: item.description,
        displaySymbol: item.displaySymbol
      }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
