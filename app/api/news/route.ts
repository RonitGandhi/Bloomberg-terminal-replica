import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || 'general'
  const symbol = request.nextUrl.searchParams.get('symbol')
  
  if (!FINNHUB_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    let url: string
    
    if (symbol) {
      // Company-specific news
      const from = new Date()
      from.setDate(from.getDate() - 7)
      const to = new Date()
      
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`
    } else {
      // Market news by category
      url = `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
    }
    
    const res = await fetch(url)
    const data = await res.json()
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ news: [] })
    }
    
    const news = data.slice(0, 50).map((item: {
      id: number
      headline: string
      summary: string
      source: string
      url: string
      image: string
      datetime: number
      category: string
      related: string
    }) => ({
      id: item.id || Math.random().toString(36),
      title: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      timestamp: item.datetime * 1000,
      category: item.category || category,
      relatedSymbols: item.related ? item.related.split(',').filter(Boolean) : []
    }))
    
    return NextResponse.json({ news })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
