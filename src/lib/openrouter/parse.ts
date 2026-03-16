import { Opportunity } from '@/types'
import { TavilyResult } from '@/lib/tavily/search'
import { stringifyToonArray, parseToonArray } from '@/lib/toon'

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'

// OpenRouter Fallback Routing: It will try these models in order.
// If DeepSeek throws a 500 error, it instantly falls back to Claude Haiku, then GPT-3.5.
const FALLBACK_MODELS = [
  'deepseek/deepseek-chat',
  'anthropic/claude-3-haiku',
  'openai/gpt-3.5-turbo',
]

const SYSTEM_PROMPT = `You are a structured data extraction assistant.
Your ONLY job is to extract scholarship and research opportunity data from raw web search results.
You MUST return ONLY a valid TOON format table (Token-Oriented Object Notation) — no markdown fences, no explanation, no preamble.
TOON format uses a single comma-separated header row, followed by rows of comma-separated values.
Do NOT use JSON.
Each row must strictly represent an object with these exact header fields:
title,provider,deadline,funding_type,location,field,description,source_url

Rules for values:
- "title": name of the scholarship or program
- "provider": organisation or institution offering it
- "deadline": application deadline date or 'Rolling' or 'Not specified'
- "funding_type": one of: Fully Funded, Partial Funding, Stipend Only, Unknown
- "location": country or region
- "field": field/discipline this is for
- "description": 2 to 3 sentences about the opportunity
- "source_url": the original URL of the result
- Escape values containing commas by wrapping them in double quotes (e.g. "Value, with comma")
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

  const userContentHeader = 'Here are raw web search results. Extract all scholarship and research opportunities you find. Return the data ONLY as a valid TOON format table:\n\n'
  const userContentData = stringifyToonArray(rawResults)
  const userContent = userContentHeader + userContentData

  const res = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'PeakPath AI',
    },
    body: JSON.stringify({
      models: FALLBACK_MODELS,
      route: 'fallback', // Explicitly tell OpenRouter to use fallback routing
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
    console.error('--- OPENROUTER RAW ERROR ---')
    console.error(err)
    console.error('----------------------------')
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
    // Parse TOON format
    let parsed = parseToonArray(cleaned)
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      console.error('Parsed result was not an array:', parsed)
      return []
    }

    let mapped = parsed.map((item: any) => ({
      title: item.title ?? 'Untitled',
      provider: item.provider ?? 'Unknown',
      deadline: item.deadline ?? 'Not specified',
      funding_type: item.funding_type ?? 'Unknown',
      location: item.location ?? 'Not specified',
      field: item.field ?? 'General',
      description: item.description ?? '',
      source_url: item.source_url ?? '',
    }))

    // Deduplication Level 2: Filter same title/source_url within parsing batch
    const seenTitles = new Set<string>()
    const seenUrls = new Set<string>()

    const deduped: any[] = []
    for (const opp of mapped) {
      const lowerTitle = opp.title.trim().toLowerCase()
      const lowerUrl = opp.source_url.trim().toLowerCase()
      
      let isDuplicate = false
      if (lowerTitle && seenTitles.has(lowerTitle)) isDuplicate = true
      if (lowerUrl && seenUrls.has(lowerUrl)) isDuplicate = true
      
      if (!isDuplicate) {
        if (lowerTitle) seenTitles.add(lowerTitle)
        if (lowerUrl) seenUrls.add(lowerUrl)
        deduped.push(opp)
      }
    }

    return deduped
  } catch (err) {
    console.error('Model returned malformed TOON or plain text:', rawText)
    console.error('Parse error:', err)
    return []
  }
}
