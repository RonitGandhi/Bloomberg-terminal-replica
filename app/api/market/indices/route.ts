import { NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

// ETFs that track major indices
const INDEX_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500', index: '^GSPC' },
  { symbol: 'DIA', name: 'Dow Jones', index: '^DJI' },
  { symbol: 'QQQ', name: 'NASDAQ', index: '^IXIC' },
  { symbol: 'IWM', name: 'Russell 2000', index: '^RUT' },
  { symbol: 'VXX', name: 'VIX', index: '^VIX' },
]

export async function GET() {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const indices = await Promise.all(
      INDEX_SYMBOLS.map(async ({ symbol, name }) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
          )
          const data = await res.json()
          
          if (data.c) {
            return {
              symbol: name,
              displaySymbol: symbol,
              price: data.c,
              change: data.d,
              changePercent: data.dp,
              high: data.h,
              low: data.l
            }
          }
          return null
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({
      indices: indices.filter(Boolean)
    })
  } catch (error) {
    console.error('Market indices error:', error)
    return NextResponse.json({ error: 'Failed to fetch indices' }, { status: 500 })
  }
}
