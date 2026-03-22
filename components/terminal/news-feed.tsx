'use client'

import { useState } from 'react'
import { useNews, NewsItem } from '@/hooks/use-market-data'
import { cn } from '@/lib/utils'
import { Newspaper, ExternalLink, Clock, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewsFeedProps {
  onSelectNews: (news: NewsItem) => void
  selectedId?: string
  symbol?: string
}

export function NewsFeed({ onSelectNews, selectedId, symbol }: NewsFeedProps) {
  const [category, setCategory] = useState<string>('general')
  const { news, isLoading, refresh } = useNews(symbol ? undefined : category, symbol)
  
  const categories = [
    { value: 'general', label: 'All' },
    { value: 'technology', label: 'Tech' },
    { value: 'business', label: 'Business' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'forex', label: 'Forex' },
    { value: 'merger', label: 'M&A' },
  ]

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            {symbol ? `${symbol} NEWS` : 'MARKET NEWS'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{news.length} articles</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => refresh()}
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      {/* Category filters */}
      {!symbol && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded transition-colors shrink-0",
                category === cat.value 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {isLoading && news.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No news available
          </div>
        ) : (
          news.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectNews(item)}
              className={cn(
                "px-3 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors",
                selectedId === item.id && "bg-primary/10"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5 hover:text-foreground" />
                </a>
              </div>
              
              {item.summary && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                  {item.summary}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="font-medium text-terminal-amber">{item.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{formatTime(item.timestamp)}</span>
                </div>
                {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                  <div className="flex items-center gap-1">
                    {item.relatedSymbols.slice(0, 3).map((sym) => (
                      <span key={sym} className="px-1 py-0.5 bg-muted rounded text-primary">
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
