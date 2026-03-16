export function stringifyToonArray(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return ''

  // 1. Extract headers (all unique keys across all objects)
  const headerSet = new Set<string>()
  for (const row of data) {
    for (const key of Object.keys(row)) {
      headerSet.add(key)
    }
  }
  const headers = Array.from(headerSet)

  // 2. Format headers
  const headerLine = headers.join(',')

  // 3. Format rows
  const rowLines = data.map(row => {
    return headers.map(header => {
      let val = row[header]
      
      if (val === null || val === undefined) {
        val = ''
      } else if (typeof val === 'object') {
        // Fallback for nested objects: stringify them
        val = JSON.stringify(val)
      } else {
        val = String(val)
      }

      // Escape quotes and wrap in quotes if there's a comma, newline, or quote
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`
      }
      return val
    }).join(',')
  })

  return [headerLine, ...rowLines].join('\n')
}

export function parseToonArray(toonString: string): Record<string, any>[] {
  if (!toonString || !toonString.trim()) return []

  // Simple CSV parser that handles quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            current += '"'
            i++ // Skip escaped quote
          } else {
            inQuotes = false
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }
    result.push(current)
    return result
  }

  // Split into lines considering quotes (newlines inside quotes are tricky, 
  // but for basic TOON, usually rows are newline separated at the top level).
  // A more robust way is to parse the whole string char by char.
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false
  
  for (let i = 0; i < toonString.length; i++) {
      const char = toonString[i]
      if (char === '"') {
          inQuotes = !inQuotes
          currentLine += char
      } else if (char === '\n' && !inQuotes) {
          if (currentLine.trim()) lines.push(currentLine)
          currentLine = ''
      } else {
          currentLine += char
      }
  }
  if (currentLine.trim()) lines.push(currentLine)

  if (lines.length < 2) return [] // Needs at least header and one row

  const headers = parseCSVLine(lines[0].trim())
  const result: Record<string, any>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i].trim())
    const row: Record<string, any> = {}
    
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j]
      const val = values[j] !== undefined ? values[j] : ''
      
      // Try to parse JSON back if it looks like an object/array, otherwise keep as string
      // or convert 'true'/'false'/numbers if needed. For this use case, strings are fine.
      row[key] = val
    }
    
    result.push(row)
  }

  return result
}
