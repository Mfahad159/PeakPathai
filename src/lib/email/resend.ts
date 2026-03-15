import { Resend } from 'resend'

// Provide a dummy fallback so the whole server module doesn't crash if omitted by user
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback')
