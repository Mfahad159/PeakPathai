/**
 * Gets the UTC date string (YYYY-MM-DD) of the Monday for the given date's week.
 * This guarantees consistency strictly in UTC across server, client, and cron jobs.
 */
export function getWeekStart(date?: Date | string | number): string {
  let now = date ? new Date(date) : new Date()

  // Fallback if invalid date provided
  if (isNaN(now.getTime())) {
    now = new Date()
  }

  const day = now.getUTCDay() // 0-6 in UTC (0 is Sunday)
  // Determine how many days to subtract to get back to Monday
  const daysToSubtract = day === 0 ? 6 : day - 1
  
  // Calculate the UTC date of the Monday
  const diff = now.getUTCDate() - daysToSubtract
  
  // Create a new Date strictly mapped to midnight UTC of that Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
  
  return monday.toISOString().split('T')[0]
}
