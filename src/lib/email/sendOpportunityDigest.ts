import { Resend } from 'resend'
import { OpportunitiesEmail } from '@/components/emails/OpportunitiesEmail'
import { Opportunity } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOpportunityDigest(
  userEmail: string,
  firstName: string,
  opportunities: Opportunity[]
): Promise<void> {
  if (!opportunities || opportunities.length === 0) return

  try {
    const { data, error } = await resend.emails.send({
      from: 'PeakPath <notifications@demo.peakpath.ai>', // Update with verified domain
      to: [userEmail],
      subject: `Your weekly scholarship digest is ready — ${opportunities.length} new opportunities found`,
      react: OpportunitiesEmail({ opportunities, firstName }),
    })

    if (error) {
      console.error(`Resend API Error for ${userEmail}:`, error)
      return
    }

    console.log(`Digest correctly dispatched to ${userEmail} with ID ${data?.id}`)
  } catch (err) {
    console.error(`Failed executing sendOpportunityDigest to ${userEmail}:`, err)
  }
}
