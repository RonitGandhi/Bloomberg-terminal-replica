import { NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-8B-Instruct'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  const { messages, context } = (await req.json()) as {
    messages?: ChatMessage[]
    context?: string
  }

  if (!HF_TOKEN) {
    return NextResponse.json(
      { error: 'HF_TOKEN is not configured' },
      { status: 500 }
    )
  }

  const systemPrompt = `You are a senior financial analyst providing insights on market data, stock performance, and financial news.

${context ? `Current Context: ${context}` : ''}

Your responses should be:
- Concise and data-driven (2-3 paragraphs max)
- Professional in tone
- Include specific metrics when relevant
- Highlight key risks and opportunities
- Use bullet points for clarity when appropriate

Always provide balanced analysis considering multiple perspectives. Do not make specific buy/sell recommendations - provide analysis only.`

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HUGGINGFACE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...((messages || []).filter(
            (message) =>
              message &&
              typeof message.role === 'string' &&
              typeof message.content === 'string'
          ) as ChatMessage[]),
        ],
        max_tokens: 500,
        stream: false,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || data?.error || 'Hugging Face request failed'

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const text = data?.choices?.[0]?.message?.content

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No response text returned from Hugging Face' },
        { status: 502 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}
