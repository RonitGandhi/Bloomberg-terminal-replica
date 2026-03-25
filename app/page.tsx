'use client'

import { useState, useEffect } from 'react'
import { NewsItem } from '@/hooks/use-market-data'
import { clearClientDatabase } from '@/lib/client-db'
import { usePersistedState } from '@/hooks/use-persisted-state'
import { TerminalHeader } from '@/components/terminal/header'
import { MarketTicker } from '@/components/terminal/market-ticker'
import { Watchlist } from '@/components/terminal/watchlist'
import { StockChart } from '@/components/terminal/stock-chart'
import { StockDetails } from '@/components/terminal/stock-details'
import { NewsFeed } from '@/components/terminal/news-feed'
import { NewsDetail } from '@/components/terminal/news-detail'
import { AIInsights } from '@/components/terminal/ai-insights'
import { CommandBar } from '@/components/terminal/command-bar'
import { StatusBar } from '@/components/terminal/status-bar'

export default function TerminalPage() {
  const { value: selectedSymbol, setValue: setSelectedSymbol } = usePersistedState<string>('selected-symbol', 'AAPL')
  const { value: activePanel, setValue: setActivePanel } = usePersistedState<'chart' | 'news'>('active-panel', 'chart')
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [watchlistFocusRequest, setWatchlistFocusRequest] = useState(0)
  const [analysisFocusRequest, setAnalysisFocusRequest] = useState(0)

  // Keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol)
    setSelectedNews(null)
    setActivePanel('chart')
  }

  const handleSelectNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem)
    setActivePanel('news')
  }

  const handleNewsLoaded = (items: NewsItem[]) => {
    setSelectedNews((current) => {
      if (items.length === 0) return null
      if (current && items.some((item) => item.id === current.id)) {
        return current
      }
      return items[0]
    })
  }

  const handleResetWorkspace = async () => {
    await clearClientDatabase()
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TerminalHeader
        onOpenSearch={() => setCommandBarOpen(true)}
        onShowMarkets={() => setActivePanel('chart')}
        onShowNews={() => setActivePanel('news')}
        onOpenWatchlist={() => setWatchlistFocusRequest((value) => value + 1)}
        onShowAnalysis={() => setAnalysisFocusRequest((value) => value + 1)}
        onResetWorkspace={handleResetWorkspace}
      />
      <MarketTicker onSelectSymbol={handleSelectStock} />
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Watchlist */}
        <aside className="w-64 shrink-0 p-2 hidden lg:block">
          <Watchlist 
            onSelectStock={handleSelectStock} 
            selectedSymbol={selectedSymbol} 
            focusInputRequest={watchlistFocusRequest}
          />
        </aside>
        
        {/* Center - Main Content Area */}
        <div className="flex-1 flex flex-col p-2 gap-2 min-w-0">
          {/* Panel Tabs for Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setActivePanel('chart')}
              className={`flex-1 py-2 text-xs font-medium rounded ${
                activePanel === 'chart' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setActivePanel('news')}
              className={`flex-1 py-2 text-xs font-medium rounded ${
                activePanel === 'news' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              News
            </button>
          </div>
          
          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-2 lg:flex-1">
            <div className="h-full min-h-[450px]">
              <StockChart symbol={selectedSymbol} />
            </div>
            <div className="h-full min-h-[450px]">
              <NewsFeed 
                onSelectNews={handleSelectNews} 
                selectedId={selectedNews?.id} 
                symbol={selectedSymbol}
                onNewsLoaded={handleNewsLoaded}
              />
            </div>
          </div>
          
          {/* Mobile: Single Panel */}
          <div className="flex-1 lg:hidden h-full min-h-[450px]">
            {activePanel === 'chart' ? (
              <StockChart symbol={selectedSymbol} />
            ) : (
              <NewsFeed 
                onSelectNews={handleSelectNews} 
                selectedId={selectedNews?.id} 
                symbol={selectedSymbol}
                onNewsLoaded={handleNewsLoaded}
              />
            )}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <aside className="w-80 shrink-0 p-2 hidden xl:flex flex-col gap-2">
          <div className="h-1/3">
            <StockDetails symbol={selectedSymbol} />
          </div>
          <div className="h-1/3">
            {selectedNews ? (
              <NewsDetail news={selectedNews} />
            ) : (
              <div className="h-full bg-card border border-border rounded flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Select a news article</p>
              </div>
            )}
          </div>
          <div className="h-1/3">
            <AIInsights
              symbol={selectedSymbol}
              news={selectedNews || undefined}
              focusInputRequest={analysisFocusRequest}
            />
          </div>
        </aside>
      </main>
      
      <StatusBar />
      
      {/* Command Bar */}
      <CommandBar 
        isOpen={commandBarOpen} 
        onClose={() => setCommandBarOpen(false)}
        onSelectStock={handleSelectStock}
      />
    </div>
  )
}
