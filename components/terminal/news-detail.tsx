'use client'

import { NewsItem } from '@/hooks/use-market-data'
import { Clock, ExternalLink, Share2, Bookmark } from 'lucide-react'

interface NewsDetailProps {
  news: NewsItem
}

export function NewsDetail({ news }: NewsDetailProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <span className="text-xs font-medium text-primary">ARTICLE</span>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-muted rounded">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-muted rounded">
            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <a 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 hover:bg-muted rounded"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-medium">
            {news.category || 'News'}
          </span>
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{formatTime(news.timestamp)}</span>
          </div>
        </div>
        
        <h2 className="text-sm font-bold text-foreground mb-2 leading-snug">
          {news.title}
        </h2>
        
        <div className="text-xs text-terminal-amber mb-4">
          {news.source}
        </div>
        
        {news.image && (
          <div className="mb-4 rounded overflow-hidden">
            <img 
              src={news.image} 
              alt={news.title}
              className="w-full h-32 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
        
        {news.summary && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {news.summary}
          </p>
        )}
        
        <a 
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-terminal-cyan hover:underline"
        >
          Read full article
          <ExternalLink className="h-3 w-3" />
        </a>
        
        {news.relatedSymbols && news.relatedSymbols.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Related Tickers</div>
            <div className="flex flex-wrap gap-2">
              {news.relatedSymbols.map((sym) => (
                <span key={sym} className="px-2 py-1 bg-muted text-xs font-mono rounded">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
