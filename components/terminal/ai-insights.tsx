'use client'

import { useEffect, useRef, useState } from 'react'
import { useStockQuote, NewsItem } from '@/hooks/use-market-data'
import { cn } from '@/lib/utils'
import { Bot, Sparkles, Send, RefreshCw, TrendingUp, Newspaper, BarChart3 } from 'lucide-react'

interface AIInsightsProps {
  symbol?: string | null
  news?: NewsItem
  focusInputRequest?: number
}

const quickPrompts = [
  { icon: TrendingUp, label: 'Analyze Stock', prompt: 'Provide a technical analysis of this stock including support/resistance levels and trading signals.' },
  { icon: BarChart3, label: 'Market Outlook', prompt: 'What is the current market sentiment and outlook for this sector?' },
  { icon: Newspaper, label: 'News Impact', prompt: 'How might recent news events impact this stock\'s price action?' },
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

function normalizeMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

function renderFormattedText(text: string) {
  const cleaned = normalizeMarkdown(text)
  const blocks = cleaned
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const isList = lines.every((line) => /^[-*•]\s+/.test(line))

    if (isList) {
      return (
        <ul key={index} className="space-y-1 list-disc pl-4">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^[-*•]\s+/, '')}</li>
          ))}
        </ul>
      )
    }

    return (
      <p key={index} className="leading-relaxed">
        {block.replace(/\n/g, ' ')}
      </p>
    )
  })
}

export function AIInsights({ symbol, news, focusInputRequest = 0 }: AIInsightsProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { quote } = useStockQuote(symbol || null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [focusInputRequest])

  const buildContext = () => {
    if (quote) {
      return `Stock: ${quote.symbol} (${quote.name}), Price: $${quote.price}, Change: ${
        quote.change >= 0 ? '+' : ''
      }${quote.changePercent?.toFixed(2)}%, Industry: ${quote.industry || 'N/A'}`
    }

    if (news) {
      return `News: ${news.title} (${news.source})`
    }

    return undefined
  }

  const sendPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: buildContext(),
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate AI insights')
      }

      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.text,
        },
      ])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate AI insights'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendPrompt(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    void sendPrompt(prompt)
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI INSIGHTS</span>
          <span className="px-1.5 py-0.5 text-[9px] bg-terminal-cyan/20 text-terminal-cyan rounded">
            LLAMA 3
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Hugging Face</span>
        </div>
      </div>
      
      {/* Quick prompts */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border overflow-x-auto">
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleQuickPrompt(qp.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2 py-1 bg-muted text-[10px] text-muted-foreground rounded hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 disabled:opacity-50"
          >
            <qp.icon className="h-3 w-3" />
            {qp.label}
          </button>
        ))}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Ask for insights about {symbol || 'stocks'} or market analysis
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Powered by an open-source Llama model on Hugging Face
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "text-xs",
                message.role === 'user' ? "text-right" : ""
              )}
            >
              <div
                className={cn(
                  "inline-block max-w-[90%] p-2 rounded",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1 text-terminal-cyan">
                    <Bot className="h-3 w-3" />
                    <span className="text-[10px] font-medium">AI Analysis</span>
                  </div>
                )}
                <div className="space-y-2">{renderFormattedText(message.text)}</div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-terminal-red whitespace-pre-wrap">
            {error}
          </div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this stock or market..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-muted rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
