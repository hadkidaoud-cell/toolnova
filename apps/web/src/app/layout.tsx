import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/i18n";
import { PlanProvider } from "@/components/billing/plan-provider";
import { MetaManager } from "@/components/layout/meta-manager";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://toolnova.com";

const SITE_NAME = "ToolNova";
const SITE_TITLE = "ToolNova - Every Tool. One Place.";
const SITE_DESCRIPTION =
  "Discover hundreds of free online tools. Image editors, text processors, calculators, converters, and more.";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: SITE_NAME,
      alternateName: "ToolNova Tools",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${APP_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: SITE_NAME,
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | ToolNova",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  keywords: [
    "free online tools",
    "webp converter",
    "image converter",
    "image compressor",
    "pdf tools",
    "text tools",
    "calculators",
    "data format converter",
    "thumbnail maker",
    "background remover",
  ],
  authors: [{ name: SITE_NAME, url: APP_URL }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: APP_URL,
    locale: "en_US",
    alternateLocale: ["ar_SA", "fr_FR", "es_ES", "pt_PT"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <LanguageProvider>
          <MetaManager />
          <PlanProvider>
            <Header />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
          </PlanProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
