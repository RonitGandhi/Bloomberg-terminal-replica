import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface StockQuote {
  symbol: string
  name?: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  logo?: string
  industry?: string
  marketCap?: number
  source?: string
}

export interface StockProfile extends StockQuote {
  weburl?: string
  exchange?: string
  ipo?: string
  shareOutstanding?: number
  country?: string
  currency?: string
  peRatio?: number
  eps?: number
  beta?: number
  dividend?: number
  week52High?: number
  week52Low?: number
  avgVolume?: number
  revenueGrowth?: number
  profitMargin?: number
  debtToEquity?: number
}

export interface ChartDataPoint {
  date: string
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  image?: string
  timestamp: number
  category: string
  relatedSymbols: string[]
}

export interface MarketIndex {
  symbol: string
  displaySymbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
}

export interface SearchResult {
  symbol: string
  name: string
  displaySymbol: string
}

export interface StockInsights {
  symbol: string
  analystConsensus: 'Buy' | 'Hold' | 'Sell'
  sentiment: string
  sentimentSource?: string
  ratingsSource?: string
  recommendationPeriod?: string
  buy: number
  hold: number
  sell: number
  strongBuy: number
  strongSell: number
  targetMean?: number
  targetHigh?: number
  targetLow?: number
  currentPrice?: number
  upsidePercent?: number
  bullishPercent?: number
  bearishPercent?: number
  companyNewsScore?: number
}

// Stock quote hook
export function useStockQuote(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/stocks/quote?symbol=${symbol}` : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  return {
    quote: data as StockQuote | undefined,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Batch quotes for watchlist
export function useBatchQuotes(symbols: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    symbols.length > 0 ? `/api/stocks/batch?symbols=${symbols.join(',')}` : null,
    fetcher,
    { refreshInterval: 15000 } // Refresh every 15 seconds
  )

  return {
    quotes: (data?.quotes || []) as StockQuote[],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Stock profile with metrics
export function useStockProfile(symbol: string | null) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stocks/profile?symbol=${symbol}` : null,
    fetcher
  )

  return {
    profile: data as StockProfile | undefined,
    isLoading,
    isError: error
  }
}

// Chart data
export function useChartData(symbol: string | null, range: string) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/stocks/chart?symbol=${symbol}&range=${range}` : null,
    fetcher,
    { refreshInterval: range === '1D' ? 60000 : 300000 } // 1 min for intraday, 5 min otherwise
  )

  return {
    chartData: (data?.data || []) as ChartDataPoint[],
    isLoading,
    isError: error
  }
}

// News feed
export function useNews(category?: string, symbol?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (symbol) params.set('symbol', symbol)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/news?${params.toString()}`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  return {
    news: (data?.news || []) as NewsItem[],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Market indices
export function useMarketIndices() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/market/indices',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  return {
    indices: (data?.indices || []) as MarketIndex[],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Stock search
export function useStockSearch(query: string) {
  const { data, error, isLoading } = useSWR(
    query.length >= 1 ? `/api/stocks/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { dedupingInterval: 300 }
  )

  return {
    results: (data?.results || []) as SearchResult[],
    isLoading,
    isError: error
  }
}

export function useStockInsights(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/stocks/insights?symbol=${symbol}` : null,
    fetcher,
    { refreshInterval: 300000 }
  )

  return {
    insights: data as StockInsights | undefined,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
