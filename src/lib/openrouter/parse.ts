import { Opportunity } from '@/types'
import { TavilyResult } from '@/lib/tavily/search'

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'deepseek/deepseek-chat'

const SYSTEM_PROMPT = `You are a structured data extraction assistant.
Your ONLY job is to extract scholarship and research opportunity data from raw web search results.
You MUST return ONLY a valid JSON array — no markdown fences, no explanation, no preamble.
Each object in the array must have these exact fields:
{
  "title": "string — name of the scholarship or program",
  "provider": "string — organisation or institution offering it",
  "deadline": "string — application deadline date or 'Rolling' or 'Not specified'",
  "funding_type": "string — one of: Fully Funded, Partial Funding, Stipend Only, Unknown",
  "location": "string — country or region",
  "field": "string — field/discipline this is for",
  "description": "string — 2 to 3 sentences about the opportunity",
  "source_url": "string — the original URL of the result"
}
If a field cannot be determined, use "Not specified".
Do not include duplicates. Do not include results that are clearly not scholarships or research programs.`

type RawOpportunity = {
  title: string
  provider: string
  deadline: string
  funding_type: string
  location: string
  field: string
  description: string
  source_url: string
}

export async function parseOpportunities(
  rawResults: TavilyResult[]
): Promise<Omit<Opportunity, 'id' | 'user_id' | 'saved' | 'seen' | 'created_at' | 'raw_data'>[]> {
  if (rawResults.length === 0) return []

  const userContent = `Here are raw web search results. Extract all scholarship and research opportunities you find:\n\n${rawResults
    .map((r, i) => `[Result ${i + 1}]\nTitle: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
    .join('\n\n---\n\n')}`

  const res = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'PeakPath AI',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const rawText: string = data.choices?.[0]?.message?.content ?? ''

  // Strip any accidental markdown code fences
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    const parsed: RawOpportunity[] = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) throw new Error('Not an array')

    return parsed.map((item) => ({
      title: item.title ?? 'Untitled',
      provider: item.provider ?? 'Unknown',
      deadline: item.deadline ?? 'Not specified',
      funding_type: item.funding_type ?? 'Unknown',
      location: item.location ?? 'Not specified',
      field: item.field ?? 'General',
      description: item.description ?? '',
      source_url: item.source_url ?? '',
    }))
  } catch (err) {
    console.error('DeepSeek returned malformed JSON:', rawText)
    console.error('Parse error:', err)
    return []
  }
}
