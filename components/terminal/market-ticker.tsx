'use client'

import { useMarketIndices } from '@/hooks/use-market-data'
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketTickerProps {
  onSelectSymbol: (symbol: string) => void
}

export function MarketTicker({ onSelectSymbol }: MarketTickerProps) {
  const { indices, isLoading, refresh } = useMarketIndices()

  if (isLoading && indices.length === 0) {
    return (
      <div className="flex items-center gap-6 px-4 py-2 bg-muted border-b border-border overflow-x-auto">
        <span className="text-muted-foreground text-xs">Loading market data...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-muted border-b border-border overflow-x-auto">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>MARKETS</span>
        <button 
          onClick={() => refresh()}
          className="p-1 hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-6">
        {indices.map((index) => {
          const isPositive = (index.change ?? 0) > 0
          const isNeutral = (index.change ?? 0) === 0

          return (
            <button
              key={index.symbol}
              type="button"
              onClick={() => onSelectSymbol(index.displaySymbol)}
              className="flex items-center gap-3 shrink-0 hover:bg-background/50 rounded px-2 py-1 transition-colors"
              title={`Open ${index.symbol} details`}
            >
              <div className="text-xs">
                <span className="text-primary font-medium">{index.symbol}</span>
              </div>
              <div className="text-xs font-medium">
                {index.price?.toFixed(2)}
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isNeutral ? 'text-muted-foreground' : isPositive ? 'text-terminal-green' : 'text-terminal-red'
              )}>
                {isNeutral ? (
                  <Minus className="w-3 h-3" />
                ) : isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {isPositive ? '+' : ''}{index.change?.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  ({isPositive ? '+' : ''}{index.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
        <span>LIVE</span>
      </div>
    </div>
  )
}
