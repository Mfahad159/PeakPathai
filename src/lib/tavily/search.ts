import { Profile } from '@/types'

export interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

interface TavilyResponse {
  results: TavilyResult[]
}

function buildQueries(profile: Profile): string[] {
  const year = new Date().getFullYear()
  const field = profile.field_of_study ?? 'general'
  const degree = profile.degree_level ?? 'graduate'
  const country = profile.country ?? ''
  const funding = profile.funding_preference === 'fully_funded'
    ? 'fully funded'
    : profile.funding_preference === 'partial'
    ? 'partial funding'
    : ''

  return [
    `${funding} ${field} scholarships for ${degree} students ${year} apply now`,
    `research fellowship programs ${field} ${country} ${degree} ${year} open applications`,
  ].map(q => q.replace(/\s+/g, ' ').trim())
}

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 8,
      include_answer: false,
      include_raw_content: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Tavily API error ${res.status}: ${err}`)
  }

  const data: TavilyResponse = await res.json()
  return data.results ?? []
}

export async function searchOpportunities(profile: Profile): Promise<TavilyResult[]> {
  const queries = buildQueries(profile)

  // Run both queries in parallel
  const results = await Promise.allSettled(queries.map(q => tavilySearch(q)))

  const combined: TavilyResult[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value)
    } else {
      console.error('Tavily query failed:', result.reason)
    }
  }

  // Deduplicate by URL and limit total results to 15 (safely under 20)
  const seen = new Set<string>()
  const unique = combined.filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
  
  return unique.slice(0, 15)
}
