import * as React from "react"
import { Html, Head, Preview, Body, Container, Section, Text, Img, Link, Row, Column } from "@react-email/components"

type OfferDecisionEmailProps = {
  guestName: string
  activityTitle: string
  travelLabel: string
  amount: number
  status: "accepted" | "declined"
  listingUrl: string
  payUrl?: string
  imageUrl?: string | null
  logoUrl: string
}

function firstName(name: string) {
  const part = String(name || "").trim().split(/\s+/)[0]
  return part || "there"
}

function listingPhoto(url?: string | null) {
  if (!url || /\.(mp4|webm|mov)$/i.test(url)) return null
  return url
}

export function OfferDecisionEmail({
  guestName,
  activityTitle,
  travelLabel,
  amount,
  status,
  listingUrl,
  payUrl,
  imageUrl,
  logoUrl,
}: OfferDecisionEmailProps) {
  const accepted = status === "accepted"
  const photo = listingPhoto(imageUrl)
  const preview = accepted
    ? `Your offer for ${activityTitle} was accepted`
    : `Update on your offer for ${activityTitle}`

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={shell}>
          <Section style={header}>
            <Img src={logoUrl} alt="IslandFull" width="132" height="36" style={logo} />
          </Section>

          <Section style={card}>
            <Text style={kicker}>{accepted ? "Offer accepted" : "Offer update"}</Text>
            <Text style={heading}>
              {accepted ? `Great news, ${firstName(guestName)}` : `Thanks, ${firstName(guestName)}`}
            </Text>
            <Text style={bodyText}>
              {accepted
                ? "The host accepted your offer. Dates and guests are locked in — pay to confirm the trip."
                : "The host couldn’t take this price this time. You can still view the listing or send another offer."}
            </Text>

            <Section style={listingRow}>
              <Row>
                <Column style={{ width: "88px", verticalAlign: "top" }}>
                  {photo ? (
                    <Img src={photo} alt={activityTitle} width="88" height="88" style={thumb} />
                  ) : (
                    <Section style={thumbFallback}>&nbsp;</Section>
                  )}
                </Column>
                <Column style={{ verticalAlign: "middle", paddingLeft: "12px" }}>
                  <Text style={listingTitle}>{activityTitle}</Text>
                  <Text style={listingMeta}>{travelLabel}</Text>
                  <Text style={listingPrice}>
                    ${Number(amount).toFixed(0)} <span style={listingPriceHint}>your offer</span>
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={ctaWrap}>
              {accepted ? (
                <Link href={payUrl || listingUrl} style={ctaPay}>
                  Make payment
                </Link>
              ) : (
                <Link href={listingUrl} style={ctaGhost}>
                  View listing
                </Link>
              )}
            </Section>
          </Section>

          <Text style={footer}>
            IslandFull · Sri Lanka tours & stays
            <br />
            <Link href="https://islandfull.com" style={footerLink}>
              islandfull.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  padding: "24px 12px",
}

const shell = {
  maxWidth: "560px",
  margin: "0 auto",
}

const header = {
  textAlign: "center" as const,
  padding: "8px 0 20px",
}

const logo = {
  display: "inline-block",
  height: "32px",
  width: "auto",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "28px 24px 32px",
  border: "1px solid #e4e4e7",
}

const kicker = {
  margin: "0 0 8px",
  color: "#f43f5e",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
}

const heading = {
  margin: "0 0 10px",
  color: "#18181b",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "1.25",
}

const bodyText = {
  margin: "0 0 22px",
  color: "#52525b",
  fontSize: "15px",
  lineHeight: "1.55",
}

const listingRow = {
  backgroundColor: "#fafafa",
  borderRadius: "12px",
  padding: "10px",
  border: "1px solid #f4f4f5",
}

const thumb = {
  borderRadius: "10px",
  objectFit: "cover" as const,
  display: "block",
}

const thumbFallback = {
  width: "88px",
  height: "88px",
  backgroundColor: "#e4e4e7",
  borderRadius: "10px",
}

const listingTitle = {
  margin: "0 0 4px",
  color: "#18181b",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "1.3",
}

const listingMeta = {
  margin: "0 0 6px",
  color: "#71717a",
  fontSize: "13px",
}

const listingPrice = {
  margin: 0,
  color: "#18181b",
  fontSize: "18px",
  fontWeight: 700,
}

const listingPriceHint = {
  color: "#a1a1aa",
  fontSize: "12px",
  fontWeight: 600,
}

const ctaWrap = {
  textAlign: "center" as const,
  paddingTop: "24px",
}

const ctaPay = {
  display: "inline-block",
  backgroundColor: "#22c55e",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "13px 28px",
  borderRadius: "999px",
}

const ctaGhost = {
  display: "inline-block",
  backgroundColor: "#18181b",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "13px 28px",
  borderRadius: "999px",
}

const footer = {
  margin: "20px 8px 0",
  color: "#a1a1aa",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
}

const footerLink = {
  color: "#71717a",
  textDecoration: "none",
}

export default OfferDecisionEmail
