import { NextRequest, NextResponse } from 'next/server'

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }

  if (!ALPHA_VANTAGE_API_KEY && !FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 })
  }

  try {
    const uppercaseSymbol = symbol.toUpperCase()
    const [alphaQuoteRes, finnhubQuoteRes, profileRes] = await Promise.all([
      ALPHA_VANTAGE_API_KEY
        ? fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${uppercaseSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          )
        : Promise.resolve(null),
      FINNHUB_API_KEY
        ? fetch(`https://finnhub.io/api/v1/quote?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`)
        : Promise.resolve(null),
      FINNHUB_API_KEY
        ? fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`)
        : Promise.resolve(null),
    ])

    const alphaQuote = alphaQuoteRes ? await alphaQuoteRes.json() : null
    const finnhubQuote = finnhubQuoteRes ? await finnhubQuoteRes.json() : null
    const profile = profileRes ? await profileRes.json() : {}

    const alpha = alphaQuote?.['Global Quote']
    const alphaPrice = alpha?.['05. price'] ? parseFloat(alpha['05. price']) : undefined
    const alphaOpen = alpha?.['02. open'] ? parseFloat(alpha['02. open']) : undefined
    const alphaHigh = alpha?.['03. high'] ? parseFloat(alpha['03. high']) : undefined
    const alphaLow = alpha?.['04. low'] ? parseFloat(alpha['04. low']) : undefined
    const alphaPrevClose = alpha?.['08. previous close']
      ? parseFloat(alpha['08. previous close'])
      : undefined
    const alphaChange = alpha?.['09. change'] ? parseFloat(alpha['09. change']) : undefined
    const alphaChangePercent = alpha?.['10. change percent']
      ? parseFloat(String(alpha['10. change percent']).replace('%', ''))
      : undefined

    const useAlpha = alphaPrice != null && Number.isFinite(alphaPrice)
    const finnhubPrice =
      finnhubQuote?.c != null && Number.isFinite(finnhubQuote.c) ? finnhubQuote.c : undefined

    if (!useAlpha && finnhubPrice == null) {
      return NextResponse.json({ error: 'Invalid symbol or no data' }, { status: 404 })
    }

    return NextResponse.json({
      symbol: uppercaseSymbol,
      name: profile.name || uppercaseSymbol,
      price: useAlpha ? alphaPrice : finnhubPrice,
      change: useAlpha ? alphaChange : finnhubQuote?.d,
      changePercent: useAlpha ? alphaChangePercent : finnhubQuote?.dp,
      high: useAlpha ? alphaHigh : finnhubQuote?.h,
      low: useAlpha ? alphaLow : finnhubQuote?.l,
      open: useAlpha ? alphaOpen : finnhubQuote?.o,
      previousClose: useAlpha ? alphaPrevClose : finnhubQuote?.pc,
      logo: profile.logo,
      industry: profile.finnhubIndustry,
      marketCap: profile.marketCapitalization,
      weburl: profile.weburl,
      exchange: profile.exchange,
      source: useAlpha ? 'Alpha Vantage' : 'Finnhub',
    })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
