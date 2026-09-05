import type { Metadata, Viewport } from "next";
// Self-hosted via @fontsource (no runtime/build-time call to Google Fonts —
// this environment's network doesn't allow it, and self-hosting is also
// generally better for performance/privacy in production anyway).
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Providers from "@/components/Providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Asian Traders | Hardware & Building Materials Store, Manalmedu",
    template: "%s | Asian Traders Manalmedu",
  },
  description:
    "Asian Traders, Manalmedu is a one-stop hardware and building-materials shop offering paints, pipes, plumbing, electrical, tools and construction supplies from trusted brands. Everything you need to build your home, under one roof.",
  keywords: [
    "Asian Traders Manalmedu",
    "hardware shop in Manalmedu",
    "building materials in Manalmedu",
    "paint shop in Manalmedu",
    "hardware store near Manalmedu",
    "construction materials Manalmedu",
  ],
  openGraph: {
    title: "Asian Traders | Hardware & Building Materials Store, Manalmedu",
    description:
      "Everything you need to build your home, under one roof — paints, pipes, plumbing, electrical, tools & construction supplies.",
    url: SITE_URL,
    siteName: "Asian Traders",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: "Asian Traders",
  image: `${SITE_URL}/logo.png`,
  "@id": SITE_URL,
  url: SITE_URL,
  telephone: "+919442425301",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Manalmedu",
    addressLocality: "Manalmedu",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "20:30",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="font-body antialiased overflow-x-hidden">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
