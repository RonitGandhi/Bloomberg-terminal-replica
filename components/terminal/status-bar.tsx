'use client'

import { Activity, Wifi, Database, Clock } from 'lucide-react'

export function StatusBar() {
  return (
    <footer className="flex items-center justify-between px-4 py-1.5 bg-muted border-t border-border text-[10px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-terminal-green" />
          <span>Market: Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-terminal-green" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          <span>Real-time feed</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span>Data delayed 15 min</span>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>NYSE: 09:30 - 16:00 ET</span>
        </div>
      </div>
    </footer>
  )
}
