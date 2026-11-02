import * as React from "react"
import { Html, Head, Preview, Body, Container, Section, Text, Img, Link, Row, Column } from "@react-email/components"

const LIVE = "https://islandfull.com"
const HERO_FILE = "logo%20main%20graphic.png"

type Listing = {
  title: string
  location: string
  href: string
  image: string
  offer?: boolean
  price?: string
}

const LISTINGS: Listing[] = [
  {
    title: "Classic Colombo Heritage Jeep Tour",
    location: "Colombo",
    href: `${LIVE}/activity/classic-colombo-heritage-jeep-tour`,
    image: "https://res.cloudinary.com/dxqu7vfat/image/upload/f_auto,q_auto,w_600,h_400,c_fill/v1792944574/islandfull_tours/wt830lohevcxksow5kn2.jpg",
    offer: true,
  },
  {
    title: "Air Tour See Sri Lanka from the Skys",
    location: "Colombo",
    href: `${LIVE}/activity/air-tour-see-sri-lanka-from-the-skys`,
    image: "https://res.cloudinary.com/dxqu7vfat/image/upload/f_auto,q_auto,w_600,h_400,c_fill/v1791673609/islandfull_tours/t7ab9qaitie7wdwcy9rh.jpg",
    price: "$65 / person",
  },
  {
    title: "The Great Elephant Corridor Safari",
    location: "Kaudulla",
    href: `${LIVE}/activity/the-great-elephant-corridor-safari`,
    image: "https://images.pexels.com/photos/321526/pexels-photo-321526.jpeg?auto=compress&cs=tinysrgb&w=600",
    offer: true,
  },
  {
    title: "Kandy Sacred Heritage E-Bike Tour",
    location: "Kandy",
    href: `${LIVE}/activity/kandy-sacred-heritage-e-bike-tour`,
    image: "https://res.cloudinary.com/dxqu7vfat/image/upload/f_auto,q_auto,w_600,h_400,c_fill/v1791745920/islandfull_tours/swflf16rjx2yvnkjlbo7.jpg",
    price: "4 hours",
  },
]

function ListingCard({ item }: { item: Listing }) {
  return (
    <Column style={cardCol}>
      <Link href={item.href} style={{ textDecoration: "none" }}>
        <Img src={item.image} alt="" width="248" height="160" style={cardPhoto} />
        {item.offer ? (
          <Section style={offerOver}>
            <Text style={offerPill}>Make offer</Text>
          </Section>
        ) : (
          <Section style={{ height: "10px" }} />
        )}
        <Text style={cardTitle}>{item.title}</Text>
        <Text style={cardMeta}>
          {item.location}
          {item.price ? ` · ${item.price}` : ""}
        </Text>
      </Link>
    </Column>
  )
}

export function IntroIslandFullEmail({
  firstName = "there",
  assetBase = LIVE,
}: {
  firstName?: string
  assetBase?: string
}) {
  const name = firstName.trim() || "there"
  const logoDark = `${assetBase}/logo_dark.png`
  const collage = `${assetBase}/${HERO_FILE}`

  return (
    <Html>
      <Head />
      <Preview>Tours and private drivers in Sri Lanka. Some you book at the listed rate. Some you make an offer on.</Preview>
      <Body style={main}>
        <Container style={shell}>
          <Section style={topBar}>
            <Text style={topTitle}>We Simplified Sri Lanka</Text>
          </Section>

          <Section style={hero}>
            <Img src={collage} alt="Sri Lanka with IslandFull" width="560" height="560" style={heroImg} />
          </Section>

          <Section style={letter}>
            <Text style={kicker}>IslandFull</Text>
            <Text style={headline}>Tours and private transport in Sri Lanka</Text>
            <Text style={subhead}>Some book at the listed rate. Some take an offer.</Text>
            <Text style={body}>Hi {name},</Text>
            <Text style={body}>
              IslandFull is a marketplace for tours and private drivers in Sri Lanka. Hosts are local. You pick the day, then book or make an offer.
            </Text>
            <Text style={body}>
              On listings with <span style={inlineOffer}>Make offer</span>, you can send an offer to the host.
            </Text>
          </Section>

          <Section style={gridPad}>
            <Row>
              <ListingCard item={LISTINGS[0]} />
              <ListingCard item={LISTINGS[1]} />
            </Row>
            <Row>
              <ListingCard item={LISTINGS[2]} />
              <ListingCard item={LISTINGS[3]} />
            </Row>
          </Section>

          <Section style={ctaBand}>
            <Text style={ctaLine}>Continue on IslandFull</Text>
            <Link href={`${LIVE}/?vertical=tour`} style={cta}>
              Make offer
            </Link>
            <Text style={ctaHint}>Browse tours and private routes on the site.</Text>
          </Section>

          <Section style={bottomBar}>
            <Img src={logoDark} alt="IslandFull" width="140" height="30" style={logoOnLight} />
            <Text style={footerTag}>Tours and private drivers · Sri Lanka</Text>
            <Text style={footer}>
              <Link href={LIVE} style={footerLink}>
                islandfull.com
              </Link>
              {" · "}
              <Link href="mailto:info@islandfull.com" style={footerLink}>
                info@islandfull.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default IntroIslandFullEmail

const main = {
  backgroundColor: "#ececec",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  padding: "20px 12px 40px",
}

const shell = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  overflow: "hidden" as const,
}

const topBar = {
  backgroundColor: "#f43f5e",
  textAlign: "center" as const,
  padding: "18px 24px",
}

const topTitle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  lineHeight: "1.3",
}

const hero = {
  backgroundColor: "#ffffff",
  padding: "12px 20px 0",
  textAlign: "center" as const,
}

const heroImg = {
  width: "100%",
  maxWidth: "520px",
  height: "auto",
  display: "inline-block",
}

const letter = {
  padding: "4px 32px 12px",
}

const kicker = {
  margin: "16px 0 10px",
  color: "#a1a1aa",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
}

const headline = {
  margin: "0 0 8px",
  color: "#3f3f46",
  fontSize: "24px",
  fontWeight: 600,
  lineHeight: "1.3",
}

const subhead = {
  margin: "0 0 20px",
  color: "#a1a1aa",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "1.5",
}

const body = {
  margin: "0 0 12px",
  color: "#52525b",
  fontSize: "15px",
  lineHeight: "1.6",
}

const inlineOffer = {
  display: "inline-block",
  backgroundColor: "#FFC72C",
  color: "#18181b",
  fontSize: "11px",
  fontWeight: 600,
  padding: "1px 10px",
  borderRadius: "999px",
  lineHeight: "22px",
}

const gridPad = {
  padding: "4px 16px 8px",
}

const cardCol = {
  width: "50%",
  padding: "8px 6px 18px",
  verticalAlign: "top" as const,
}

const cardPhoto = {
  width: "100%",
  height: "158px",
  objectFit: "cover" as const,
  borderRadius: "12px",
  display: "block",
}

const offerOver = {
  textAlign: "right" as const,
  marginTop: "-36px",
  marginRight: "8px",
  marginBottom: "12px",
  padding: "0",
}

const offerPill = {
  display: "inline-block",
  backgroundColor: "#FFC72C",
  color: "#18181b",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: "26px",
  padding: "0 12px",
  borderRadius: "999px",
  margin: "0",
}

const cardTitle = {
  margin: "0 0 3px",
  color: "#18181b",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "1.35",
}

const cardMeta = {
  margin: "0",
  color: "#71717a",
  fontSize: "12px",
}

const ctaBand = {
  backgroundColor: "#111111",
  textAlign: "center" as const,
  padding: "28px 24px 32px",
}

const ctaLine = {
  margin: "0 0 14px",
  color: "#d4d4d8",
  fontSize: "14px",
  fontWeight: 400,
  letterSpacing: "0.04em",
}

const cta = {
  display: "inline-block",
  backgroundColor: "#FFC72C",
  color: "#18181b",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  lineHeight: "40px",
  padding: "0 22px",
  borderRadius: "999px",
}

const ctaHint = {
  margin: "14px 0 0",
  color: "#a1a1aa",
  fontSize: "13px",
}

const bottomBar = {
  backgroundColor: "#ffffff",
  textAlign: "center" as const,
  padding: "24px 20px 20px",
}

const logoOnLight = {
  display: "inline-block",
  height: "24px",
  width: "auto",
}

const footerTag = {
  margin: "10px 0 0",
  color: "#a1a1aa",
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: "0.02em",
}

const footer = {
  margin: "6px 0 0",
  color: "#a1a1aa",
  fontSize: "12px",
}

const footerLink = {
  color: "#71717a",
  textDecoration: "none",
}
