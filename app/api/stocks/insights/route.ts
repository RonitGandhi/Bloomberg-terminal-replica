import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function buildSentiment(params: {
  buy: number
  hold: number
  sell: number
  upsidePercent?: number
}) {
  const { buy, hold, sell, upsidePercent } = params
  const score = buy * 2 + hold - sell * 2 + (upsidePercent ?? 0) / 10

  if (score >= 6) return 'Bullish'
  if (score >= 2) return 'Moderately Bullish'
  if (score <= -6) return 'Bearish'
  if (score <= -2) return 'Moderately Bearish'
  return 'Neutral'
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const uppercaseSymbol = symbol.toUpperCase()

    const [recommendationRes, targetRes, quoteRes, newsSentimentRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/recommendation?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/price-target?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/news-sentiment?symbol=${uppercaseSymbol}&token=${FINNHUB_API_KEY}`
      ),
    ])

    const recommendations = await recommendationRes.json()
    const target = await targetRes.json()
    const quote = await quoteRes.json()
    const newsSentiment = await newsSentimentRes.json()

    const latestRecommendation =
      Array.isArray(recommendations) && recommendations.length > 0
        ? recommendations[0]
        : {}

    const buy =
      Number(latestRecommendation.buy || 0) +
      Number(latestRecommendation.strongBuy || 0)
    const hold = Number(latestRecommendation.hold || 0)
    const sell =
      Number(latestRecommendation.sell || 0) +
      Number(latestRecommendation.strongSell || 0)

    const currentPrice = safeNumber(quote?.c)
    const targetMean = safeNumber(target?.targetMean)
    const targetHigh = safeNumber(target?.targetHigh)
    const targetLow = safeNumber(target?.targetLow)

    const upsidePercent =
      currentPrice && targetMean
        ? ((targetMean - currentPrice) / currentPrice) * 100
        : undefined

    const derivedSentiment = buildSentiment({
      buy,
      hold,
      sell,
      upsidePercent,
    })
    const bullishPercent = safeNumber(newsSentiment?.sentiment?.bullishPercent)
    const bearishPercent = safeNumber(newsSentiment?.sentiment?.bearishPercent)
    const companyNewsScore = safeNumber(newsSentiment?.companyNewsScore)

    const sentiment =
      bullishPercent != null && bearishPercent != null
        ? bullishPercent >= 65
          ? 'Bullish'
          : bullishPercent >= 55
            ? 'Moderately Bullish'
            : bearishPercent >= 65
              ? 'Bearish'
              : bearishPercent >= 55
                ? 'Moderately Bearish'
                : 'Neutral'
        : derivedSentiment

    return NextResponse.json({
      symbol: uppercaseSymbol,
      analystConsensus:
        buy > hold && buy > sell ? 'Buy' : sell > buy && sell > hold ? 'Sell' : 'Hold',
      sentiment,
      sentimentSource:
        bullishPercent != null || companyNewsScore != null
          ? 'Finnhub News Sentiment'
          : 'Derived from Finnhub recommendations and price target',
      ratingsSource: 'Finnhub Recommendation Trends and Price Target',
      recommendationPeriod: latestRecommendation.period,
      buy,
      hold,
      sell,
      strongBuy: Number(latestRecommendation.strongBuy || 0),
      strongSell: Number(latestRecommendation.strongSell || 0),
      targetMean,
      targetHigh,
      targetLow,
      currentPrice,
      upsidePercent,
      bullishPercent,
      bearishPercent,
      companyNewsScore,
    })
  } catch (error) {
    console.error('Stock insights error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock insights' },
      { status: 500 }
    )
  }
}
