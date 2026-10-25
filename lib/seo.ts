import type { Metadata } from "next"

export const SITE_URL = "https://islandfull.com"
export const SITE_NAME = "IslandFull"
export const SITE_TAGLINE = "Book tours, hotels, and private transport with local hosts in Sri Lanka."
export const DEFAULT_OG = "/og.jpg"

export function absUrl(path = "/") {
  if (path.startsWith("http")) return path
  const clean = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${clean}`
}

export function pageMeta({
  title,
  description,
  path,
  image = DEFAULT_OG,
  index = true,
  keywords,
}: {
  title: string
  description: string
  path: string
  image?: string
  index?: boolean
  keywords?: string[]
}): Metadata {
  const url = absUrl(path)
  const ogImage = image.startsWith("http") ? image : absUrl(image)
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  }
}

export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/icon.png"),
    image: absUrl(DEFAULT_OG),
    description: SITE_TAGLINE,
    email: "info@islandfull.com",
    telephone: "+447342573235",
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    priceRange: "$$",
    currenciesAccepted: "USD",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@islandfull.com",
        telephone: "+447342573235",
        availableLanguage: ["English"],
      },
    ],
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

export function serviceJsonLd({
  name,
  description,
  path,
  serviceType,
}: {
  name: string
  description: string
  path: string
  serviceType: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType,
    description,
    url: absUrl(path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    audience: { "@type": "Audience", audienceType: "International travelers" },
    offers: {
      "@type": "Offer",
      url: absUrl("/transport/plan"),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: "Send your own price to local car and van hosts. No payment until a host accepts.",
    },
  }
}
