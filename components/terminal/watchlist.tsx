'use client'

import { useState, useEffect } from 'react'
import { useBatchQuotes, StockQuote } from '@/hooks/use-market-data'
import { TrendingUp, TrendingDown, Star, Plus, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ']

interface WatchlistProps {
  onSelectStock: (symbol: string) => void
  selectedSymbol: string | null
}

export function Watchlist({ onSelectStock, selectedSymbol }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST)
  const { quotes, isLoading, refresh } = useBatchQuotes(watchlist)
  
  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('terminal-watchlist')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed)
        }
      } catch {
        // Use default
      }
    }
  }, [])

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('terminal-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const removeFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setWatchlist(prev => prev.filter(s => s !== symbol))
  }

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol.toUpperCase())) {
      setWatchlist(prev => [...prev, symbol.toUpperCase()])
    }
  }

  // Create a map for quick lookup
  const quoteMap = new Map<string, StockQuote>()
  quotes.forEach(q => quoteMap.set(q.symbol, q))

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">WATCHLIST</span>
          <span className="text-[10px] text-muted-foreground">({watchlist.length})</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => refresh()}
          title="Refresh quotes"
        >
          <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr className="text-muted-foreground text-left">
              <th className="px-3 py-1.5 font-medium">Symbol</th>
              <th className="px-2 py-1.5 font-medium text-right">Last</th>
              <th className="px-2 py-1.5 font-medium text-right">Chg%</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((symbol) => {
              const quote = quoteMap.get(symbol)
              const isSelected = selectedSymbol === symbol
              const change = quote?.change ?? 0
              const changePercent = quote?.changePercent ?? 0
              const isPositive = change > 0

              return (
                <tr
                  key={symbol}
                  onClick={() => onSelectStock(symbol)}
                  className={cn(
                    'cursor-pointer border-b border-border/50 hover:bg-muted/50 transition-colors group',
                    isSelected && 'bg-primary/10'
                  )}
                >
                  <td className="px-3 py-2">
                    <span className={cn(
                      'font-medium',
                      isSelected && 'text-primary'
                    )}>{symbol}</span>
                  </td>
                  <td className="text-right px-2 py-2 font-mono">
                    {quote ? (
                      <span>{quote.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className={cn(
                    'text-right px-2 py-2 font-mono',
                    isPositive ? 'text-terminal-green' : change < 0 ? 'text-terminal-red' : 'text-muted-foreground'
                  )}>
                    {quote ? (
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : change < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
                      </div>
                    ) : '--'}
                  </td>
                  <td className="px-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => removeFromWatchlist(symbol, e)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 border-t border-border bg-secondary/30">
        <AddSymbolInput onAdd={addToWatchlist} existingSymbols={watchlist} />
      </div>
    </div>
  )
}

function AddSymbolInput({ onAdd, existingSymbols }: { onAdd: (symbol: string) => void, existingSymbols: string[] }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const symbol = input.trim().toUpperCase()
    if (symbol && !existingSymbols.includes(symbol)) {
      onAdd(symbol)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder="Add symbol..."
        className="flex-1 bg-input px-2 py-1 text-xs rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        maxLength={10}
      />
      <Button type="submit" variant="ghost" size="icon" className="h-6 w-6" disabled={!input.trim()}>
        <Plus className="w-3 h-3" />
      </Button>
    </form>
  )
}
