import { TavilyResult } from '@/lib/tavily/search'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamObject } from 'ai'
import { z } from 'zod'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const SYSTEM_PROMPT = `You are a strict data extraction engine. You do NOT chat. 
Your ONLY job is to extract scholarship and research opportunity data from the raw web search results provided by the user.
If a field is missing, assign it a default fallback string (e.g. 'Not specified', 'Unknown').
Return exactly what the schema asks for. Do NOT include generic text.
`

const elementSchema = z.object({
  title: z.string().describe("Name of the scholarship or program"),
  provider: z.string().describe("The organization offering the scholarship"),
  deadline: z.string().describe("The stated deadline date, or 'Not specified'"),
  funding_type: z.string().describe("E.g. 'Fully Funded', 'Partial', 'Research Fellowship', etc."),
  location: z.string().describe("Location, country or region of the program"),
  field: z.string().describe("The field or major of study"),
  description: z.string().describe("A 1-2 sentence compelling summary of the opportunity"),
  source_url: z.string().describe("The direct URL to apply or read more")
})

export async function parseOpportunitiesStream(rawResults: TavilyResult[]) {
  const userContentHeader = 'Extract all scholarships and research opportunities from these raw web results:\n\n'
  const userContentData = JSON.stringify(rawResults.map(r => ({ url: r.url, snippet: r.content, title: r.title, content: r.content })))
  
  const result = streamObject({
    model: openrouter.chat('google/gemini-2.0-flash-lite-preview-02-05:free'),
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userContentHeader + userContentData }
    ],
    schema: z.object({
      opportunities: z.array(elementSchema)
    }),
    temperature: 0.1,
  })

  return result.toTextStreamResponse()
}

import { generateObject } from 'ai'

export async function parseOpportunitiesBatch(rawResults: TavilyResult[]) {
  const userContentHeader = 'Extract all scholarships and research opportunities from these raw web results:\n\n'
  const userContentData = JSON.stringify(rawResults.map(r => ({ url: r.url, snippet: r.content, title: r.title, content: r.content })))
  
  const { object } = await generateObject({
    model: openrouter.chat('google/gemini-2.0-flash-lite-preview-02-05:free'),
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userContentHeader + userContentData }
    ],
    schema: z.object({
      opportunities: z.array(elementSchema)
    }),
    temperature: 0.1,
  })

  return object.opportunities
}
