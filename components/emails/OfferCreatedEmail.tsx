import * as React from "react"
import { Html, Head, Preview, Body, Container, Section, Text, Img, Link, Row, Column, Hr } from "@react-email/components"
import { formatStayMoney } from "@/lib/stay-price"

type OfferCreatedEmailProps = {
  variant: "guest" | "host"
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  listingTitle: string
  listingUrl: string
  travelLabel: string
  checkIn?: string | null
  checkOut?: string | null
  guests: number
  listTotal: number
  offerTotal: number
  rateSuffix?: string
  listRate?: number
  offerRate?: number
  notes?: string | null
  imageUrl?: string | null
  logoUrl: string
  acceptUrl?: string
  declineUrl?: string
}

function firstName(name: string) {
  return String(name || "").trim().split(/\s+/)[0] || "there"
}

function listingPhoto(url?: string | null) {
  if (!url || /\.(mp4|webm|mov)$/i.test(url)) return null
  return url
}

export function OfferCreatedEmail({
  variant,
  guestName,
  guestEmail,
  guestPhone,
  listingTitle,
  listingUrl,
  travelLabel,
  checkIn,
  checkOut,
  guests,
  listTotal,
  offerTotal,
  rateSuffix,
  listRate,
  offerRate,
  notes,
  imageUrl,
  logoUrl,
  acceptUrl,
  declineUrl,
}: OfferCreatedEmailProps) {
  const host = variant === "host"
  const photo = listingPhoto(imageUrl)
  const shortName = firstName(guestName)
  const guestLabel = guests === 1 ? "1 guest" : `${guests} guests`
  const showRates = Boolean(rateSuffix && rateSuffix !== "total" && (listRate || offerRate))
  const preview = host
    ? `New offer on ${listingTitle} — ${formatStayMoney(offerTotal)}`
    : `We received your offer for ${listingTitle}`

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
              <Text style={kicker}>{host ? "New offer" : "Offer received"}</Text>
              <Text style={heading}>
                {host ? `${shortName} made an offer` : `We've got it, ${shortName}`}
              </Text>
              <Text style={bodyText}>
                {host
                  ? `A guest wants to stay at ${listingTitle}. Review the details and accept or decline below — you'll confirm on the next page so nothing is actioned by accident.`
                  : `Thanks for your offer on ${listingTitle}. We'll email you as soon as the host responds. No payment is needed yet.`}
              </Text>

              <Section style={listingRow}>
                <Row>
                  <Column style={{ width: "88px", verticalAlign: "top" }}>
                    {photo ? (
                      <Img src={photo} alt={listingTitle} width="88" height="88" style={thumb} />
                    ) : (
                      <Section style={thumbFallback}>&nbsp;</Section>
                    )}
                  </Column>
                  <Column style={{ verticalAlign: "middle", paddingLeft: "12px" }}>
                    <Text style={listingTitleText}>{listingTitle}</Text>
                    {checkIn && checkOut ? (
                      <>
                        <Text style={listingMeta}>Check-in {checkIn}</Text>
                        <Text style={listingMeta}>Checkout {checkOut}</Text>
                      </>
                    ) : (
                      <Text style={listingMeta}>{travelLabel}</Text>
                    )}
                    <Text style={listingMeta}>{guestLabel}</Text>
                  </Column>
                </Row>
              </Section>

              <Section style={priceBox}>
                <Row>
                  <Column>
                    <Text style={priceLabel}>Listed stay</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={priceValue}>{formatStayMoney(listTotal)}</Text>
                  </Column>
                </Row>
                {showRates ? (
                  <Text style={rateHint}>{formatStayMoney(listRate || 0)} {rateSuffix}</Text>
                ) : null}
                <Hr style={priceRule} />
                <Row>
                  <Column>
                    <Text style={offerLabel}>{host ? "Their offer" : "Your offer"}</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={offerValue}>{formatStayMoney(offerTotal)}</Text>
                  </Column>
                </Row>
                {showRates ? (
                  <Text style={rateHint}>{formatStayMoney(offerRate || 0)} {rateSuffix}</Text>
                ) : null}
              </Section>

              {host ? (
                <Section style={guestBox}>
                  <Text style={guestHeading}>Guest</Text>
                  <Text style={guestLine}>{guestName}</Text>
                  <Text style={guestLine}>{guestEmail}</Text>
                  {guestPhone ? <Text style={guestLine}>{guestPhone}</Text> : null}
                  {notes ? <Text style={notesLine}>{notes}</Text> : null}
                </Section>
              ) : notes ? (
                <Text style={notesGuest}>Your note: {notes}</Text>
              ) : null}

              <Section style={ctaWrap}>
                {host && acceptUrl && declineUrl ? (
                  <>
                    <Link href={acceptUrl} style={ctaAccept}>
                      Accept offer
                    </Link>
                    <Link href={declineUrl} style={ctaDecline}>
                      Decline
                    </Link>
                  </>
                ) : (
                  <Link href={listingUrl} style={ctaView}>
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
  margin: "0 0 20px",
  color: "#52525b",
  fontSize: "15px",
  lineHeight: "1.55",
}

const listingRow = {
  backgroundColor: "#fafafa",
  borderRadius: "12px",
  padding: "10px",
  border: "1px solid #f4f4f5",
  marginBottom: "14px",
}

const listingTitleText = {
  margin: "0 0 4px",
  color: "#18181b",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "1.3",
}

const listingMeta = {
  margin: "0 0 3px",
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "1.4",
}

const priceBox = {
  border: "1px solid #e4e4e7",
  borderRadius: "12px",
  padding: "12px 16px 14px",
  marginBottom: "16px",
}

const priceLabel = {
  margin: "0",
  color: "#71717a",
  fontSize: "13px",
}

const priceValue = {
  margin: "0",
  color: "#18181b",
  fontSize: "15px",
  fontWeight: 600,
}

const offerLabel = {
  margin: "0",
  color: "#18181b",
  fontSize: "14px",
  fontWeight: 700,
}

const offerValue = {
  margin: "0",
  color: "#18181b",
  fontSize: "18px",
  fontWeight: 700,
}

const rateHint = {
  margin: "2px 0 0",
  color: "#a1a1aa",
  fontSize: "12px",
  textAlign: "right" as const,
}

const priceRule = {
  borderColor: "#f4f4f5",
  margin: "10px 0",
}

const guestBox = {
  backgroundColor: "#fff7ed",
  border: "1px solid #ffedd5",
  borderRadius: "12px",
  padding: "12px 16px",
  marginBottom: "8px",
}

const guestHeading = {
  margin: "0 0 6px",
  color: "#c2410c",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
}

const guestLine = {
  margin: "0 0 2px",
  color: "#18181b",
  fontSize: "14px",
}

const notesLine = {
  margin: "8px 0 0",
  color: "#52525b",
  fontSize: "13px",
  lineHeight: "1.45",
}

const notesGuest = {
  margin: "0 0 8px",
  color: "#71717a",
  fontSize: "13px",
}

const ctaWrap = {
  textAlign: "center" as const,
  paddingTop: "16px",
}

const ctaView = {
  display: "inline-block",
  backgroundColor: "#f43f5e",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "13px 28px",
  borderRadius: "999px",
}

const ctaAccept = {
  display: "inline-block",
  backgroundColor: "#059669",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "13px 22px",
  borderRadius: "999px",
  marginRight: "8px",
}

const ctaDecline = {
  display: "inline-block",
  backgroundColor: "#18181b",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "13px 22px",
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

export default OfferCreatedEmail
