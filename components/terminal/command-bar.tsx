'use client'

import { useState, useEffect, useRef } from 'react'
import { useStockSearch } from '@/hooks/use-market-data'
import { cn } from '@/lib/utils'
import { Search, Command, Loader2 } from 'lucide-react'

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  onSelectStock: (symbol: string) => void
}

export function CommandBar({ isOpen, onClose, onSelectStock }: CommandBarProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { results, isLoading } = useStockSearch(query)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
      }
      
      if (!isOpen) return
      
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          onSelectStock(results[selectedIndex].symbol)
          onClose()
        } else if (query.trim()) {
          // Allow direct symbol entry
          onSelectStock(query.trim().toUpperCase())
          onClose()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, onSelectStock, query])

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Search stocks by symbol or name..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <kbd className="px-2 py-1 text-[10px] bg-muted rounded border border-border">ESC</kbd>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {query.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type to search for stocks...
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="px-4 py-4">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  No results found for "{query}"
                </div>
                <button
                  onClick={() => {
                    onSelectStock(query.trim().toUpperCase())
                    onClose()
                  }}
                  className="w-full px-4 py-3 text-left bg-muted/50 hover:bg-muted rounded transition-colors"
                >
                  <div className="text-sm font-medium">Try "{query.toUpperCase()}" anyway</div>
                  <div className="text-xs text-muted-foreground">Search as direct symbol</div>
                </button>
              </div>
            ) : (
              results.map((result, index) => (
                <button
                  key={result.symbol}
                  onClick={() => {
                    onSelectStock(result.symbol)
                    onClose()
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                    index === selectedIndex ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-bold text-primary">
                      {result.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{result.symbol}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{result.name}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="flex items-center justify-between px-4 py-2 bg-muted border-t border-border text-[10px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-card rounded border border-border">&#8593;&#8595;</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-card rounded border border-border">&#8629;</kbd>
                Select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>K to search</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
