import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import { Opportunity } from '@/types'

interface OpportunitiesEmailProps {
  opportunities: Opportunity[]
  firstName: string
}

export const OpportunitiesEmail = ({
  opportunities,
  firstName,
}: OpportunitiesEmailProps) => {
  const previewText = `We found ${opportunities.length} new scholarships matching your profile`
  const year = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Peak<span style={{ color: '#ffffff' }}>Path</span>
            </Text>
          </Section>

          {/* Intro */}
          <Heading style={h1}>Good news, {firstName}</Heading>
          <Text style={text}>
            We just ran a deep AI scan and found <strong>{opportunities.length} new opportunities</strong> matching your background.
            See the top matches below:
          </Text>

          {/* Opportunities List */}
          <Section style={listSection}>
            {opportunities.map((opp, idx) => (
              <Section key={idx} style={card}>
                <Text style={cardTitle}>{opp.title}</Text>
                <Text style={cardProvider}>{opp.provider}</Text>

                <Section style={metaRow}>
                  <Text style={badge}>{opp.funding_type}</Text>
                  {opp.deadline && opp.deadline !== 'Not specified' && (
                    <Text style={metaText}>⏰ {opp.deadline}</Text>
                  )}
                  {opp.location && opp.location !== 'Not specified' && (
                    <Text style={metaText}>🌍 {opp.location}</Text>
                  )}
                </Section>

                <Text style={cardDesc}>{opp.description}</Text>

                {opp.source_url && (
                  <Link href={opp.source_url} style={button}>
                    View Details
                  </Link>
                )}
                {idx < opportunities.length - 1 && <Hr style={hr} />}
              </Section>
            ))}
          </Section>

          {/* Outro */}
          <Text style={text}>
            You can run more specific searches or update your preferences directly from your dashboard.
          </Text>
          <Section style={ctaSection}>
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`} style={mainButton}>
              Go to Dashboard
            </Link>
          </Section>

          {/* Footer */}
          <Hr style={footerHr} />
          <Text style={footerText}>
            © {year} PeakPath AI. Sent automatically for your recent search.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const main = {
  backgroundColor: '#0b0e1a', // matches dark navy theme
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: '0',
  padding: '40px 0',
}

const container = {
  margin: '0 auto',
  padding: '0 20px',
  maxWidth: '600px',
}

const header = {
  marginBottom: '32px',
}

const logo = {
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#fb923c', // orange-400
  border: '1px solid rgba(249, 115, 22, 0.4)',
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '4px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '800',
  margin: '0 0 16px',
}

const text = {
  color: '#a1a1aa', // zinc-400
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const listSection = {
  backgroundColor: '#121626', // slightly lighter navy for card background
  borderRadius: '12px',
  border: '1px solid #1f2937', // border-gray-800
  padding: '24px',
  marginBottom: '32px',
}

const card = {
  marginBottom: '16px',
}

const cardTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const cardProvider = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '0 0 12px',
}

const metaRow = {
  marginBottom: '12px',
}

const badge = {
  display: 'inline-block',
  backgroundColor: 'rgba(249, 115, 22, 0.1)',
  color: '#fb923c',
  border: '1px solid rgba(249, 115, 22, 0.2)',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: '600',
  marginRight: '12px',
  marginBottom: '8px',
}

const metaText = {
  display: 'inline-block',
  color: '#a1a1aa',
  fontSize: '13px',
  marginRight: '12px',
  marginBottom: '8px',
}

const cardDesc = {
  color: '#cbd5e1', // slate-300
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const button = {
  color: '#fb923c',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#1f2937',
  margin: '24px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const mainButton = {
  backgroundColor: '#f97316', // orange-500
  borderRadius: '8px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  fontWeight: '600',
  padding: '12px 24px',
}

const footerHr = {
  borderColor: '#1f2937',
  marginTop: '32px',
  marginBottom: '16px',
}

const footerText = {
  color: '#52525b', // zinc-600
  fontSize: '12px',
  textAlign: 'center' as const,
}
