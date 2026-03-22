'use client'

import { useState, useEffect } from 'react'
import { Activity, Bell, Search, Settings, Zap } from 'lucide-react'

export function TerminalHeader() {
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
          <span className="px-2 py-1 bg-muted rounded">MARKETS</span>
          <span className="px-2 py-1 hover:bg-muted rounded cursor-pointer">NEWS</span>
          <span className="px-2 py-1 hover:bg-muted rounded cursor-pointer">WATCHLIST</span>
          <span className="px-2 py-1 hover:bg-muted rounded cursor-pointer">ANALYSIS</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded text-xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Search ticker...</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground border border-border">⌘K</kbd>
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 text-terminal-green" />
            <span className="text-terminal-green">LIVE</span>
          </div>
          <Bell className="h-4 w-4 cursor-pointer hover:text-foreground" />
          <Settings className="h-4 w-4 cursor-pointer hover:text-foreground" />
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
