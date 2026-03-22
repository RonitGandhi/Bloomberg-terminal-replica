'use client'

import { useEffect, useState } from 'react'
import { useChartData, useStockInsights, useStockQuote } from '@/hooks/use-market-data'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockChartProps {
  symbol: string | null
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y'

export function StockChart({ symbol }: StockChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [mounted, setMounted] = useState(false)
  const { chartData, isLoading: chartLoading } = useChartData(symbol, timeRange)
  const { quote, isLoading: quoteLoading } = useStockQuote(symbol)
  const { insights, isLoading: insightsLoading } = useStockInsights(symbol)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!symbol) {
    return (
      <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a stock to view chart</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate chart stats
  const prices = chartData.map(d => d.close).filter(p => p > 0)
  const highs = chartData.map(d => d.high).filter(p => p > 0)
  const lows = chartData.map(d => d.low).filter(p => p > 0)
  const latestClose = chartData.length > 0 ? chartData[chartData.length - 1].close : undefined
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.995 : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.005 : 100
  const firstPrice = chartData.length > 0 ? chartData[0].close : 0
  const chartOpen = chartData.length > 0 ? chartData[0].open : undefined
  const chartHigh = highs.length > 0 ? Math.max(...highs) : undefined
  const chartLow = lows.length > 0 ? Math.min(...lows) : undefined
  const chartPrevClose =
    chartData.length > 1 ? chartData[chartData.length - 2].close : undefined
  const resistance = highs.length > 0 ? Math.max(...highs) : undefined
  const support = lows.length > 0 ? Math.min(...lows) : undefined
  const momentumPercent =
    chartData.length > 1 && chartData[0].close > 0
      ? ((chartData[chartData.length - 1].close - chartData[0].close) / chartData[0].close) * 100
      : undefined
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y']
  const displayPrice = latestClose ?? quote?.price
  const displayOpen = quote?.open && quote.open > 0 ? quote.open : chartOpen
  const displayHigh = quote?.high && quote.high > 0 ? quote.high : chartHigh
  const displayLow = quote?.low && quote.low > 0 ? quote.low : chartLow
  const displayPrevClose =
    quote?.previousClose && quote.previousClose > 0
      ? quote.previousClose
      : chartPrevClose
  const displayChange =
    displayPrice != null && displayPrevClose != null
      ? displayPrice - displayPrevClose
      : quote?.change
  const displayChangePercent =
    displayPrice != null && displayPrevClose != null && displayPrevClose > 0
      ? ((displayPrice - displayPrevClose) / displayPrevClose) * 100
      : quote?.changePercent
  const isPositive = displayChange != null ? displayChange >= 0 : true

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{symbol}</span>
              {quoteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-xs text-muted-foreground">{quote?.name || symbol}</span>
              )}
            </div>
            {displayPrice != null && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  isPositive ? "text-terminal-green" : "text-terminal-red"
                )}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{displayChange != null ? `${isPositive ? '+' : ''}${displayChange.toFixed(2)}` : '--'}</span>
                  <span>({displayChangePercent != null ? `${isPositive ? '+' : ''}${displayChangePercent.toFixed(2)}%` : '--'})</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                timeRange === range 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="px-3 pt-3">
        <div className="h-[240px] sm:h-[280px] xl:h-[320px]">
        {!mounted || (chartLoading && chartData.length === 0) ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? "oklch(0.65 0.2 145)" : "oklch(0.55 0.22 25)"} 
                    stopOpacity={0.4}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? "oklch(0.65 0.2 145)" : "oklch(0.55 0.22 25)"} 
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.6 0 0)', fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.6 0 0)', fontSize: 10 }}
                tickFormatter={(val) => `$${val.toFixed(0)}`}
                width={55}
                orientation="right"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(0.12 0 0)',
                  border: '1px solid oklch(0.22 0 0)',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'oklch(0.6 0 0)' }}
                itemStyle={{ color: 'oklch(0.9 0 0)' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              {firstPrice > 0 && (
                <ReferenceLine 
                  y={firstPrice} 
                  stroke="oklch(0.4 0 0)" 
                  strokeDasharray="3 3" 
                />
              )}
              <Area
                type="linear"
                dataKey="close"
                stroke={isPositive ? "oklch(0.65 0.2 145)" : "oklch(0.55 0.22 25)"}
                strokeWidth={2}
                fill="url(#colorPrice)"
                isAnimationActive={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>
      
      {/* Stats */}
      {quote && (
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-muted border-t border-border text-xs">
          <div>
            <span className="text-muted-foreground">Open</span>
            <span className="block font-mono">{displayOpen != null ? `$${displayOpen.toFixed(2)}` : '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">High</span>
            <span className="block font-mono text-terminal-green">{displayHigh != null ? `$${displayHigh.toFixed(2)}` : '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Low</span>
            <span className="block font-mono text-terminal-red">{displayLow != null ? `$${displayLow.toFixed(2)}` : '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Prev Close</span>
            <span className="block font-mono">{displayPrevClose != null ? `$${displayPrevClose.toFixed(2)}` : '--'}</span>
          </div>
        </div>
      )}

      <div className="border-t border-border px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary">CHART ANALYSIS</span>
          {insights?.sentiment && (
            <span className="text-[10px] px-2 py-1 rounded bg-muted text-foreground">
              Sentiment: {insights.sentiment}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs xl:grid-cols-4">
          <div className="rounded border border-border bg-secondary/40 p-2">
            <div className="text-muted-foreground">Support</div>
            <div className="mt-1 font-medium">{support != null ? `$${support.toFixed(2)}` : '--'}</div>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2">
            <div className="text-muted-foreground">Resistance</div>
            <div className="mt-1 font-medium">{resistance != null ? `$${resistance.toFixed(2)}` : '--'}</div>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2">
            <div className="text-muted-foreground">Trend</div>
            <div className={cn(
              'mt-1 font-medium',
              momentumPercent != null && momentumPercent >= 0 ? 'text-terminal-green' : 'text-terminal-red'
            )}>
              {momentumPercent != null ? `${momentumPercent >= 0 ? '+' : ''}${momentumPercent.toFixed(2)}%` : '--'}
            </div>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2">
            <div className="text-muted-foreground">Consensus</div>
            <div className="mt-1 font-medium">{insights?.analystConsensus || '--'}</div>
          </div>
        </div>

        <div className="grid gap-3 text-xs xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded border border-border bg-secondary/30 p-3">
            <div className="text-muted-foreground mb-2">AI-style chart take</div>
            <p className="leading-relaxed text-foreground">
              {support != null && resistance != null && momentumPercent != null
                ? `${symbol} is trading ${momentumPercent >= 0 ? 'above' : 'below'} its starting point for this ${timeRange} view, with support near $${support.toFixed(2)} and resistance near $${resistance.toFixed(2)}. ${
                    Math.abs(momentumPercent) > 4
                      ? 'Momentum is strong enough to suggest an active directional move rather than a flat range.'
                      : 'Price action is relatively balanced, which suggests a range-bound setup unless volume or news shifts the trend.'
                  } ${
                    insights?.targetMean
                      ? `Analyst targets center around $${insights.targetMean.toFixed(2)}, implying ${insights.upsidePercent && insights.upsidePercent >= 0 ? 'potential upside' : 'limited upside'} of ${insights?.upsidePercent?.toFixed(1) ?? '--'}%.`
                      : ''
                  }`
                : 'Waiting for enough chart data to generate a useful summary.'}
            </p>
            <div className="mt-3 text-[10px] text-muted-foreground">
              Sentiment source: {insights?.sentimentSource || 'Chart-derived'}
            </div>
          </div>

          <div className="rounded border border-border bg-secondary/30 p-3">
            <div className="text-muted-foreground mb-2">Analyst ratings</div>
            {insightsLoading ? (
              <div className="text-muted-foreground">Loading ratings...</div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Buy</span>
                  <span className="font-medium">{insights?.buy ?? '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hold</span>
                  <span className="font-medium">{insights?.hold ?? '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sell</span>
                  <span className="font-medium">{insights?.sell ?? '--'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span>Mean target</span>
                  <span className="font-medium">
                    {insights?.targetMean != null ? `$${insights.targetMean.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upside</span>
                  <span className={cn(
                    'font-medium',
                    (insights?.upsidePercent ?? 0) >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                  )}>
                    {insights?.upsidePercent != null ? `${insights.upsidePercent >= 0 ? '+' : ''}${insights.upsidePercent.toFixed(2)}%` : '--'}
                  </span>
                </div>
                <div className="pt-2 border-t border-border text-[10px] text-muted-foreground">
                  Source: {insights?.ratingsSource || 'Finnhub'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
