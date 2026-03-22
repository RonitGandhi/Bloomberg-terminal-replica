import { NextRequest, NextResponse } from 'next/server'

function getYahooRangeConfig(range: string) {
  switch (range) {
    case '1D':
      return { range: '1d', interval: '5m' }
    case '1W':
      return { range: '5d', interval: '30m' }
    case '1M':
      return { range: '1mo', interval: '1d' }
    case '3M':
      return { range: '3mo', interval: '1d' }
    case '1Y':
      return { range: '1y', interval: '1wk' }
    default:
      return { range: '1mo', interval: '1d' }
  }
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')
  const range = request.nextUrl.searchParams.get('range') || '1M'

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }

  try {
    const uppercaseSymbol = symbol.toUpperCase()
    const config = getYahooRangeConfig(range)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      uppercaseSymbol
    )}?range=${config.range}&interval=${config.interval}&includePrePost=false&events=div%2Csplits`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Yahoo Finance chart data', data: [] },
        { status: response.status }
      )
    }

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    const timestamps = result?.timestamp
    const quote = result?.indicators?.quote?.[0]

    if (
      !result ||
      !Array.isArray(timestamps) ||
      !quote ||
      !Array.isArray(quote.open) ||
      !Array.isArray(quote.high) ||
      !Array.isArray(quote.low) ||
      !Array.isArray(quote.close)
    ) {
      return NextResponse.json({ data: [], source: 'Yahoo Finance' })
    }

    const chartData = timestamps
      .map((timestamp: number, index: number) => {
        const open = quote.open[index]
        const high = quote.high[index]
        const low = quote.low[index]
        const close = quote.close[index]
        const volume = Array.isArray(quote.volume) ? quote.volume[index] : 0

        if (
          typeof open !== 'number' ||
          typeof high !== 'number' ||
          typeof low !== 'number' ||
          typeof close !== 'number'
        ) {
          return null
        }

        const date = new Date(timestamp * 1000)

        return {
          date: date.toISOString(),
          time:
            range === '1D'
              ? date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                }),
          open,
          high,
          low,
          close,
          volume: typeof volume === 'number' ? volume : 0,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ data: chartData, source: 'Yahoo Finance' })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data', data: [] },
      { status: 500 }
    )
  }
}
