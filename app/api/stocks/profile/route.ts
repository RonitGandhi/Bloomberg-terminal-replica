import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const [profileRes, metricsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`)
    ])

    const profile = await profileRes.json()
    const metrics = await metricsRes.json()

    const m = metrics.metric || {}

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      name: profile.name || symbol,
      logo: profile.logo,
      industry: profile.finnhubIndustry,
      marketCap: profile.marketCapitalization,
      weburl: profile.weburl,
      exchange: profile.exchange,
      ipo: profile.ipo,
      shareOutstanding: profile.shareOutstanding,
      country: profile.country,
      currency: profile.currency,
      // Key metrics
      peRatio: m.peBasicExclExtraTTM || m.peTTM,
      eps: m.epsBasicExclExtraItemsTTM || m.epsTTM,
      beta: m.beta,
      dividend: m.dividendYieldIndicatedAnnual,
      week52High: m['52WeekHigh'],
      week52Low: m['52WeekLow'],
      avgVolume: m.averageVolume10D,
      revenueGrowth: m.revenueGrowthTTMYoy,
      profitMargin: m.netProfitMarginTTM,
      debtToEquity: m.totalDebtToEquityQuarterly
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
