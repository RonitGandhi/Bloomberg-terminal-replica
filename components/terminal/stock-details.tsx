'use client'

import { useStockProfile } from '@/hooks/use-market-data'
import { Info, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockDetailsProps {
  symbol: string | null
}

export function StockDetails({ symbol }: StockDetailsProps) {
  const { profile, isLoading } = useStockProfile(symbol)
  const yahooFinanceUrl = symbol
    ? `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`
    : null

  if (!symbol) {
    return (
      <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-b border-border">
          <Info className="w-3.5 h-3.5 text-terminal-cyan" />
          <span className="text-xs font-medium text-primary">STOCK DETAILS</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a stock to view details
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-b border-border">
          <Info className="w-3.5 h-3.5 text-terminal-cyan" />
          <span className="text-xs font-medium text-primary">STOCK DETAILS</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const formatNumber = (num: number | undefined, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '--'
    return num.toFixed(decimals)
  }

  const formatLargeNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) return '--'
    if (num >= 1000) return `${(num / 1000).toFixed(2)}T`
    if (num >= 1) return `${num.toFixed(2)}B`
    return `${(num * 1000).toFixed(2)}M`
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-terminal-cyan" />
          <span className="text-xs font-medium text-primary">STOCK DETAILS</span>
        </div>
        {yahooFinanceUrl && (
          <a
            href={yahooFinanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-terminal-cyan hover:underline flex items-center gap-1"
            title="Open on Yahoo Finance"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Company info */}
        <div className="pb-3 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            {profile?.logo && (
              <img 
                src={profile.logo} 
                alt={profile.name} 
                className="w-6 h-6 rounded bg-secondary"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <span className="font-bold text-primary">{symbol}</span>
          </div>
          <p className="text-xs text-foreground">{profile?.name || symbol}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            {profile?.industry && <span>{profile.industry}</span>}
            {profile?.exchange && <span>• {profile.exchange}</span>}
          </div>
        </div>

        {/* Key metrics */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market Cap</span>
            <span className="font-mono">{formatLargeNumber(profile?.marketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">P/E Ratio</span>
            <span className="font-mono">{formatNumber(profile?.peRatio)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">EPS</span>
            <span className="font-mono">{profile?.eps ? `$${formatNumber(profile.eps)}` : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dividend Yield</span>
            <span className="font-mono">{profile?.dividend ? `${formatNumber(profile.dividend)}%` : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Beta</span>
            <span className="font-mono">{formatNumber(profile?.beta)}</span>
          </div>
        </div>

        {/* 52 Week Range */}
        {(profile?.week52High || profile?.week52Low) && (
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">52 Week Range</div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-terminal-red via-terminal-amber to-terminal-green"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>${formatNumber(profile?.week52Low)}</span>
              <span>${formatNumber(profile?.week52High)}</span>
            </div>
          </div>
        )}

        {/* Financial Health */}
        {(profile?.revenueGrowth !== undefined || profile?.profitMargin !== undefined) && (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="text-xs text-muted-foreground">Financial Health</div>
            {profile.revenueGrowth !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Revenue Growth</span>
                <span className={cn(
                  'font-mono',
                  profile.revenueGrowth > 0 ? 'text-terminal-green' : 'text-terminal-red'
                )}>
                  {profile.revenueGrowth > 0 ? '+' : ''}{formatNumber(profile.revenueGrowth)}%
                </span>
              </div>
            )}
            {profile.profitMargin !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Profit Margin</span>
                <span className={cn(
                  'font-mono',
                  profile.profitMargin > 0 ? 'text-terminal-green' : 'text-terminal-red'
                )}>
                  {formatNumber(profile.profitMargin)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
