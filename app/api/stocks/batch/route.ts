import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols')
  
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Symbols required' }, { status: 400 })
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const symbols = symbolsParam.split(',').slice(0, 20) // Limit to 20 symbols

  try {
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol.trim()}&token=${FINNHUB_API_KEY}`
          )
          const data = await res.json()
          
          if (data.c) {
            return {
              symbol: symbol.trim().toUpperCase(),
              price: data.c,
              change: data.d,
              changePercent: data.dp,
              high: data.h,
              low: data.l,
              open: data.o,
              previousClose: data.pc
            }
          }
          return null
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({
      quotes: quotes.filter(Boolean)
    })
  } catch (error) {
    console.error('Batch quotes error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
