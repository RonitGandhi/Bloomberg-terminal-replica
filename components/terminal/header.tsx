'use client'

import { useState, useEffect } from 'react'
import { Activity, Bell, Search, Settings, Zap } from 'lucide-react'

interface TerminalHeaderProps {
  onOpenSearch: () => void
  onShowMarkets: () => void
  onShowNews: () => void
  onOpenWatchlist: () => void
  onShowAnalysis: () => void
  onResetWorkspace: () => void
}

export function TerminalHeader({
  onOpenSearch,
  onShowMarkets,
  onShowNews,
  onOpenWatchlist,
  onShowAnalysis,
  onResetWorkspace,
}: TerminalHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-primary">TERMINAL PRO</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <button onClick={onShowMarkets} className="px-2 py-1 bg-muted rounded hover:bg-muted/80">MARKETS</button>
          <button onClick={onShowNews} className="px-2 py-1 hover:bg-muted rounded cursor-pointer">NEWS</button>
          <button onClick={onOpenWatchlist} className="px-2 py-1 hover:bg-muted rounded cursor-pointer">WATCHLIST</button>
          <button onClick={onShowAnalysis} className="px-2 py-1 hover:bg-muted rounded cursor-pointer">ANALYSIS</button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded text-xs hover:bg-muted/80 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Search ticker...</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground border border-border">⌘K</kbd>
        </button>
        
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 text-terminal-green" />
            <span className="text-terminal-green">LIVE</span>
          </div>
          <button type="button" onClick={onShowNews} className="hover:text-foreground">
            <Bell className="h-4 w-4 cursor-pointer" />
          </button>
          <button type="button" onClick={onResetWorkspace} className="hover:text-foreground" title="Reset saved workspace">
            <Settings className="h-4 w-4 cursor-pointer" />
          </button>
        </div>
        
        <div className="text-right text-xs" suppressHydrationWarning>
          <div className="text-foreground font-medium" suppressHydrationWarning>
            {mounted ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </div>
          <div className="text-muted-foreground" suppressHydrationWarning>
            {mounted ? time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '---'}
          </div>
        </div>
      </div>
    </header>
  )
}
